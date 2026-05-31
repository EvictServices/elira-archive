import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AvatarsView from '@/components/avatars/avatars-view'

interface Avatar {
  id: number
  url: string
  created_at: number
}

interface AvatarsResponse {
  avatars: Avatar[]
}

interface UserInfo {
  display_name?: string
  username?: string
  avatar?: string | null
}

async function fetchUserInfoForMeta(userId: string): Promise<string | null> {
  try {
    const response = await fetch('http://127.0.0.1:8000/user/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.display_name || data?.username || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const username = await fetchUserInfoForMeta(id)
  return {
    title: username ? `${username} - Avatar History` : 'Avatar History',
  }
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
    const response = await fetch('http://127.0.0.1:8000/user/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
      next: { revalidate: 60 },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data || null
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

  const sortedAvatars = avatars.sort((a, b) => b.id - a.id)
  const username = userInfo?.display_name || userInfo?.username || null
  const avatarHash = userInfo?.avatar ?? null

  return (
    <AvatarsView
      avatars={sortedAvatars}
      userId={id}
      username={username}
      avatarHash={avatarHash}
    />
  )
}
