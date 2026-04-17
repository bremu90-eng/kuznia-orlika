import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PlatnoscAnulowano() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-brand-text mb-3">Płatność anulowana</h1>
        <p className="text-brand-text-secondary mb-8">Rezerwacja nie została potwierdzona. Zaliczka nie została pobrana.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/grafik" className="px-6 py-3 bg-brand-copper text-brand-black font-bold rounded-md">Wróć do grafiku</Link>
          <Link href="/kontakt" className="px-6 py-3 border border-brand-border text-brand-text rounded-md">Skontaktuj się</Link>
        </div>
      </div>
    </div>
  )
}
