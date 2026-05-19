type UserInfo = {
  username?: string
  display_name?: string
  avatar?: string
  bot?: boolean
  discriminator?: string
}

import { CLUSTER_API_BASE } from '@/lib/cluster/config'

function normalizeUserRow(row: Record<string, unknown>): { id: string; info: UserInfo } | null {
  const rawId = row.user_id ?? row.id
  if (rawId === undefined || rawId === null) return null
  const id = String(rawId)
  const display_name =
    (typeof row.display_name === 'string' && row.display_name.trim()) ||
    (typeof row.global_name === 'string' && row.global_name.trim()) ||
    undefined
  const username =
    (typeof row.username === 'string' && row.username.trim()) || undefined
  const avatarRaw =
    (typeof row.avatar === 'string' && row.avatar) ||
    (typeof row.avatar_url === 'string' && row.avatar_url) ||
    undefined
  const avatar = avatarRaw?.trim() ? avatarRaw.trim() : undefined
  return {
    id,
    info: {
      username,
      display_name,
      avatar,
      bot: typeof row.bot === 'boolean' ? row.bot : undefined,
      discriminator: typeof row.discriminator === 'string' ? row.discriminator : undefined,
    },
  }
}

function parseUsersArray(data: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (data && typeof data === 'object' && Array.isArray((data as { users?: unknown }).users)) {
    return (data as { users: Record<string, unknown>[] }).users
  }
  return null
}

export async function fetchUserInfoBatch(userIds: string[]): Promise<Map<string, UserInfo>> {
  const result = new Map<string, UserInfo>()
  if (userIds.length === 0) return result

  const unique = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))]

  try {
    const response = await fetch(`${CLUSTER_API_BASE}/users/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: unique }),
      cache: 'no-store',
    })
    if (response.ok) {
      const data: unknown = await response.json()
      const rows = parseUsersArray(data)
      if (rows) {
        for (const row of rows) {
          const n = normalizeUserRow(row)
          if (n) result.set(n.id, n.info)
        }
      }
    }
  } catch {
    /* fall through to per-user */
  }

  const missing = unique.filter((id) => !result.has(id))
  await Promise.all(
    missing.map(async (userId) => {
      try {
        const response = await fetch(`${CLUSTER_API_BASE}/user/find`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
          cache: 'no-store',
        })
        if (!response.ok) return
        const data: unknown = await response.json()
        if (!data || typeof data !== 'object') return
        const row = data as Record<string, unknown>
        const n = normalizeUserRow(row)
        if (n) {
          result.set(userId, n.info)
          return
        }
        const display_name =
          (typeof row.display_name === 'string' && row.display_name.trim()) ||
          (typeof row.global_name === 'string' && row.global_name.trim()) ||
          undefined
        const username =
          (typeof row.username === 'string' && row.username.trim()) || undefined
        const avatarRaw =
          (typeof row.avatar === 'string' && row.avatar) ||
          (typeof row.avatar_url === 'string' && row.avatar_url) ||
          undefined
        const avatar = avatarRaw?.trim() ? avatarRaw.trim() : undefined
        if (username || display_name || avatar) {
          result.set(userId, { username, display_name, avatar })
        }
      } catch {
        /* skip */
      }
    })
  )

  return result
}
