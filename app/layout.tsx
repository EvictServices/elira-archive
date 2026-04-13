import type { Metadata, Viewport } from 'next'
import { Outfit, Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const ScrollRevealInit = dynamic(() => import('@/components/ScrollRevealInit'), { ssr: false })
const CursorEffects = dynamic(() => import('@/components/CursorEffects'), { ssr: false })

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-outfit',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-inter',
})

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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
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
