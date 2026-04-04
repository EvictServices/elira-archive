// import type { Metadata } from 'next'
// import { notFound } from 'next/navigation'
// import pool from '@/lib/db'
// import LeaderboardView from './LeaderboardView'

// interface LevelRow {
//   user_id: string
//   xp: number
//   level: number
//   total_xp: number
// }

// interface UserInfo {
//   username?: string
//   avatar?: string | null
// }

// interface GuildInfo {
//   name?: string
//   icon?: string | null
// }

// async function fetchGuildInfo(guildId: string): Promise<GuildInfo | null> {
//   try {
//     const response = await fetch(`http://127.0.0.1:8000/guild/find?idx=${guildId}`, {
//       next: { revalidate: 60 },
//     })

//     if (!response.ok) return null

//     const data = await response.json()
//     return data || null
//   } catch {
//     return null
//   }
// }

// export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
//   const { id } = await params
//   const guild = await fetchGuildInfo(id)
//   return {
//     title: guild?.name ? `${guild.name} - Leaderboard` : 'Leaderboard',
//   }
// }

// async function fetchUsersInfo(userIds: string[]): Promise<Map<string, UserInfo>> {
//   const map = new Map<string, UserInfo>()
//   if (userIds.length === 0) return map

//   try {
//     const response = await fetch('http://127.0.0.1:8000/users/find', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ user_ids: userIds }),
//       next: { revalidate: 60 },
//     })

//     if (!response.ok) return map

//     const data: Array<{ id?: string; username?: string; avatar?: string | null }> = await response.json()
//     for (const user of data) {
//       if (user.id) {
//         map.set(user.id, { username: user.username, avatar: user.avatar })
//       }
//     }
//   } catch {
//     // ignore
//   }
//   return map
// }

// export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params

//   if (!id || !/^\d+$/.test(id)) {
//     notFound()
//   }

//   let rows: LevelRow[]
//   try {
//     const result = await pool.query(
//       `SELECT user_id::text, xp, level, total_xp
//        FROM level.member
//        WHERE guild_id = $1
//        ORDER BY total_xp DESC
//        LIMIT 100`,
//       [id]
//     )
//     rows = result.rows
//   } catch {
//     notFound()
//   }

//   if (rows.length === 0) {
//     notFound()
//   }

// //   const [guildInfo, usersMap] = await Promise.all([
// //     fetchGuildInfo(id),
// //     fetchUsersInfo(rows.map((r) => r.user_id)),
// //   ])

// //   const members = rows.map((r) => {
// //     const info = usersMap.get(r.user_id)
// //     return {
// //       user_id: r.user_id,
// //       xp: r.xp,
// //       level: r.level,
// //       total_xp: r.total_xp,
// //       username: info?.username || null,
// //       avatar: info?.avatar || null,
// //     }
// //   })

// //   return (
// //     <LeaderboardView
// //       members={members}
// //       guildId={id}
// //       guildName={(guildInfo as GuildInfo | null)?.name || null}
// //       guildIcon={(guildInfo as GuildInfo | null)?.icon || null}
// //     />
// //   )
// // }
