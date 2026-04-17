'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '@/actions/auth'

export default function Logowanie() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const result = await login(new FormData(e.currentTarget))
    setPending(false)
    if (result?.error) toast.error(result.error)
  }

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
            <h1 className="text-2xl font-black text-brand-text mb-2">Witaj z powrotem</h1>
            <p className="text-brand-text-secondary text-sm">
              Nie masz konta?{' '}
              <Link href="/rejestracja" className="text-brand-copper hover:text-brand-copper-light transition-colors">Zarejestruj się</Link>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">E-mail</label>
              <input name="email" type="email" required autoComplete="email"
                className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm placeholder-brand-text-muted focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="jan@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-brand-text-secondary">Hasło</label>
                <Link href="/reset-hasla" className="text-xs text-brand-copper hover:text-brand-copper-light transition-colors">Zapomniałeś hasła?</Link>
              </div>
              <input name="password" type="password" required autoComplete="current-password"
                className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm placeholder-brand-text-muted focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={pending}
              className="mt-2 py-3 bg-brand-copper text-brand-black font-bold rounded-md hover:bg-brand-copper-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {pending ? 'Loguję...' : 'Zaloguj się'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
