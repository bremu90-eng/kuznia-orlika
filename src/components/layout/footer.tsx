import Link from 'next/link'
import { Dumbbell, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-charcoal border-t border-brand-border mt-auto">
      <div className="max-w-site mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <div className="w-8 h-8 bg-brand-copper rounded-sm flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-brand-black" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-brand-text text-base leading-none">
                KUŹNIA<br /><span className="text-brand-copper text-xs tracking-widest">ORLIKA</span>
              </span>
            </Link>
            <p className="text-brand-text-secondary text-sm leading-relaxed mb-6 max-w-xs">
              Premium studio treningowe. Trening, który kuje charakter.
            </p>
            <div className="flex flex-col gap-2 text-sm text-brand-text-secondary">
              <a href="tel:+48500000000" className="flex items-center gap-2 hover:text-brand-copper transition-colors"><Phone className="w-4 h-4" />+48 500 000 000</a>
              <a href="mailto:kontakt@kuzniaorldika.pl" className="flex items-center gap-2 hover:text-brand-copper transition-colors"><Mail className="w-4 h-4" />kontakt@kuzniaorldika.pl</a>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />ul. Przykładowa 1, 00-000 Miasto</span>
            </div>
          </div>

          {[
            { title: 'Oferta', links: [{ href: '/oferta', label: 'Trening personalny' }, { href: '/oferta', label: 'Trening w duecie' }, { href: '/oferta', label: 'Zajęcia grupowe' }, { href: '/cennik', label: 'Cennik' }] },
            { title: 'Studio', links: [{ href: '/trenerzy', label: 'Trenerzy' }, { href: '/grafik', label: 'Grafik zajęć' }, { href: '/faq', label: 'FAQ' }, { href: '/kontakt', label: 'Kontakt' }] },
            { title: 'Prawne', links: [{ href: '/polityka-prywatnosci', label: 'Polityka prywatności' }, { href: '/regulamin', label: 'Regulamin' }, { href: '/regulamin-rezerwacji', label: 'Regulamin rezerwacji' }] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-brand-text font-semibold text-sm mb-4 tracking-wide uppercase">{title}</h3>
              <ul className="flex flex-col gap-2">
                {links.map(({ href, label }) => (
                  <li key={label}><Link href={href} className="text-sm text-brand-text-secondary hover:text-brand-copper transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-text-muted">© {new Date().getFullYear()} Kuźnia Orlika. Wszelkie prawa zastrzeżone.</p>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-brand-text-muted hover:text-brand-copper transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-brand-text-muted hover:text-brand-copper transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
