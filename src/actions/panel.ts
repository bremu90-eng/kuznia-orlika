'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Brak autoryzacji.' }

  const { data: rawProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = rawProfile as any
  if (!profile || (profile.role !== 'trainer' && profile.role !== 'admin')) return { error: 'Brak uprawnień.' }

  const classTypeId = formData.get('classTypeId') as string
  const trainerId = formData.get('trainerId') as string
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const maxCapacity = parseInt(formData.get('maxCapacity') as string)
  const price = parseFloat(formData.get('price') as string)

  if (!classTypeId || !trainerId || !date || !startTime || !maxCapacity || !price) {
    return { error: 'Uzupełnij wszystkie wymagane pola.' }
  }

  const { data: rawCt } = await supabase.from('class_types').select('duration_minutes').eq('id', classTypeId).single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ct = rawCt as any
  if (!ct) return { error: 'Nie znaleziono typu zajęć.' }

  const startsAt = new Date(`${date}T${startTime}:00`)
  const endsAt = new Date(startsAt.getTime() + ct.duration_minutes * 60 * 1000)

  if (isNaN(startsAt.getTime())) return { error: 'Nieprawidłowa data lub godzina.' }
  if (startsAt < new Date()) return { error: 'Termin musi być w przyszłości.' }

  const { error } = await supabase.from('sessions').insert({
    class_type_id: classTypeId,
    trainer_id: trainerId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    max_capacity: maxCapacity,
    price,
    status: 'scheduled',
    created_by: user.id,
  })

  if (error) return { error: 'Błąd tworzenia terminu.' }

  revalidatePath('/panel/terminy')
  revalidatePath('/grafik')
  return { success: true }
}
