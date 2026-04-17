# Kuźnia Orlika — Studio Treningowe

Premium studio treningowe zbudowane na Next.js 15, Supabase, Stripe i Resend.

## Szybki start

### 1. Sklonuj repo i zainstaluj zależności

```bash
git clone https://github.com/TWOJE-REPO/kuznia-orlika.git
cd kuznia-orlika
npm install
```

### 2. Skonfiguruj zmienne środowiskowe

```bash
cp .env.example .env.local
```

Uzupełnij `.env.local` kluczami z Supabase, Stripe i Resend.

### 3. Uruchom lokalnie

```bash
npm run dev
```

Otwórz http://localhost:3000

---

## Wdrożenie bazy danych (Supabase)

W Supabase Dashboard → SQL Editor, uruchom kolejno:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`  
3. `supabase/migrations/003_seed.sql`

---

## Struktura katalogów

```
src/
├── app/
│   ├── (public)/          ← strona główna, oferta, grafik, kontakt
│   ├── (auth)/            ← logowanie, rejestracja, reset hasła
│   ├── (client)/          ← panel klienta, zapisy
│   ├── (panel)/           ← panel trainer/admin
│   └── api/               ← Stripe webhook, Auth callback
├── components/
│   ├── layout/            ← Header, Footer, Panel sidebar
│   └── sections/          ← sekcje strony głównej
├── lib/                   ← Supabase, Stripe, Resend, utils
├── actions/               ← Server Actions
├── types/                 ← TypeScript types
└── validations/           ← Zod schemas
```

## Pierwszy admin

Po rejestracji pierwszego konta, w Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'UUID-UZYTKOWNIKA';
```

## Stack

- **Next.js 15** — App Router, Server Actions
- **Supabase** — PostgreSQL, Auth, RLS, Storage
- **Stripe** — Checkout, Webhooks, Refunds
- **Resend** — Maile transakcyjne PL
- **Vercel** — Deployment
