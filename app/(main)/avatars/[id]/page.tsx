import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { preconnect } from 'react-dom'
import AvatarsView from '@/components/avatars/avatars-view'
import {
  getAvatarUserInfo,
  getCachedAvatars,
  sortAvatarsNewestFirst,
} from '@/lib/avatars/fetch'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const userInfo = await getAvatarUserInfo(id)
  const username = userInfo?.display_name || userInfo?.username || null
  return {
    title: username ? `${username} - Avatar History` : 'Avatar History',
  }
}

export default async function AvatarsPage({ params }: { params: Promise<{ id: string }> }) {
  preconnect('https://cdn.azron.net', { crossOrigin: 'anonymous' })

  const { id } = await params

  if (!id || !/^\d+$/.test(id)) {
    notFound()
  }

  const [avatars, userInfo] = await Promise.all([
    getCachedAvatars(id),
    getAvatarUserInfo(id),
  ])

  if (avatars.length === 0) {
    notFound()
  }

  const sortedAvatars = sortAvatarsNewestFirst(avatars)
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
