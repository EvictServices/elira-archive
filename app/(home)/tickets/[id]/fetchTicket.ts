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
