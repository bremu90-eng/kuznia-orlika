import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

function db() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = db()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status !== 'paid') return NextResponse.json({ received: true })

    const bookingId = session.metadata?.booking_id
    if (!bookingId) return NextResponse.json({ received: true })

    await supabase.from('payments').upsert({
      booking_id: bookingId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      amount: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? 'pln',
      status: 'succeeded',
      payment_type: 'deposit_full',
    }, { onConflict: 'stripe_checkout_session_id' })

    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)

    if (session.customer_email) {
      const { data: booking } = await supabase.from('bookings')
        .select('*, sessions (starts_at, class_types (name), trainers (first_name, last_name))')
        .eq('id', bookingId).single()

      if (booking) {
        const { sendBookingConfirmation } = await import('@/lib/resend')
        const s = booking.sessions as Record<string, unknown>
        const ct = s?.class_types as { name: string }
        const t = s?.trainers as { first_name: string; last_name: string }
        await sendBookingConfirmation({
          to: session.customer_email,
          bookingId,
          sessionTitle: ct?.name ?? 'Zajęcia',
          startsAt: (s?.starts_at as string) ?? '',
          trainerName: t ? `${t.first_name} ${t.last_name}` : 'Trener',
          amount: booking.deposit_amount,
        })
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.booking_id
    if (bookingId) {
      await supabase.from('bookings').update({
        status: 'cancelled_client',
        cancellation_reason: 'payment_expired',
        cancelled_at: new Date().toISOString(),
      }).eq('id', bookingId).eq('status', 'pending_payment')
    }
  }

  return NextResponse.json({ received: true })
}
