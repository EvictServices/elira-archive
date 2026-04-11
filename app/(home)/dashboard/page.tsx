import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { fetchMutualGuilds, type MutualGuild } from '@/lib/cluster'
import { fetchDiscordGuilds } from '@/lib/discord'
import DashboardView from './DashboardView'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/api/auth/login')

  const [clusterGuilds, discordGuilds] = await Promise.all([
    fetchMutualGuilds(session.userId).catch(() => [] as MutualGuild[]),
    fetchDiscordGuilds(session.accessToken).catch(() => []),
  ])

  const ADMINISTRATOR = BigInt(0x8)
  const adminGuildIds = new Set(
    discordGuilds
      .filter((dg) => dg.owner || (BigInt(dg.permissions) & ADMINISTRATOR) !== BigInt(0))
      .map((dg) => dg.id)
  )

  console.log('[dashboard] cluster guilds:', clusterGuilds.length, clusterGuilds.map(g => g.id))
  console.log('[dashboard] discord guilds:', discordGuilds.length, discordGuilds.map(dg => ({ id: dg.id, owner: dg.owner, perms: dg.permissions })))
  console.log('[dashboard] admin guild IDs:', [...adminGuildIds])

  const guilds: MutualGuild[] = clusterGuilds.filter((g) => adminGuildIds.has(g.id))
  console.log('[dashboard] filtered guilds:', guilds.length, guilds.map(g => g.id))

  if (clusterGuilds.length === 0) {
    for (const dg of discordGuilds) {
      if (adminGuildIds.has(dg.id)) {
        guilds.push({
          id: dg.id,
          name: dg.name,
          icon_url: dg.icon
            ? `https://cdn.discordapp.com/icons/${dg.id}/${dg.icon}.webp?size=128`
            : null,
          member_count: 0,
        })
      }
    }
  }

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
