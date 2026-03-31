import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AvatarsView from './AvatarsView'

export const metadata: Metadata = {
  title: 'Avatar History',
}

interface Avatar {
  url: string
  created_at: number
}

interface AvatarsResponse {
  avatars: Avatar[]
}

interface UserInfo {
  display_name?: string
  username?: string
}

async function fetchAvatars(userId: string): Promise<Avatar[]> {
  try {
    const res = await fetch(`https://cdn.azron.net/api/cdn/avatars/evict/${userId}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) return []

    const data: AvatarsResponse = await res.json()
    return data.avatars || []
  } catch {
    return []
  }
}

async function fetchUserInfo(userId: string): Promise<UserInfo | null> {
  try {
    const res = await fetch('http://localhost:6978/user/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
      next: { revalidate: 300 },
    })

    if (!res.ok) return null

    const data: UserInfo = await res.json()
    return data
  } catch {
    return null
  }
}

export default async function AvatarsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!id || !/^\d+$/.test(id)) {
    notFound()
  }

  const [avatars, userInfo] = await Promise.all([
    fetchAvatars(id),
    fetchUserInfo(id),
  ])

  if (avatars.length === 0) {
    notFound()
  }

  const sortedAvatars = avatars.sort((a, b) => b.created_at - a.created_at)
  const username = userInfo?.username || null

  return <AvatarsView avatars={sortedAvatars} userId={id} username={username} />
}
