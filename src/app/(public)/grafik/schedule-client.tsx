'use client'

import { useState, useMemo } from 'react'
import { formatDayOfWeek, formatTime, formatPrice } from '@/lib/utils'
import { Clock, Users } from 'lucide-react'
import { createBooking } from '@/actions/bookings'
import { toast } from 'sonner'

interface Session {
  id: string; starts_at: string; ends_at: string; price: number; max_capacity: number; title: string | null
  class_types: { id: string; name: string; slug: string; category: string; duration_minutes: number; deposit_policy: string }
  trainers: { id: string; first_name: string; last_name: string; slug: string }
}

const CAT_COLORS: Record<string, string> = {
  personal: 'bg-brand-copper/10 text-brand-copper border-brand-copper/20',
  duet: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  group_small: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  group_large: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
}

export function ScheduleClient({ sessions, classTypes, trainers, spotsMap }: {
  sessions: Session[]
  classTypes: { id: string; name: string; slug: string; category: string }[]
  trainers: { id: string; first_name: string; last_name: string; slug: string }[]
  spotsMap: Record<string, number>
}) {
  const [filterClass, setFilterClass] = useState('all')
  const [filterTrainer, setFilterTrainer] = useState('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = useMemo(() => sessions.filter(s => {
    if (filterClass !== 'all' && s.class_types.id !== filterClass) return false
    if (filterTrainer !== 'all' && s.trainers.id !== filterTrainer) return false
    return true
  }), [sessions, filterClass, filterTrainer])

  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>()
    filtered.forEach(s => {
      const day = s.starts_at.slice(0, 10)
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(s)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  async function handleBook(sessionId: string) {
    setLoadingId(sessionId)
    try {
      await createBooking(sessionId)
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
        toast.error((err as {error?: string}).error ?? 'Błąd rezerwacji.')
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-8">
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="bg-brand-graphite border border-brand-border text-brand-text text-sm rounded-md px-3 py-2 focus:outline-none focus:border-brand-copper">
          <option value="all">Wszystkie typy</option>
          {classTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
        </select>
        <select value={filterTrainer} onChange={e => setFilterTrainer(e.target.value)}
          className="bg-brand-graphite border border-brand-border text-brand-text text-sm rounded-md px-3 py-2 focus:outline-none focus:border-brand-copper">
          <option value="all">Wszyscy trenerzy</option>
          {trainers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
        </select>
      </div>

      {byDay.length === 0 && (
        <div className="text-center py-16 text-brand-text-secondary">Brak terminów spełniających kryteria.</div>
      )}

      {byDay.map(([day, daySessions]) => (
        <div key={day} className="mb-8">
          <h2 className="text-base font-bold text-brand-text mb-4 capitalize">{formatDayOfWeek(day)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daySessions.map(session => {
              const spots = spotsMap[session.id] ?? 0
              const isFull = spots <= 0
              const isLoading = loadingId === session.id
              const cc = CAT_COLORS[session.class_types.category] ?? 'bg-brand-graphite text-brand-text-secondary border-transparent'
              return (
                <div key={session.id} className="bg-brand-graphite border border-brand-border rounded-xl p-5 flex flex-col gap-4 hover:border-brand-border-light transition-colors">
                  <div>
                    <div className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border mb-3 ${cc}`}>
                      {session.class_types.name}
                    </div>
                    <div className="text-sm font-semibold text-brand-text">{session.trainers.first_name} {session.trainers.last_name}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-brand-text-muted">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(session.starts_at)} – {formatTime(session.ends_at)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{isFull ? 'Brak miejsc' : `${spots} wolnych`}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-lg font-black text-brand-text">{formatPrice(session.price)}</div>
                      <div className="text-xs text-brand-text-muted">Zaliczka: {session.class_types.deposit_policy === 'full_100' ? '100%' : '25%'}</div>
                    </div>
                    <button onClick={() => handleBook(session.id)} disabled={isFull || isLoading}
                      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isFull ? 'bg-brand-graphite-light text-brand-text-muted cursor-not-allowed border border-brand-border' : 'bg-brand-copper text-brand-black hover:bg-brand-copper-light'}`}>
                      {isLoading ? '...' : isFull ? 'Brak miejsc' : 'Zarezerwuj'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
