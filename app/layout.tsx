import type { Metadata, Viewport } from 'next'
import './globals.css'
import AppProviders from '@/components/layout/app-providers'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ScrollRevealInit from '@/components/layout/scroll-reveal-init'
import CursorEffects from '@/components/layout/cursor-effects'
import SiteDots from '@/components/layout/site-dots'

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
        <SiteDots />
      </body>
    </html>
  )
}
