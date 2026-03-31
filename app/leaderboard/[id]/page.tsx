import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import LeaderboardView from './LeaderboardView'

export const metadata: Metadata = {
  title: 'Leaderboard',
}

interface LevelRow {
  user_id: string
  xp: number
  level: number
  total_xp: number
}

interface UserInfo {
  username?: string
  avatar?: string | null
}

interface GuildInfo {
  name?: string
  icon?: string | null
}

async function fetchGuildInfo(guildId: string): Promise<GuildInfo | null> {
  try {
    const response = await fetch('http://127.0.0.1:6978/guild', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{"guild_id": ${guildId}}`,
      next: { revalidate: 60 },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data || null
  } catch {
    return null
  }
}

async function fetchUserInfo(userId: string): Promise<UserInfo | null> {
  try {
    const response = await fetch('http://127.0.0.1:6978/user/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{"user_id": ${userId}}`,
      next: { revalidate: 60 },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data || null
  } catch {
    return null
  }
}

export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id || !/^\d+$/.test(id)) {
    notFound()
  }

  let rows: LevelRow[]
  try {
    const result = await pool.query(
      `SELECT user_id::text, xp, level, total_xp
       FROM level.member
       WHERE guild_id = $1
       ORDER BY total_xp DESC
       LIMIT 100`,
      [id]
    )
    rows = result.rows
  } catch {
    notFound()
  }

  if (rows.length === 0) {
    notFound()
  }

  const [guildInfo, ...userInfos] = await Promise.all([
    fetchGuildInfo(id),
    ...rows.map((r) => fetchUserInfo(r.user_id)),
  ])

  const members = rows.map((r, i) => ({
    user_id: r.user_id,
    xp: r.xp,
    level: r.level,
    total_xp: r.total_xp,
    username: userInfos[i]?.username || null,
    avatar: userInfos[i]?.avatar || null,
  }))

  return (
    <LeaderboardView
      members={members}
      guildId={id}
      guildName={(guildInfo as GuildInfo | null)?.name || null}
      guildIcon={(guildInfo as GuildInfo | null)?.icon || null}
    />
  )
}
