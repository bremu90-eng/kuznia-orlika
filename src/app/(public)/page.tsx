import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Clock, Users, Check, Star, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, calculateDepositAmount } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Kuźnia Orlika — Trening, który kuje charakter',
  description: 'Premium studio treningowe. Trening personalny 1:1, małe grupy i zajęcia grupowe.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: trainers } = await supabase.from('trainers').select('id,first_name,last_name,specialty,avatar_url,slug').eq('is_active', true).order('sort_order').limit(4)
  const { data: classTypes } = await supabase.from('class_types').select('*').eq('is_active', true).order('sort_order')

  const FAQS = [
    { q: 'Jak zapisać się na zajęcia?', a: 'Kliknij "Zapisz się", wybierz termin z grafiku i kliknij "Zarezerwuj". Po zalogowaniu zostaniesz przekierowany do płatności.' },
    { q: 'Czy muszę mieć doświadczenie?', a: 'Nie. Zajęcia są dostosowywane do poziomu każdego uczestnika. Powiedz nam, czego potrzebujesz — dostosujemy się.' },
    { q: 'Ile wynosi zaliczka?', a: 'Dla treningów 1:1 i w duecie: 100% ceny. Dla zajęć grupowych: 25% przy zapisie.' },
    { q: 'Czy mogę anulować rezerwację?', a: 'Tak. Anulacja >10h przed = zwrot 100%. Anulacja <10h przed = zwrot 50%.' },
    { q: 'Co zabrać na pierwsze zajęcia?', a: 'Wygodny strój sportowy, buty i wodę. Przyjdź 10 minut wcześniej, żeby porozmawiać z trenerem.' },
  ]

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(184,115,51,0.08)_0%,_transparent_60%)]" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-copper/30 bg-brand-copper/5 text-brand-copper text-xs font-medium tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-copper animate-pulse" />
            Studio Treningowe
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="text-brand-text block">Trening,</span>
            <span className="text-brand-text block">który</span>
            <span className="text-gradient-copper block">kuje charakter</span>
          </h1>
          <p className="text-brand-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Profesjonalni trenerzy, spersonalizowane podejście i środowisko stworzone po to, żebyś przekraczał swoje granice każdego dnia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/zapisy" className="group flex items-center gap-2 px-8 py-4 bg-brand-copper text-brand-black font-bold rounded-md hover:bg-brand-copper-light transition-all text-base">
              Zapisz się na zajęcia <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/grafik" className="flex items-center gap-2 px-8 py-4 border border-brand-border text-brand-text font-medium rounded-md hover:border-brand-copper hover:text-brand-copper transition-colors text-base">
              Zobacz grafik
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[{ value: '1:1', label: 'Trening personalny' }, { value: 'do 12', label: 'Osób w grupie' }, { value: '100%', label: 'Profesjonalny sprzęt' }].map(({ value, label }) => (
              <div key={label} className="bg-brand-graphite border border-brand-border rounded-lg p-4 md:p-5">
                <div className="text-2xl md:text-3xl font-black text-brand-copper mb-1">{value}</div>
                <div className="text-xs md:text-sm text-brand-text-secondary">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brand-text-muted animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* OFERTA */}
      <section className="section-padding">
        <div className="max-w-site mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">Nasza <span className="text-gradient-copper">oferta</span></h2>
            <p className="text-brand-text-secondary max-w-xl mx-auto">Niezależnie od Twojego poziomu i celu — mamy formę treningową, która Ci odpowiada.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(classTypes ?? []).map((ct) => (
              <div key={ct.id} className="group p-8 bg-brand-graphite border border-brand-border rounded-xl hover:border-brand-copper/40 transition-colors">
                <div className="inline-flex px-3 py-1 bg-brand-copper/10 text-brand-copper text-xs font-semibold rounded-full mb-4">{ct.name}</div>
                <p className="text-brand-text-secondary text-sm leading-relaxed mb-6">{ct.description}</p>
                <div className="flex items-center gap-6 mb-6 text-sm text-brand-text-secondary">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-copper" />{ct.duration_minutes} min</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-copper" />do {ct.max_capacity} osób</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-black text-brand-text">od {formatPrice(ct.base_price)}</div>
                    <div className="text-xs text-brand-text-muted">za osobę / zajęcia</div>
                  </div>
                  <Link href="/zapisy" className="flex items-center gap-2 px-5 py-2.5 bg-brand-copper text-brand-black font-semibold rounded-md text-sm hover:bg-brand-copper-light transition-colors">
                    Rezerwuj <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JAK TO DZIAŁA */}
      <section className="section-padding bg-brand-charcoal border-y border-brand-border">
        <div className="max-w-site mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">Jak to <span className="text-gradient-copper">działa</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Wybierz termin', desc: 'Sprawdź grafik i wybierz typ zajęć, trenera i godzinę.' },
              { num: '02', title: 'Zarezerwuj miejsce', desc: 'Utwórz konto i opłać zaliczkę online. Całość trwa 2 minuty.' },
              { num: '03', title: 'Przyjdź i trenuj', desc: 'Dostaniesz potwierdzenie e-mailem. Przyjdź i zacznij działać.' },
              { num: '04', title: 'Rozwijaj się', desc: 'Obserwuj swój postęp w panelu klienta i maszeruj dalej.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-brand-copper flex items-center justify-center text-brand-black font-black text-sm mb-4">{num}</div>
                <h3 className="font-bold text-brand-text mb-2">{title}</h3>
                <p className="text-brand-text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CENNIK */}
      <section className="section-padding">
        <div className="max-w-site mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">Przejrzysty <span className="text-gradient-copper">cennik</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {(classTypes ?? []).map((ct, i) => (
              <div key={ct.id} className={`relative p-6 rounded-xl border ${i === 0 ? 'bg-brand-graphite border-brand-copper' : 'bg-brand-graphite border-brand-border'}`}>
                {i === 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-copper text-brand-black text-xs font-bold rounded-full">Najpopularniejszy</div>}
                <h3 className="font-bold text-brand-text mb-4 text-sm">{ct.name}</h3>
                <div className="text-3xl font-black text-brand-text mb-1">{formatPrice(ct.base_price)}</div>
                <div className="text-xs text-brand-text-muted mb-6">za osobę / zajęcia</div>
                <ul className="flex flex-col gap-2 text-sm text-brand-text-secondary mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-copper flex-shrink-0" />{ct.duration_minutes} min</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-copper flex-shrink-0" />do {ct.max_capacity} osób</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-copper flex-shrink-0" />Zaliczka {ct.deposit_policy === 'full_100' ? '100%' : '25%'} ({formatPrice(calculateDepositAmount(ct.base_price, ct.deposit_policy))})</li>
                </ul>
                <Link href="/zapisy" className={`block text-center py-2.5 rounded-md text-sm font-semibold transition-colors ${i === 0 ? 'bg-brand-copper text-brand-black hover:bg-brand-copper-light' : 'border border-brand-border text-brand-text hover:border-brand-copper hover:text-brand-copper'}`}>
                  Zarezerwuj
                </Link>
              </div>
            ))}
          </div>
          <div className="bg-brand-graphite border border-brand-border rounded-xl p-6 md:p-8">
            <h3 className="font-bold text-brand-text mb-4">Polityka zaliczek i anulacji</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><div className="text-brand-copper font-semibold mb-1">Zaliczka przy rezerwacji</div><div className="text-brand-text-secondary">1:1 i duet: <strong className="text-brand-text">100%</strong><br />Grupowe: <strong className="text-brand-text">25%</strong></div></div>
              <div><div className="text-brand-copper font-semibold mb-1">Anulacja {'>'} 10h przed</div><div className="text-brand-text-secondary">Zwrot <strong className="text-brand-text">100%</strong> zaliczki</div></div>
              <div><div className="text-brand-copper font-semibold mb-1">Anulacja {'<'} 10h przed</div><div className="text-brand-text-secondary">Zwrot <strong className="text-brand-text">50%</strong> zaliczki</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENERZY */}
      {(trainers ?? []).length > 0 && (
        <section className="section-padding bg-brand-charcoal border-t border-brand-border">
          <div className="max-w-site mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">Nasi <span className="text-gradient-copper">trenerzy</span></h2>
                <p className="text-brand-text-secondary">Eksperci, którzy połączyli pasję z profesjonalizmem.</p>
              </div>
              <Link href="/trenerzy" className="hidden md:flex items-center gap-2 text-brand-copper text-sm font-medium">Wszyscy trenerzy <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(trainers ?? []).map((t) => (
                <div key={t.id} className="bg-brand-graphite border border-brand-border rounded-xl p-6 text-center hover:border-brand-copper/40 transition-colors">
                  <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-black text-brand-copper">{t.first_name[0]}{t.last_name[0]}</span>
                  </div>
                  <div className="font-bold text-brand-text text-sm">{t.first_name} {t.last_name}</div>
                  {t.specialty?.[0] && <div className="text-xs text-brand-copper mt-1">{t.specialty[0]}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OPINIE */}
      <section className="section-padding">
        <div className="max-w-site mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">Co mówią <span className="text-gradient-copper">nasi klienci</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Piotr W.', role: 'Klient od 8 miesięcy', text: 'Zacząłem jako kompletny laik. Po 4 miesiącach z Markiem mam plan, technikę i pierwsze realne efekty. Różnica między Kuźnią a zwykłą siłownią jest nie do porównania.' },
              { name: 'Marta K.', role: 'Klientka od roku', text: 'Ania rozumie moje ciało lepiej niż ja. Treningi funkcjonalne zmieniły moje podejście do ruchu. Jestem silniejsza, zdrowsza i po raz pierwszy lubię ćwiczyć.' },
              { name: 'Krzysztof B.', role: 'Klient od 3 miesięcy', text: 'HIIT z Tomkiem to nie jest żart. Efekty po 3 miesiącach mówią same za siebie — 12 kg mniej i wreszcie nie mam zadyszki przy wchodzeniu po schodach.' },
            ].map(({ name, role, text }) => (
              <div key={name} className="p-6 bg-brand-graphite border border-brand-border rounded-xl">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-copper text-brand-copper" />)}</div>
                <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div className="font-semibold text-brand-text text-sm">{name}</div>
                <div className="text-xs text-brand-text-muted">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-brand-charcoal border-t border-brand-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4">Najczęstsze <span className="text-gradient-copper">pytania</span></h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }, i) => (
              <details key={i} className="group bg-brand-graphite border border-brand-border rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-semibold text-brand-text text-sm md:text-base pr-4">{q}</span>
                  <ChevronDown className="w-5 h-5 text-brand-copper flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-brand-text-secondary text-sm leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* KOŃCOWE CTA */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-brand-graphite border border-brand-copper/20 rounded-2xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(184,115,51,0.08)_0%,_transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black text-brand-text mb-4 leading-tight">
                Zacznij dziś.<br /><span className="text-gradient-copper">Nie w poniedziałek.</span>
              </h2>
              <p className="text-brand-text-secondary mb-8 max-w-md mx-auto">Pierwsze zajęcia mogą być już jutro. Sprawdź grafik i wybierz termin.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/zapisy" className="group flex items-center gap-2 px-8 py-4 bg-brand-copper text-brand-black font-bold rounded-md hover:bg-brand-copper-light transition-colors">
                  Zapisz się na zajęcia <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/kontakt" className="px-8 py-4 border border-brand-border text-brand-text font-medium rounded-md hover:border-brand-copper hover:text-brand-copper transition-colors">
                  Zadaj pytanie
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
