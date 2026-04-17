ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles: own read" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles: trainer/admin read all" ON profiles FOR SELECT USING (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "profiles: own update" ON profiles FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "profiles: admin update" ON profiles FOR UPDATE USING (auth_role() = 'admin');
CREATE POLICY "profiles: service insert" ON profiles FOR INSERT WITH CHECK (true);

-- TRAINERS
CREATE POLICY "trainers: public read active" ON trainers FOR SELECT USING (is_active = true);
CREATE POLICY "trainers: trainer/admin read all" ON trainers FOR SELECT USING (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "trainers: admin write" ON trainers FOR ALL USING (auth_role() = 'admin') WITH CHECK (auth_role() = 'admin');

-- CLASS_TYPES
CREATE POLICY "class_types: public read active" ON class_types FOR SELECT USING (is_active = true);
CREATE POLICY "class_types: trainer/admin read all" ON class_types FOR SELECT USING (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "class_types: admin write" ON class_types FOR ALL USING (auth_role() = 'admin') WITH CHECK (auth_role() = 'admin');

-- SESSIONS
CREATE POLICY "sessions: public read scheduled" ON sessions FOR SELECT
  USING (status = 'scheduled' AND starts_at > now());
CREATE POLICY "sessions: trainer/admin read all" ON sessions FOR SELECT USING (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "sessions: trainer/admin insert" ON sessions FOR INSERT WITH CHECK (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "sessions: trainer/admin update" ON sessions FOR UPDATE USING (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "sessions: admin delete" ON sessions FOR DELETE USING (auth_role() = 'admin');

-- BOOKINGS
CREATE POLICY "bookings: own read" ON bookings FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "bookings: trainer/admin read all" ON bookings FOR SELECT USING (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "bookings: client insert own" ON bookings FOR INSERT
  WITH CHECK (client_id = auth.uid() AND auth_role() = 'client');
CREATE POLICY "bookings: client cancel own" ON bookings FOR UPDATE
  USING (client_id = auth.uid() AND status IN ('pending_payment', 'confirmed'))
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "bookings: trainer/admin update" ON bookings FOR UPDATE USING (auth_role() IN ('trainer', 'admin'));
CREATE POLICY "bookings: admin delete" ON bookings FOR DELETE USING (auth_role() = 'admin');

-- PAYMENTS
CREATE POLICY "payments: own read" ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.client_id = auth.uid()));
CREATE POLICY "payments: trainer/admin read" ON payments FOR SELECT USING (auth_role() IN ('trainer', 'admin'));

-- EMAIL_LOGS
CREATE POLICY "email_logs: admin only" ON email_logs FOR ALL
  USING (auth_role() = 'admin') WITH CHECK (auth_role() = 'admin');

-- CONTACT_MESSAGES
CREATE POLICY "contact: public insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact: admin/trainer read" ON contact_messages FOR SELECT USING (auth_role() IN ('admin', 'trainer'));
CREATE POLICY "contact: admin update" ON contact_messages FOR UPDATE USING (auth_role() = 'admin');
