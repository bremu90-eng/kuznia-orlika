CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('client', 'trainer', 'admin');
CREATE TYPE session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'cancelled_client', 'cancelled_studio', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled');
CREATE TYPE payment_type AS ENUM ('deposit_full', 'deposit_partial', 'full_payment');
CREATE TYPE deposit_policy AS ENUM ('full_100', 'partial_25');
CREATE TYPE class_category AS ENUM ('personal', 'duet', 'group_small', 'group_large');
CREATE TYPE refund_status AS ENUM ('none', 'pending', 'issued', 'failed');

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  phone         TEXT,
  birth_date    DATE,
  role          user_role NOT NULL DEFAULT 'client',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trainers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  slug          TEXT NOT NULL UNIQUE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  bio           TEXT,
  specialty     TEXT[],
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE class_types (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  description         TEXT,
  category            class_category NOT NULL,
  duration_minutes    INT NOT NULL DEFAULT 60,
  max_capacity        INT NOT NULL DEFAULT 1,
  base_price          NUMERIC(10,2) NOT NULL,
  deposit_policy      deposit_policy NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  sort_order          INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_type_id     UUID NOT NULL REFERENCES class_types(id) ON DELETE RESTRICT,
  trainer_id        UUID NOT NULL REFERENCES trainers(id) ON DELETE RESTRICT,
  title             TEXT,
  description       TEXT,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  max_capacity      INT NOT NULL,
  price             NUMERIC(10,2) NOT NULL,
  status            session_status NOT NULL DEFAULT 'scheduled',
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_times CHECK (ends_at > starts_at)
);

CREATE TABLE bookings (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id                      UUID NOT NULL REFERENCES sessions(id) ON DELETE RESTRICT,
  client_id                       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status                          booking_status NOT NULL DEFAULT 'pending_payment',
  booking_amount                  NUMERIC(10,2) NOT NULL,
  deposit_amount                  NUMERIC(10,2) NOT NULL,
  refund_amount                   NUMERIC(10,2),
  cancellation_policy_snapshot    JSONB NOT NULL DEFAULT '{}'::jsonb,
  cancellation_reason             TEXT,
  cancelled_at                    TIMESTAMPTZ,
  refund_status                   refund_status NOT NULL DEFAULT 'none',
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_booking UNIQUE (session_id, client_id)
);

CREATE TABLE payments (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id                  UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  stripe_payment_intent_id    TEXT UNIQUE,
  stripe_checkout_session_id  TEXT UNIQUE,
  amount                      NUMERIC(10,2) NOT NULL,
  currency                    TEXT NOT NULL DEFAULT 'pln',
  status                      payment_status NOT NULL DEFAULT 'pending',
  payment_type                payment_type NOT NULL,
  refund_status               refund_status NOT NULL DEFAULT 'none',
  refunded_amount             NUMERIC(10,2) DEFAULT 0,
  stripe_refund_id            TEXT,
  metadata                    JSONB DEFAULT '{}'::jsonb,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient   TEXT NOT NULL,
  template    TEXT NOT NULL,
  subject     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'sent',
  resend_id   TEXT,
  related_id  UUID,
  error_msg   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contact_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeksy
CREATE INDEX idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_stripe_cs ON payments(stripe_checkout_session_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_trainers_updated_at    BEFORE UPDATE ON trainers    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_class_types_updated_at BEFORE UPDATE ON class_types FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sessions_updated_at    BEFORE UPDATE ON sessions    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_updated_at    BEFORE UPDATE ON bookings    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at    BEFORE UPDATE ON payments    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Dostępne miejsca
CREATE OR REPLACE FUNCTION get_available_spots(p_session_id UUID) RETURNS INT AS $$
DECLARE v_max INT; v_booked INT;
BEGIN
  SELECT max_capacity INTO v_max FROM sessions WHERE id = p_session_id;
  SELECT COUNT(*) INTO v_booked FROM bookings
  WHERE session_id = p_session_id
    AND status NOT IN ('cancelled_client', 'cancelled_studio', 'no_show');
  RETURN GREATEST(v_max - v_booked, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Atomowe tworzenie rezerwacji
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_session_id UUID, p_client_id UUID,
  p_booking_amount NUMERIC, p_deposit_amount NUMERIC,
  p_policy_snapshot JSONB
) RETURNS bookings AS $$
DECLARE v_spots INT; v_booking bookings;
BEGIN
  SELECT get_available_spots(p_session_id) INTO v_spots;
  IF v_spots <= 0 THEN RAISE EXCEPTION 'NO_SPOTS_AVAILABLE'; END IF;
  INSERT INTO bookings (session_id, client_id, status, booking_amount, deposit_amount, cancellation_policy_snapshot)
  VALUES (p_session_id, p_client_id, 'pending_payment', p_booking_amount, p_deposit_amount, p_policy_snapshot)
  RETURNING * INTO v_booking;
  RETURN v_booking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Oblicz refund
CREATE OR REPLACE FUNCTION calculate_refund(p_booking_id UUID) RETURNS NUMERIC AS $$
DECLARE v_booking bookings; v_session sessions; v_hours NUMERIC;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  SELECT * INTO v_session FROM sessions WHERE id = v_booking.session_id;
  v_hours := EXTRACT(EPOCH FROM (v_session.starts_at - now())) / 3600;
  IF v_hours > 10 THEN RETURN v_booking.deposit_amount;
  ELSE RETURN ROUND(v_booking.deposit_amount * 0.5, 2);
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper rola
CREATE OR REPLACE FUNCTION auth_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;
