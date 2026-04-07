import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TicketView from './TicketView'
import { fetchTicket } from './fetchTicket'
import { fetchUserInfoBatch } from '@/lib/fetchUsers'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: id ? `Ticket #${id}` : 'Ticket Transcript',
  }
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

  const messageAuthorIds = new Set(ticketData.ticket.messages.map((m) => m.author_id))
  const involvedIds = new Set<string>(messageAuthorIds)
  if (ticketData.ticket.ticket.opened_by_id) involvedIds.add(ticketData.ticket.ticket.opened_by_id)
  if (ticketData.ticket.ticket.closed_by_id) involvedIds.add(ticketData.ticket.ticket.closed_by_id)
  const people = [...involvedIds]

  const allUserIds = [...new Set([...userIds, ...people])]

  const freshUsersMap = await fetchUserInfoBatch(allUserIds)

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
