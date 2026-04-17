import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Grafik zajęć',
  description: 'Sprawdź dostępne terminy i zarezerwuj miejsce.',
}

export default async function GrafikPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      class_types (id, name, slug, category, duration_minutes, deposit_policy),
      trainers (id, first_name, last_name, slug)
    `)
    .eq('status', 'scheduled')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')

  const { data: classTypes } = await supabase
    .from('class_types')
    .select('id, name, slug, category')
    .eq('is_active', true)

  const { data: trainers } = await supabase
    .from('trainers')
    .select('id, first_name, last_name, slug')
    .eq('is_active', true)

  const sessionIds = (sessions ?? []).map(s => s.id)
  const spotsMap: Record<string, number> = {}

  if (sessionIds.length > 0) {
    const { data: bookingCounts } = await supabase
      .from('bookings')
      .select('session_id')
      .in('session_id', sessionIds)
      .not('status', 'in', '("cancelled_client","cancelled_studio","no_show")')

    sessionIds.forEach(id => {
      const session = (sessions ?? []).find(s => s.id === id)
      spotsMap[id] = (session?.max_capacity ?? 0) -
        (bookingCounts?.filter(b => b.session_id === id).length ?? 0)
    })
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '8rem 1.5rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f0ece8', marginBottom: '0.5rem' }}>
        Grafik <span style={{ color: '#b87333' }}>zajęć</span>
      </h1>
      <p style={{ color: '#9a9494', marginBottom: '2rem' }}>Nadchodzące terminy</p>

      {(sessions ?? []).length === 0 ? (
        <p style={{ color: '#9a9494' }}>Brak nadchodzących terminów.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {(sessions ?? []).map((session) => {
            const ct = session.class_types as { name: string; deposit_policy: string }
            const t = session.trainers as { first_name: string; last_name: string }
            const spots = spotsMap[session.id] ?? 0
            const startsAt = new Date(session.starts_at)
            const endsAt = new Date(session.ends_at)

            return (
              <div key={session.id} style={{
                background: '#1c1c20', border: '1px solid #2e2e34',
                borderRadius: '12px', padding: '1.25rem'
              }}>
                <div style={{
                  display: 'inline-block', padding: '0.25rem 0.75rem',
                  background: 'rgba(184,115,51,0.1)', color: '#b87333',
                  borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem'
                }}>
                  {ct?.name}
                </div>
                <div style={{ color: '#f0ece8', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {t?.first_name} {t?.last_name}
                </div>
                <div style={{ color: '#9a9494', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {startsAt.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div style={{ color: '#9a9494', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {startsAt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {endsAt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {spots > 0 ? `${spots} wolnych miejsc` : 'Brak miejsc'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#f0ece8', fontWeight: 900, fontSize: '1.25rem' }}>
                      {session.price} zł
                    </div>
                    <div style={{ color: '#5a5560', fontSize: '0.75rem' }}>
                      Zaliczka {ct?.deposit_policy === 'full_100' ? '100%' : '25%'}
                    </div>
                  </div>
                  <a href="/rejestracja" style={{
                    padding: '0.5rem 1rem',
                    background: spots > 0 ? '#b87333' : '#2e2e34',
                    color: spots > 0 ? '#0a0a0b' : '#5a5560',
                    borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700,
                    textDecoration: 'none', pointerEvents: spots > 0 ? 'auto' : 'none'
                  }}>
                    {spots > 0 ? 'Zarezerwuj' : 'Brak miejsc'}
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
