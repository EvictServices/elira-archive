import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TicketView from './TicketView'
import { fetchTicket, fetchUserInfo } from './fetchTicket'

export const metadata: Metadata = {
  title: 'Ticket Transcript',
}

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const ticketData = await fetchTicket(id)

  if (!ticketData || !ticketData.ticket) {
    notFound()
  }

  const userIds = ticketData.ticket.users.map((u) => u.id)
  const people = ticketData.people || []
  const allUserIds = [...new Set([...userIds, ...people])]

  const freshResults = await Promise.all(allUserIds.map((uid) => fetchUserInfo(uid)))
  const freshUsersMap = new Map<string, { username?: string; avatar?: string; bot?: boolean; discriminator?: string }>()
  allUserIds.forEach((uid, i) => {
    if (freshResults[i]) freshUsersMap.set(uid, freshResults[i]!)
  })

  ticketData.ticket.users = ticketData.ticket.users.map((user) => {
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
        ticketData.ticket.users.push({
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

  return <TicketView ticketData={ticketData} ticketId={id} />
}
