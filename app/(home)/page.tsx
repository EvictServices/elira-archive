import type { Metadata } from 'next'
import HomeView from '@/components/HomeView'

export const metadata: Metadata = {
  title: 'Evict',
  description:
    'The all-in-one solution for seamless server management — powerful, polished, and visually refined.',
}

export default function HomePage() {
  return <HomeView />
}
