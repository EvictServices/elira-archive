import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { fetchMutualGuilds } from '@/lib/cluster'
import DashboardView from './DashboardView'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/api/auth/login')

  const guilds = await fetchMutualGuilds(session.userId)

  return (
    <DashboardView
      user={{
        id: session.userId,
        username: session.username,
        avatar: session.avatar,
      }}
      guilds={guilds}
    />
  )
}
