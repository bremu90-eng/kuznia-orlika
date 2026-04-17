'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateDepositAmount } from '@/lib/utils'

export async function createBooking(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/logowanie')

  const { data: rawSession } = await supabase
    .from('sessions')
    .select('*, class_types (*), trainers (first_name, last_name)')
    .eq('id', sessionId)
    .eq('status', 'scheduled')
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = rawSession as any
  if (!session) return { error: 'Termin nie istnieje lub jest niedostępny.' }

  const { data: bookingCounts } = await supabase
    .from('bookings')
    .select('id')
    .eq('session_id', sessionId)
    .not('status', 'in', '("cancelled_client","cancelled_studio","no_show")')

  const booked = bookingCounts?.length ?? 0
  if (booked >= session.max_capacity) return { error: 'Brak wolnych miejsc na te zajęcia.' }

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('session_id', sessionId)
    .eq('client_id', user!.id)
    .not('status', 'in', '("cancelled_client","cancelled_studio")')
    .maybeSingle()

  if (existing) return { error: 'Masz już rezerwację na te zajęcia.' }

  const depositPolicy = session.class_types.deposit_policy as 'full_100' | 'partial_25'
  const depositAmount = calculateDepositAmount(session.price, depositPolicy)

  const policySnapshot = {
    deposit_policy: depositPolicy,
    deposit_pct: depositPolicy === 'full_100' ? 100 : 25,
    refund_gt_10h: 100,
    refund_lt_10h: 50,
    captured_at: new Date().toISOString(),
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      session_id: sessionId,
      client_id: user!.id,
      status: 'pending_payment',
      booking_amount: session.price,
      deposit_amount: depositAmount,
      cancellation_policy_snapshot: policySnapshot,
    })
    .select()
    .single()

  if (bookingError || !booking) return { error: 'Błąd tworzenia rezerwacji. Spróbuj ponownie.' }

  const { createStripeCheckout } = await import('@/lib/stripe')

  const checkoutUrl = await createStripeCheckout({
    bookingId: booking.id,
    sessionId,
    userId: user!.id,
    email: user!.email!,
    amount: depositAmount,
    sessionTitle: session.class_types.name,
    trainerName: `${session.trainers.first_name} ${session.trainers.last_name}`,
    startsAt: session.starts_at,
  })

  if (!checkoutUrl) {
    await supabase.from('bookings').update({ status: 'cancelled_client' }).eq('id', booking.id)
    return { error: 'Błąd płatności. Spróbuj ponownie.' }
  }

  redirect(checkoutUrl)
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const { data: rawBooking } = await supabase
    .from('bookings')
    .select('*, sessions (starts_at)')
    .eq('id', bookingId)
    .eq('client_id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = rawBooking as any
  if (!booking) return { error: 'Rezerwacja nie istnieje.' }
  if (!['confirmed', 'pending_payment'].includes(booking.status)) {
    return { error: 'Nie można anulować tej rezerwacji.' }
  }

  const hoursUntil = (new Date(booking.sessions.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)
  const refundAmount = booking.status === 'confirmed'
    ? (hoursUntil > 10 ? booking.deposit_amount : Math.ceil(booking.deposit_amount * 0.5 * 100) / 100)
    : 0

  await supabase.from('bookings').update({
    status: 'cancelled_client',
    cancelled_at: new Date().toISOString(),
    refund_amount: refundAmount,
    refund_status: refundAmount > 0 ? 'pending' : 'none',
    cancellation_reason: 'client_request',
  }).eq('id', bookingId).eq('client_id', user.id)

  return { success: true, refundAmount }
}
