import type { PurgeData } from './types'

const API_URL = 'https://cdn.azron.net/api'
const API_KEY = 'Bearer cdn_9a4e7b1d0f2c4e6a8d3b5c7f1e2a9b4c'
const headers = { Authorization: API_KEY, 'Content-Type': 'application/json' }

export async function fetchPurge(purgeId: string): Promise<PurgeData | null> {
  try {
    const response = await fetch(`${API_URL}/purge/fetch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: purgeId, bot: 'evict' }),
      next: { revalidate: 300 },
    })

    if (!response.ok) return null

    const data: PurgeData = await response.json()
    return data
  } catch {
    return null
  }
}
