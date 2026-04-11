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
  const session = await getSession()
  if (!session) redirect('/api/auth/login')

  const { id, tab } = await params

  let guild
  try {
    guild = await fetchGuild(id)
  } catch {
    redirect('/dashboard')
  }

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
