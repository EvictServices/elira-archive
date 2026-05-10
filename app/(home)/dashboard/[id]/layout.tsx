import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import { redirect } from 'next/navigation'

export default async function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) {
    redirect('/api/auth/login')
  }

  const { id } = await params
  if (!(await hasGuildAdmin(session.accessToken, id))) {
    redirect('/dashboard')
  }

  return children
}
