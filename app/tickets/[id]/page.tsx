import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TicketView from './TicketView'

export const metadata: Metadata = {
  title: 'Ticket Transcript',
}

interface Message {
  id: string
  author_id: string
  content: string
  timestamp: string
  edited_timestamp: string | null
  pinned: boolean
}

interface User {
  id: string
  username: string
  global_name: string | null
  discriminator: string
  avatar: string
  bot: boolean
}

interface Attachment {
  filename: string
  url: string
  file_size: number
  message_id: string
}

interface EmbedField {
  name: string
  value: string
  inline: boolean
}

interface Embed {
  author: { icon_url: string | null; name: string | null; url: string | null } | null
  color: string | null
  description: string | null
  fields: EmbedField[]
  footer: { icon_url: string | null; text: string | null } | null
  image: { url: string | null } | null
  message_id: string
  thumbnail: { url: string | null } | null
  timestamp: string | null
  title: string | null
  url: string | null
}

interface TicketData {
  ticket: {
    messages: Message[]
    users: User[]
    attachments: Attachment[]
    embeds: Embed[]
    channel: {
      name: string
      created_at: string
    }
  }
}

async function fetchTicket(ticketId: string): Promise<TicketData | null> {
  try {
    const response = await fetch('http://cdn.azron.net/api/tickets/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdn_9a4e7b1d0f2c4e6a8d3b5c7f1e2a9b4c',
      },
      body: JSON.stringify({ id: ticketId, bot: 'evict' }),
      next: { revalidate: 300 },
    })

    if (!response.ok) return null

    const data: TicketData = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return null
  }
}

async function fetchUserInfo(userId: string): Promise<{ username?: string; avatar?: string } | null> {
  try {
    const response = await fetch('http://127.0.0.1:6978/user/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{"user_id": ${userId}}`,
      next: { revalidate: 60 },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data || null
  } catch {
    return null
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
  const freshUsers = await Promise.all(userIds.map((uid) => fetchUserInfo(uid)))

  ticketData.ticket.users = ticketData.ticket.users.map((user, i) => {
    const fresh = freshUsers[i]
    if (fresh) {
      return {
        ...user,
        username: fresh.username || user.username,
        avatar: fresh.avatar || user.avatar,
      }
    }
    return user
  })

  return <TicketView ticketData={ticketData} ticketId={id} />
}
