import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { fetchGuildChannels } from '@/lib/cluster'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const channels = await fetchGuildChannels(id)
    const textChannels = channels
      .filter((c) => c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5)
      .sort((a, b) => a.position - b.position)
    return NextResponse.json(textChannels)
  } catch {
    return NextResponse.json([])
  }
}
