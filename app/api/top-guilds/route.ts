import { NextResponse } from 'next/server'
import { fetchTopGuilds } from '@/lib/topGuilds'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const guilds = await fetchTopGuilds(24)
    return NextResponse.json(
      { guilds },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' } }
    )
  } catch {
    return NextResponse.json({ guilds: [] }, { status: 500 })
  }
}
