'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { resetPassword } from '@/actions/auth'

export default function ResetHasla() {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const result = await resetPassword(new FormData(e.currentTarget))
    setPending(false)
    if (result?.error) toast.error(result.error)
    else setSent(true)
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
        {sent ? (
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-black text-brand-text mb-3">Sprawdź e-mail</h1>
            <p className="text-brand-text-secondary text-sm">Jeśli podany adres istnieje, wysłaliśmy link do resetowania hasła.</p>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-brand-text mb-2">Reset hasła</h1>
              <p className="text-brand-text-secondary text-sm">Podaj e-mail — wyślemy link do zresetowania hasła.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input name="email" type="email" required
                className="w-full bg-brand-graphite border border-brand-border rounded-md px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="jan@example.com" />
              <button type="submit" disabled={pending}
                className="py-3 bg-brand-copper text-brand-black font-bold rounded-md hover:bg-brand-copper-light transition-colors disabled:opacity-60">
                {pending ? 'Wysyłam...' : 'Wyślij link resetujący'}
              </button>
              <Link href="/logowanie" className="text-center text-sm text-brand-copper hover:text-brand-copper-light transition-colors">
                Wróć do logowania
              </Link>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
