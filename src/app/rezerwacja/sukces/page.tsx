import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function RezerwacjaSukces() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-brand-text mb-3">Rezerwacja potwierdzona!</h1>
        <p className="text-brand-text-secondary mb-8">
          Szczegóły wysłaliśmy na Twój adres e-mail.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/konto" className="px-6 py-3 bg-brand-copper text-brand-black font-bold rounded-md">Moje konto</Link>
          <Link href="/grafik" className="px-6 py-3 border border-brand-border text-brand-text rounded-md">Wróć do grafiku</Link>
        </div>
      </div>
    </div>
  )
}
