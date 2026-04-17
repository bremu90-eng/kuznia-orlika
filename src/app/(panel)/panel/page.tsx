import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Calendar, Users, BookOpen, TrendingUp } from 'lucide-react'

export default async function PanelPage() {
  const supabase = await createClient()

  const { count: totalSessions } = await supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'scheduled').gte('starts_at', new Date().toISOString())
  const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed')
  const { count: totalClients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client')
  const { data: recentBookings } = await supabase.from('bookings').select('deposit_amount').eq('status', 'confirmed')
  const revenue = (recentBookings ?? []).reduce((sum, b) => sum + b.deposit_amount, 0)

  return (
    <div>
      <h1 className="text-2xl font-black text-brand-text mb-2">Dashboard</h1>
      <p className="text-brand-text-secondary text-sm mb-8">Przegląd aktywności studia</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Calendar, label: 'Nadchodzące terminy', value: totalSessions ?? 0, color: 'text-brand-copper' },
          { icon: BookOpen, label: 'Aktywne rezerwacje', value: totalBookings ?? 0, color: 'text-green-400' },
          { icon: Users, label: 'Klienci', value: totalClients ?? 0, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Wpłynęło zaliczek', value: formatPrice(revenue), color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-brand-graphite border border-brand-border rounded-xl p-5">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className={`text-2xl font-black ${color} mb-1`}>{value}</div>
            <div className="text-xs text-brand-text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-brand-graphite border border-brand-border rounded-xl p-6">
        <h2 className="font-bold text-brand-text mb-4">Szybkie akcje</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/panel/terminy" className="px-4 py-2 bg-brand-copper text-brand-black font-semibold rounded-md text-sm hover:bg-brand-copper-light transition-colors">+ Dodaj termin</a>
          <a href="/panel/rezerwacje" className="px-4 py-2 border border-brand-border text-brand-text text-sm rounded-md hover:border-brand-border-light transition-colors">Zobacz rezerwacje</a>
          <a href="/panel/klienci" className="px-4 py-2 border border-brand-border text-brand-text text-sm rounded-md hover:border-brand-border-light transition-colors">Lista klientów</a>
        </div>
      </div>
    </div>
  )
}
