import { Resend } from 'resend'
import { formatDateTime, formatPrice } from './utils'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`

function base(content: string) {
  return `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:40px 20px;background:#0a0a0b;font-family:system-ui,sans-serif;">
<div style="max-width:600px;margin:0 auto;">
<div style="background:#111113;border:1px solid #2e2e34;border-radius:12px;padding:32px;">
<p style="font-size:18px;font-weight:900;color:#f0ece8;margin:0 0 24px;">KUŹNIA <span style="color:#b87333;">ORLIKA</span></p>
${content}
<hr style="border:none;border-top:1px solid #2e2e34;margin:24px 0;">
<p style="color:#5a5560;font-size:12px;margin:0;">Kuźnia Orlika | kontakt@kuzniaorldika.pl</p>
</div></div></body></html>`
}

export async function sendBookingConfirmation(p: {
  to: string; bookingId: string; sessionTitle: string
  startsAt: string; trainerName: string; amount: number
}) {
  const html = base(`
    <h1 style="color:#f0ece8;font-size:20px;margin:0 0 8px;">Rezerwacja potwierdzona ✓</h1>
    <div style="background:#1c1c20;border:1px solid #2e2e34;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#b87333;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 8px;">Szczegóły zajęć</p>
      <p style="color:#f0ece8;font-weight:700;margin:0 0 4px;">${p.sessionTitle}</p>
      <p style="color:#9a9494;font-size:14px;margin:0 0 4px;">📅 ${formatDateTime(p.startsAt)}</p>
      <p style="color:#9a9494;font-size:14px;margin:0 0 4px;">👤 ${p.trainerName}</p>
      <p style="color:#9a9494;font-size:14px;margin:0;">💳 Zaliczka: <strong style="color:#f0ece8;">${formatPrice(p.amount)}</strong></p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/konto/rezerwacje"
       style="display:inline-block;padding:12px 24px;background:#b87333;color:#0a0a0b;text-decoration:none;border-radius:6px;font-weight:700;">
      Zarządzaj rezerwacją
    </a>`)

  return resend.emails.send({ from: FROM, to: p.to, subject: `Rezerwacja potwierdzona — ${p.sessionTitle}`, html })
}

export async function sendCancellationEmail(p: {
  to: string; sessionTitle: string; startsAt: string; refundAmount: number
}) {
  const html = base(`
    <h1 style="color:#f0ece8;font-size:20px;margin:0 0 8px;">Rezerwacja anulowana</h1>
    <div style="background:#1c1c20;border:1px solid #2e2e34;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#f0ece8;font-weight:700;margin:0 0 4px;">${p.sessionTitle}</p>
      <p style="color:#9a9494;font-size:14px;margin:0 0 4px;">📅 ${formatDateTime(p.startsAt)}</p>
      ${p.refundAmount > 0
        ? `<p style="color:#4ade80;font-size:14px;margin:0;">💰 Zwrot: ${formatPrice(p.refundAmount)} — 5–10 dni roboczych</p>`
        : `<p style="color:#f87171;font-size:14px;margin:0;">Brak zwrotu (anulacja &lt; 10h przed zajęciami)</p>`}
    </div>`)

  return resend.emails.send({ from: FROM, to: p.to, subject: `Rezerwacja anulowana — ${p.sessionTitle}`, html })
}
