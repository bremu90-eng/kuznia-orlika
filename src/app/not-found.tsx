import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gradient-copper mb-4">404</div>
        <h1 className="text-2xl font-black text-brand-text mb-3">Strona nie istnieje</h1>
        <p className="text-brand-text-secondary mb-8">Nie znaleźliśmy tego, czego szukasz.</p>
        <Link href="/" className="px-6 py-3 bg-brand-copper text-brand-black font-bold rounded-md hover:bg-brand-copper-light transition-colors">
          Wróć do strony głównej
        </Link>
      </div>
    </div>
  )
}
