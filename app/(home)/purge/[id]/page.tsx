import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PurgeView from './PurgeView'
import { fetchPurge } from './fetchPurge'
import { fetchUserInfoBatch } from '@/lib/fetchUsers'

export const metadata: Metadata = {
  title: 'Purge Log',
}

export default async function PurgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const purgeData = await fetchPurge(id)

  if (!purgeData || !purgeData.purge) {
    notFound()
  }

  const userIds = purgeData.purge.users.map((u) => u.id)

  const messageAuthorIds = new Set(purgeData.purge.messages.map((m) => m.author_id))
  const involvedIds = new Set<string>(messageAuthorIds)
  if (purgeData.purge.moderator_id) involvedIds.add(String(purgeData.purge.moderator_id))
  const people = [...involvedIds]

  const allUserIds = [...new Set([...userIds, ...people])]

  const freshUsersMap = await fetchUserInfoBatch(allUserIds)

  purgeData.purge.users = purgeData.purge.users.map((user) => {
    const fresh = freshUsersMap.get(user.id)
    if (fresh) {
      return {
        ...user,
        username: fresh.username || user.username,
        avatar: fresh.avatar || user.avatar,
      }
    }
    return user
  })

  const existingIds = new Set(userIds)
  for (const pid of people) {
    if (!existingIds.has(pid)) {
      const fresh = freshUsersMap.get(pid)
      if (fresh) {
        purgeData.purge.users.push({
          id: pid,
          username: fresh.username || 'Unknown',
          global_name: null,
          discriminator: fresh.discriminator || '0',
          avatar: fresh.avatar || '',
          bot: fresh.bot || false,
        })
      }
    }
  }

  return <PurgeView purgeData={purgeData} purgeId={id} />
}
