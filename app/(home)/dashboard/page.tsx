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

  /** Cluster may return the same guild more than once (e.g. per-shard); keep one row per id. */
  const clusterAdminGuilds = clusterGuilds.filter((g) => adminGuildIds.has(g.id))
  const byId = new Map<string, MutualGuild>()
  for (const g of clusterAdminGuilds) {
    const prev = byId.get(g.id)
    if (!prev) {
      byId.set(g.id, g)
    } else {
      const a = g.member_count ?? 0
      const b = prev.member_count ?? 0
      if (a > b) byId.set(g.id, g)
    }
  }
  const confirmed: MutualGuild[] = [...byId.values()]
  const confirmedIds = new Set(confirmed.map((g) => g.id))

  /**
   * Admin guilds the cluster didn't return could be either:
   *   - bot IS in the guild but the shard was inactive (cluster missed it), or
   *   - bot is NOT in the guild at all.
   * Probe each via fetchGuild: success → recovered mutual; failure → invite candidate.
   */
  const missingAdminGuilds = discordGuilds.filter(
    (dg) => adminGuildIds.has(dg.id) && !confirmedIds.has(dg.id)
  )
  const probeResults = await Promise.all(
    missingAdminGuilds.map(async (dg) => {
      try {
        const full = await fetchGuild(dg.id)
        const recovered: MutualGuild = {
          id: dg.id,
          name: dg.name,
          icon_url: dg.icon
            ? `https://cdn.discordapp.com/icons/${dg.id}/${dg.icon}.webp?size=128`
            : null,
          member_count: full.member_count || 0,
        }
        return { mutual: recovered as MutualGuild | null, invite: null as typeof dg | null }
      } catch {
        return { mutual: null as MutualGuild | null, invite: dg as typeof dg | null }
      }
    })
  )

  const recovered: MutualGuild[] = []
  const inviteCandidates: typeof missingAdminGuilds = []
  for (const r of probeResults) {
    if (r.mutual) recovered.push(r.mutual)
    else if (r.invite) inviteCandidates.push(r.invite)
  }

  const enriched = await Promise.all(
    confirmed.map(async (g) => {
      if (g.member_count > 0) return g
      try {
        const full = await fetchGuild(g.id)
        return { ...g, member_count: full.member_count || 0 }
      } catch {
        return g
      }
    })
  )

  const bannerByGuildId = new Map<string, string>()
  for (const dg of discordGuilds) {
    if (dg.banner) {
      const animated = dg.banner.startsWith('a_')
      const ext = animated ? 'gif' : 'webp'
      bannerByGuildId.set(
        dg.id,
        `https://cdn.discordapp.com/banners/${dg.id}/${dg.banner}.${ext}?size=512`
      )
    }
  }

  const guilds = [...enriched, ...recovered].map((g) => ({
    ...g,
    banner_url: bannerByGuildId.get(g.id) ?? null,
  }))

  const inviteGuilds = inviteCandidates.map((dg) => ({
    id: dg.id,
    name: dg.name,
    icon_url: dg.icon
      ? `https://cdn.discordapp.com/icons/${dg.id}/${dg.icon}.webp?size=128`
      : null,
    banner_url: bannerByGuildId.get(dg.id) ?? null,
  }))

  return (
    <DashboardView
      user={{
        id: session.userId,
        username: session.username,
        avatar: session.avatar,
      }}
      guilds={guilds}
      inviteGuilds={inviteGuilds}
    />
  )
}
