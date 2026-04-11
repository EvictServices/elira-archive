import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { fetchGuild } from '@/lib/cluster'
import ServerSettingsView from '../ServerSettingsView'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const guild = await fetchGuild(id)
    return { title: guild.name }
  } catch {
    return { title: 'Server Settings' }
  }
}

export default async function ServerSettingsPage({ params }: { params: Promise<{ id: string; tab: string }> }) {
  const { id, tab } = await params

  const [session, guild] = await Promise.all([
    getSession(),
    fetchGuild(id).catch(() => null),
  ])

  if (!session) redirect('/api/auth/login')
  if (!guild) redirect('/dashboard')

  return (
    <ServerSettingsView
      guild={guild}
      activeTab={tab}
      user={{
        id: session.userId,
        username: session.username,
        avatar: session.avatar,
      }}
    />
  )
}
