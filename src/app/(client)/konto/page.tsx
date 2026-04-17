import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/actions/auth'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { Calendar, Clock, XCircle, ArrowRight, LogOut, User } from 'lucide-react'

const STATUS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Oczekuje na płatność', color: 'text-amber-400' },
  confirmed: { label: 'Potwierdzona', color: 'text-green-400' },
  cancelled_client: { label: 'Anulowana', color: 'text-red-400' },
  cancelled_studio: { label: 'Anulowana przez studio', color: 'text-red-400' },
  completed: { label: 'Zakończona', color: 'text-brand-text-secondary' },
  no_show: { label: 'Nieobecność', color: 'text-brand-text-muted' },
}

export default async function KontoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/logowanie')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id,status,booking_amount,deposit_amount,created_at,sessions(id,starts_at,ends_at,title,class_types(name),trainers(first_name,last_name))')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const now = new Date()
  const upcoming = (bookings ?? []).filter(b => b.status === 'confirmed' && new Date((b.sessions as {starts_at:string}).starts_at) > now)
  const cancelled = (bookings ?? []).filter(b => b.status.startsWith('cancelled')).length

  return (
    <div className="max-w-site mx-auto px-4 md:px-6 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text">Cześć, {profile?.first_name}!</h1>
          <p className="text-brand-text-secondary mt-1">Zarządzaj swoimi rezerwacjami</p>
        </div>
        <form action={logout}>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-text-secondary border border-brand-border rounded-md hover:border-brand-border-light hover:text-brand-text transition-colors">
            <LogOut className="w-4 h-4" />Wyloguj
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Calendar, value: upcoming.length, label: 'Nadchodzące', color: 'text-brand-copper' },
          { icon: Clock, value: bookings?.length ?? 0, label: 'Wszystkie', color: 'text-brand-text' },
          { icon: XCircle, value: cancelled, label: 'Anulowane', color: 'text-red-400' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-brand-graphite border border-brand-border rounded-xl p-4 md:p-6">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-brand-text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        <Link href="/zapisy" className="flex items-center gap-2 px-5 py-2.5 bg-brand-copper text-brand-black font-semibold rounded-md text-sm hover:bg-brand-copper-light transition-colors">
          Zapisz się <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/konto/profil" className="flex items-center gap-2 px-5 py-2.5 border border-brand-border text-brand-text-secondary rounded-md text-sm hover:border-brand-border-light hover:text-brand-text transition-colors">
          <User className="w-4 h-4" />Mój profil
        </Link>
      </div>

      <h2 className="text-lg font-bold text-brand-text mb-4">Historia rezerwacji</h2>
      {(bookings ?? []).length === 0 ? (
        <div className="bg-brand-graphite border border-brand-border rounded-xl p-8 text-center">
          <p className="text-brand-text-secondary mb-4">Nie masz jeszcze żadnych rezerwacji.</p>
          <Link href="/zapisy" className="text-brand-copper text-sm font-medium">Sprawdź grafik →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(bookings ?? []).map((booking) => {
            const s = booking.sessions as {starts_at:string;title:string|null;class_types:{name:string};trainers:{first_name:string;last_name:string}}
            const st = STATUS[booking.status] ?? { label: booking.status, color: 'text-brand-text-secondary' }
            return (
              <div key={booking.id} className="bg-brand-graphite border border-brand-border rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-brand-text text-sm">{s?.class_types?.name || s?.title}</div>
                  <div className="text-xs text-brand-text-muted mt-1">{formatDateTime(s.starts_at)} &bull; {s?.trainers?.first_name} {s?.trainers?.last_name}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${st.color}`}>{st.label}</div>
                  <div className="text-xs text-brand-text-muted mt-1">{formatPrice(booking.deposit_amount)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
