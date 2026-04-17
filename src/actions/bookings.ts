'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateDepositAmount } from '@/lib/utils'

export async function createBooking(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/logowanie?redirect=/zapisy`)

  const { data: session } = await supabase
    .from('sessions')
    .select('*, class_types (*), trainers (first_name, last_name)')
    .eq('id', sessionId).eq('status', 'scheduled').single()

  if (!session) return { error: 'Termin nie istnieje lub jest niedostępny.' }

  const { data: spots } = await supabase.rpc('get_available_spots', { p_session_id: sessionId })
  if (!spots || spots <= 0) return { error: 'Brak wolnych miejsc na te zajęcia.' }

  const { data: existing } = await supabase.from('bookings').select('id')
    .eq('session_id', sessionId).eq('client_id', user.id)
    .not('status', 'in', '("cancelled_client","cancelled_studio")').single()
  if (existing) return { error: 'Masz już rezerwację na te zajęcia.' }

  const ct = session.class_types as { deposit_policy: 'full_100' | 'partial_25' }
  const depositAmount = calculateDepositAmount(session.price, ct.deposit_policy)
  const policySnapshot = {
    deposit_policy: ct.deposit_policy,
    deposit_pct: ct.deposit_policy === 'full_100' ? 100 : 25,
    refund_gt_10h: 100, refund_lt_10h: 50,
    captured_at: new Date().toISOString(),
  }

  const { data: booking, error: bookingError } = await supabase.rpc('create_booking_atomic', {
    p_session_id: sessionId, p_client_id: user.id,
    p_booking_amount: session.price, p_deposit_amount: depositAmount,
    p_policy_snapshot: policySnapshot,
  })

  if (bookingError) {
    if (bookingError.message.includes('NO_SPOTS_AVAILABLE')) return { error: 'Ostatnie miejsce właśnie zostało zajęte.' }
    return { error: 'Błąd tworzenia rezerwacji. Spróbuj ponownie.' }
  }

  const { createStripeCheckout } = await import('@/lib/stripe')
  const t = session.trainers as { first_name: string; last_name: string }
  const ct2 = session.class_types as { name: string }

  const checkoutUrl = await createStripeCheckout({
    bookingId: booking.id, sessionId, userId: user.id,
    email: user.email!, amount: depositAmount,
    sessionTitle: ct2.name, trainerName: `${t.first_name} ${t.last_name}`,
    startsAt: session.starts_at,
  })

  if (!checkoutUrl) {
    await supabase.from('bookings').update({ status: 'cancelled_client', cancellation_reason: 'stripe_error' }).eq('id', booking.id)
    return { error: 'Błąd płatności. Spróbuj ponownie.' }
  }

  redirect(checkoutUrl)
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const { data: booking } = await supabase.from('bookings')
    .select('*, sessions (starts_at)')
    .eq('id', bookingId).eq('client_id', user.id).single()
  if (!booking) return { error: 'Rezerwacja nie istnieje.' }
  if (!['confirmed', 'pending_payment'].includes(booking.status)) return { error: 'Nie można anulować tej rezerwacji.' }

  const session = booking.sessions as { starts_at: string }
  const hoursUntil = (new Date(session.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)
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
