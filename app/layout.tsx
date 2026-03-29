import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GradientCanvas from '@/components/GradientCanvas'
import ScrollRevealInit from '@/components/ScrollRevealInit'

export const metadata: Metadata = {
  title: {
    default: 'evict',
    template: '%s | evict',
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
        <Script src="/js/gradient.js" strategy="afterInteractive" />
        <GradientCanvas />
        <Navbar />
        <div className="page">{children}</div>
        <Footer />
        <ScrollRevealInit />
      </body>
    </html>
  )
}
