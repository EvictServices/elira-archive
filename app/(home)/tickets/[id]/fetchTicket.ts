import type { TicketData } from './types'

export async function fetchTicket(ticketId: string): Promise<TicketData | null> {
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
  } catch {
    return null
  }
}

export async function fetchUserInfo(userId: string): Promise<{ username?: string; avatar?: string; bot?: boolean; discriminator?: string } | null> {
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
