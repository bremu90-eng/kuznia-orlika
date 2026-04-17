import Link from 'next/link'

export default function PotwierdzEmail() {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">✉️</div>
        <h1 className="text-2xl font-black text-brand-text mb-3">
          Sprawdź swoją skrzynkę
        </h1>
        <p className="text-brand-text-secondary mb-6">
          Wysłaliśmy link potwierdzający. Kliknij w niego żeby aktywować konto.
        </p>
        <Link
          href="/logowanie"
          className="text-brand-copper hover:text-brand-copper-light transition-colors text-sm"
        >
          Wróć do logowania
        </Link>
      </div>
    </div>
  )
}
