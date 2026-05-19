import type { Metadata } from 'next'
import HomeView from '@/components/home/HomeView'

export const metadata: Metadata = {
  title: 'Evict',
  description:
    'Advanced Discord bot with comprehensive moderation, robust antinuke protection, and versatile utility tools.',
}

export default function HomePage() {
  return <HomeView />
}
