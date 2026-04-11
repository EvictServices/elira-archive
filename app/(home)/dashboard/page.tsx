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

  // Build a set of guild IDs the bot knows about from the cluster
  const clusterIds = new Set(clusterGuilds.map((g) => g.id))

  // Discord guilds that are also in the cluster are mutual (bot is in them)
  // Use cluster data when available (richer), fill in from Discord for missing shards
  const guilds: MutualGuild[] = [...clusterGuilds]

  // Add any Discord guilds the cluster missed (shards were down)
  // We can't confirm the bot is in these, but we show what the cluster returned
  // If cluster returned nothing, fall back to showing Discord guilds with manage permission
  if (clusterGuilds.length === 0) {
    for (const dg of discordGuilds) {
      const perms = BigInt(dg.permissions)
      const MANAGE_GUILD = BigInt(0x20)
      if (dg.owner || (perms & MANAGE_GUILD) !== BigInt(0)) {
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
