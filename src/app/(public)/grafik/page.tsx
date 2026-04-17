import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ScheduleClient } from './schedule-client'

export const metadata: Metadata = {
  title: 'Grafik zajęć',
  description: 'Sprawdź dostępne terminy i zarezerwuj miejsce.',
}

export default async function GrafikPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*,class_types(id,name,slug,category,duration_minutes,deposit_policy),trainers(id,first_name,last_name,slug)')
    .eq('status', 'scheduled')
    .gte('starts_at', new Date().toISOString())
    .lte('starts_at', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
    .order('starts_at')

  const { data: classTypes } = await supabase.from('class_types').select('id,name,slug,category').eq('is_active', true).order('sort_order')
  const { data: trainers } = await supabase.from('trainers').select('id,first_name,last_name,slug').eq('is_active', true).order('sort_order')

  const sessionIds = (sessions ?? []).map(s => s.id)
  const spotsMap: Record<string, number> = {}

  if (sessionIds.length > 0) {
    const { data: counts } = await supabase.from('bookings').select('session_id')
      .in('session_id', sessionIds).not('status', 'in', '("cancelled_client","cancelled_studio","no_show")')
    sessionIds.forEach(id => {
      const max = sessions?.find(s => s.id === id)?.max_capacity ?? 0
      const booked = (counts ?? []).filter(b => b.session_id === id).length
      spotsMap[id] = Math.max(max - booked, 0)
    })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-site mx-auto px-4 md:px-6 py-8 pt-28">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-brand-text mb-2">Grafik <span className="text-gradient-copper">zajęć</span></h1>
            <p className="text-brand-text-secondary">Nadchodzące terminy — najbliższe 14 dni</p>
          </div>
          <ScheduleClient sessions={sessions ?? []} classTypes={classTypes ?? []} trainers={trainers ?? []} spotsMap={spotsMap} />
        </div>
      </main>
      <Footer />
    </>
  )
}
