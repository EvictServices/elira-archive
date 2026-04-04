import type { PurgeData } from './types'

export async function fetchPurge(purgeId: string): Promise<PurgeData | null> {
  try {
    const response = await fetch('http://cdn.azron.net/api/purges/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdn_9a4e7b1d0f2c4e6a8d3b5c7f1e2a9b4c',
      },
      body: JSON.stringify({ id: purgeId, bot: 'evict' }),
      next: { revalidate: 300 },
    })

    if (!response.ok) return null

    const data: PurgeData = await response.json()
    return data
  } catch {
    return null
  }
}

export async function fetchUserInfoBatch(userIds: string[]): Promise<Map<string, { username?: string; avatar?: string; bot?: boolean; discriminator?: string }>> {
  const result = new Map<string, { username?: string; avatar?: string; bot?: boolean; discriminator?: string }>()
  if (userIds.length === 0) return result

  try {
    const response = await fetch('http://127.0.0.1:8000/users/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: userIds }),
      next: { revalidate: 60 },
    })

    if (!response.ok) return result

    const data = await response.json()
    if (Array.isArray(data)) {
      data.forEach((user: { id?: string; username?: string; avatar?: string; bot?: boolean; discriminator?: string }) => {
        if (user?.id) result.set(user.id, user)
      })
    }
  } catch {
    // fall through with empty map
  }

  return result
}
