import type { Metadata, Viewport } from 'next'
import './globals.css'
import AppProviders from '@/components/layout/AppProviders'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollRevealInit from '@/components/layout/ScrollRevealInit'
import CursorEffects from '@/components/layout/CursorEffects'

export const metadata: Metadata = {
  metadataBase: new URL('https://evict.bot'),
  title: {
    default: 'Evict',
    template: '%s | Evict',
  },
  description:
    'The all-in-one solution for seamless server management — powerful, polished, and visually refined.',
  icons: { icon: '/img/evict.webp' },
  openGraph: {
    images: ['/img/evict.webp'],
  },
  twitter: {
    card: 'summary',
    images: ['/img/evict.webp'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a1a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <Navbar />
          <div className="page">{children}</div>
          <Footer />
          <ScrollRevealInit />
          <CursorEffects />
        </AppProviders>
      </body>
    </html>
  )
}
