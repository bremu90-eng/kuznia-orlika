import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'Kuźnia Orlika — Studio Treningowe', template: '%s | Kuźnia Orlika' },
  description: 'Premium studio treningowe. Trening personalny 1:1, małe grupy i zajęcia grupowe.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Kuźnia Orlika — Studio Treningowe',
    description: 'Trening, który kuje charakter.',
    type: 'website',
    locale: 'pl_PL',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={geist.variable}>
      <body style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif' }}>
        {children}
        <Toaster theme="dark" toastOptions={{
          style: { background: '#1c1c20', border: '1px solid #2e2e34', color: '#f0ece8' }
        }} />
      </body>
    </html>
  )
}
