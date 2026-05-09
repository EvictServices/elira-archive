import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { fetchMutualGuilds, fetchGuild, type MutualGuild } from '@/lib/cluster'
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

  const guilds: MutualGuild[] = clusterGuilds.filter((g) => adminGuildIds.has(g.id))

  // Add Discord guilds with admin that the cluster missed (inactive shards)
  const includedIds = new Set(guilds.map((g) => g.id))
  for (const dg of discordGuilds) {
    if (adminGuildIds.has(dg.id) && !includedIds.has(dg.id)) {
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

  const enriched = await Promise.all(
    guilds.map(async (g) => {
      if (g.member_count > 0) return g
      try {
        const full = await fetchGuild(g.id)
        return { ...g, member_count: full.member_count || 0 }
      } catch {
        return g
      }
    })
  )

  const managedIds = new Set(enriched.map((g) => g.id))
  const inviteGuilds = discordGuilds
    .filter((dg) => adminGuildIds.has(dg.id) && !managedIds.has(dg.id))
    .map((dg) => ({
      id: dg.id,
      name: dg.name,
      icon_url: dg.icon
        ? `https://cdn.discordapp.com/icons/${dg.id}/${dg.icon}.webp?size=128`
        : null,
    }))

  return (
    <DashboardView
      user={{
        id: session.userId,
        username: session.username,
        avatar: session.avatar,
      }}
      guilds={enriched}
      inviteGuilds={inviteGuilds}
    />
  )
}
