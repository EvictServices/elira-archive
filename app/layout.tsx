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
    'Advanced Discord bot with comprehensive moderation, robust antinuke protection, and versatile utility tools.',
  icons: { icon: '/img/evict.webp' },
}

export const viewport: Viewport = {
  themeColor: '#1c2137',
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
