'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { register } from '@/actions/auth'

export default function Rejestracja() {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const result = await register(new FormData(e.currentTarget))
    setPending(false)
    if (result?.error) toast.error(result.error)
    else if (result?.success) setDone(result.email ?? '')
  }

  if (done) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">✉️</div>
        <h1 className="text-2xl font-black text-brand-text mb-3">Sprawdź swoją skrzynkę</h1>
        <p className="text-brand-text-secondary mb-2">Wysłaliśmy link potwierdzający na:</p>
        <p className="text-brand-copper font-semibold mb-6">{done}</p>
        <p className="text-sm text-brand-text-muted">Po kliknięciu w link zostaniesz przekierowany do konta.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-copper rounded-sm flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-brand-black" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-brand-text text-sm">KUŹNIA ORLIKA</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-brand-text mb-2">Utwórz konto</h1>
            <p className="text-brand-text-secondary text-sm">
              Masz już konto?{' '}
              <Link href="/logowanie" className="text-brand-copper hover:text-brand-copper-light transition-colors">Zaloguj się</Link>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Imię *</label>
                <input name="firstName" type="text" required
                  className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-copper transition-colors"
                  placeholder="Jan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Nazwisko *</label>
                <input name="lastName" type="text" required
                  className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-copper transition-colors"
                  placeholder="Kowalski" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">E-mail *</label>
              <input name="email" type="email" required
                className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="jan@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Telefon</label>
              <input name="phone" type="tel"
                className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="+48 500 000 000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Data urodzenia</label>
              <input name="birthDate" type="date"
                className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-copper transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Hasło *</label>
              <input name="password" type="password" required minLength={8}
                className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="Minimum 8 znaków" />
            </div>
            <button type="submit" disabled={pending}
              className="mt-2 py-3 bg-brand-copper text-brand-black font-bold rounded-md hover:bg-brand-copper-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {pending ? 'Tworzę konto...' : 'Utwórz konto'}
            </button>
            <p className="text-xs text-brand-text-muted text-center">
              Rejestrując się, akceptujesz{' '}
              <Link href="/regulamin" className="text-brand-copper">Regulamin</Link>{' '}i{' '}
              <Link href="/polityka-prywatnosci" className="text-brand-copper">Politykę prywatności</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
