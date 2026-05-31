import type { Metadata } from 'next'
import HomeView from '@/components/home/home-view'
import { getCachedTopGuilds } from '@/lib/marketing/top-guilds'

export const metadata: Metadata = {
  title: 'Evict',
  description:
    'Advanced Discord bot with comprehensive moderation, robust antinuke protection, and versatile utility tools.',
}

export default async function HomePage() {
  const topGuilds = await getCachedTopGuilds()
  return <HomeView topGuilds={topGuilds} />
}
