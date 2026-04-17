'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, List, Users, UserCog, BookOpen, DollarSign, Settings, LogOut, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/actions/auth'

const NAV = [
  { href: '/panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/panel/grafik', label: 'Grafik', icon: Calendar },
  { href: '/panel/terminy', label: 'Terminy', icon: List },
  { href: '/panel/rezerwacje', label: 'Rezerwacje', icon: BookOpen },
  { href: '/panel/klienci', label: 'Klienci', icon: Users },
]

const ADMIN_NAV = [
  { href: '/panel/trenerzy', label: 'Trenerzy', icon: UserCog },
  { href: '/panel/oferta', label: 'Oferta', icon: Dumbbell },
  { href: '/panel/cennik', label: 'Cennik', icon: DollarSign },
  { href: '/panel/ustawienia', label: 'Ustawienia', icon: Settings },
]

export function PanelSidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-brand-charcoal border-r border-brand-border flex-col z-40 hidden md:flex">
      <div className="p-6 border-b border-brand-border">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-brand-copper rounded-sm flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-brand-black" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-brand-text text-sm">KUŹNIA ORLIKA</span>
        </Link>
        <div className="text-xs text-brand-text-muted">{name}</div>
        <div className="text-xs text-brand-copper capitalize mt-0.5">{role}</div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            (pathname === href || (href !== '/panel' && pathname.startsWith(href)))
              ? 'bg-brand-graphite text-brand-copper font-semibold'
              : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-graphite/50'
          )}>
            <Icon className="w-4 h-4 flex-shrink-0" />{label}
          </Link>
        ))}

        {role === 'admin' && (
          <>
            <div className="my-3 border-t border-brand-border" />
            <p className="text-xs text-brand-text-muted px-3 mb-1 uppercase tracking-wider">Admin</p>
            {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                pathname.startsWith(href) ? 'bg-brand-graphite text-brand-copper font-semibold' : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-graphite/50'
              )}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-brand-border">
        <form action={logout}>
          <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-brand-text-secondary hover:text-brand-text hover:bg-brand-graphite/50 transition-colors">
            <LogOut className="w-4 h-4" />Wyloguj się
          </button>
        </form>
      </div>
    </aside>
  )
}
