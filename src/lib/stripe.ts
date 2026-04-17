import Stripe from 'stripe'
import { formatDate, formatTime } from './utils'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

interface CheckoutParams {
  bookingId: string; sessionId: string; userId: string
  email: string; amount: number; sessionTitle: string
  trainerName: string; startsAt: string
}

export async function createStripeCheckout(params: CheckoutParams): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'blik', 'p24'],
      customer_email: params.email,
      line_items: [{
        price_data: {
          currency: 'pln',
          unit_amount: Math.round(params.amount * 100),
          product_data: {
            name: params.sessionTitle,
            description: `Trener: ${params.trainerName} | ${formatDate(params.startsAt)}, ${formatTime(params.startsAt)}`,
          },
        },
        quantity: 1,
      }],
      metadata: { booking_id: params.bookingId, session_id: params.sessionId, user_id: params.userId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/rezerwacja/sukces?booking_id=${params.bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/platnosc/anulowano?booking_id=${params.bookingId}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })
    return session.url
  } catch (err) {
    console.error('Stripe error:', err)
    return null
  }
}
