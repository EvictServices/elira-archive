import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import CursorEffects from '@/components/CursorEffects'

export const metadata: Metadata = {
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
  themeColor: '#1a1a1a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="page">{children}</div>
        <Footer />
        <ScrollRevealInit />
        <CursorEffects />
      </body>
    </html>
  )
}
