import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { AvatarRecord, AvatarUserInfo } from '@/lib/avatars/types'

const AVATARS_REVALIDATE_SEC = 300
const USER_REVALIDATE_SEC = 60

async function fetchAvatarsFromCdn(userId: string): Promise<AvatarRecord[]> {
  const res = await fetch(`https://cdn.azron.net/api/cdn/avatars/evict/${userId}`, {
    next: { revalidate: AVATARS_REVALIDATE_SEC },
  })
  if (!res.ok) return []
  const data = (await res.json()) as { avatars?: AvatarRecord[] }
  return data.avatars ?? []
}

async function fetchUserInfoFromCluster(userId: string): Promise<AvatarUserInfo | null> {
  const res = await fetch('http://127.0.0.1:8000/user/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
    next: { revalidate: USER_REVALIDATE_SEC },
  })
  if (!res.ok) return null
  return (await res.json()) as AvatarUserInfo
}

export function getCachedAvatars(userId: string): Promise<AvatarRecord[]> {
  return unstable_cache(
    () => fetchAvatarsFromCdn(userId),
    ['avatars', userId],
    { revalidate: AVATARS_REVALIDATE_SEC },
  )()
}

/** Dedupes user lookup between `generateMetadata` and the page in one request. */
export const getAvatarUserInfo = cache(fetchUserInfoFromCluster)

export function sortAvatarsNewestFirst(avatars: AvatarRecord[]): AvatarRecord[] {
  return [...avatars].sort((a, b) => b.id - a.id)
}
