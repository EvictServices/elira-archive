import { NextResponse } from 'next/server'
import { fetchTopGuilds } from '@/lib/marketing/top-guilds'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const guilds = await fetchTopGuilds(24)
    return NextResponse.json(
      { guilds },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' } },
    )
  } catch (err) {
    console.error('[api/guilds/top]', err)
    return NextResponse.json({ guilds: [] })
  }
}
