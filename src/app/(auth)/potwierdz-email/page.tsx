import Link from 'next/link'

export default function PotwierdEmailPage({ searchParams }: { searchParams: { error?: string } }) {
  const hasError = searchParams.error === '1'
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">{hasError ? '❌' : '✉️'}</div>
        <h1 className="text-2xl font-black text-brand-text mb-3">
          {hasError ? 'Błąd potwierdzenia' : 'Sprawdź swoją skrzynkę'}
        </h1>
        <p className="text-brand-text-secondary mb-6 text-sm">
          {hasError
            ? 'Link potwierdzający wygasł lub jest nieprawidłowy. Spróbuj się zarejestrować ponownie.'
            : 'Kliknij w link potwierdzający w e-mailu, który wysłaliśmy. Po kliknięciu zostaniesz automatycznie zalogowany.'
          }
        </p>
        <Link href={hasError ? '/rejestracja' : '/logowanie'}
          className="px-6 py-3 bg-brand-copper text-brand-black font-bold rounded-md hover:bg-brand-copper-light transition-colors">
          {hasError ? 'Wróć do rejestracji' : 'Przejdź do logowania'}
        </Link>
      </div>
    </div>
  )
}
