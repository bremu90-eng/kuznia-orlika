'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV = [
  { href: '/oferta', label: 'Oferta' },
  { href: '/cennik', label: 'Cennik' },
  { href: '/trenerzy', label: 'Trenerzy' },
  { href: '/grafik', label: 'Grafik' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-brand-charcoal/95 backdrop-blur-sm border-b border-brand-border shadow-lg' : 'bg-transparent'
    )}>
      <div className="max-w-site mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-brand-copper rounded-sm flex items-center justify-center group-hover:bg-brand-copper-light transition-colors">
              <Dumbbell className="w-4 h-4 text-brand-black" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-brand-text tracking-tight text-base leading-none">
              KUŹNIA<br /><span className="text-brand-copper text-xs tracking-widest">ORLIKA</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                pathname === href ? 'text-brand-copper' : 'text-brand-text-secondary hover:text-brand-text'
              )}>{label}</Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/konto" className="px-4 py-2 text-sm font-medium text-brand-text border border-brand-border rounded-md hover:border-brand-copper hover:text-brand-copper transition-colors">
                Moje konto
              </Link>
            ) : (
              <Link href="/logowanie" className="px-4 py-2 text-sm text-brand-text-secondary hover:text-brand-text transition-colors">
                Zaloguj się
              </Link>
            )}
            <Link href="/zapisy" className="px-5 py-2 text-sm font-semibold bg-brand-copper text-brand-black rounded-md hover:bg-brand-copper-light transition-colors">
              Zapisz się
            </Link>
          </div>

          <button className="md:hidden p-2 text-brand-text" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-brand-charcoal border-t border-brand-border">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className={cn(
                'px-4 py-3 text-base font-medium rounded-md transition-colors',
                pathname === href ? 'text-brand-copper bg-brand-graphite' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-graphite'
              )}>{label}</Link>
            ))}
            <div className="pt-4 flex flex-col gap-3 border-t border-brand-border mt-2">
              {user
                ? <Link href="/konto" className="px-4 py-3 text-center text-base font-medium text-brand-text border border-brand-border rounded-md">Moje konto</Link>
                : <Link href="/logowanie" className="px-4 py-3 text-center text-base text-brand-text-secondary">Zaloguj się</Link>
              }
              <Link href="/zapisy" className="px-4 py-3 text-center text-base font-semibold bg-brand-copper text-brand-black rounded-md">
                Zapisz się na zajęcia
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
