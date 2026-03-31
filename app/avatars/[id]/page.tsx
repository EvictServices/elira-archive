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

export default async function AvatarsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!id || !/^\d+$/.test(id)) {
    notFound()
  }

  const avatars = await fetchAvatars(id)

  if (avatars.length === 0) {
    notFound()
  }

  const sortedAvatars = avatars.sort((a, b) => b.created_at - a.created_at)

  return <AvatarsView avatars={sortedAvatars} userId={id} />
}
