import { NextResponse } from 'next/server'
import { fetchTopGuilds } from '@/lib/marketing/top-guilds'
import { TOP_GUILDS_CACHE_TTL_SEC } from '@/lib/marketing/top-guilds-shared'

export const revalidate = 120

export async function GET() {
  try {
    const guilds = await fetchTopGuilds(24)
    return NextResponse.json(
      { guilds },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${TOP_GUILDS_CACHE_TTL_SEC}, stale-while-revalidate=${Math.floor(TOP_GUILDS_CACHE_TTL_SEC / 2)}`,
        },
      },
    )
  } catch (err) {
    console.error('[api/guilds/top]', err)
    return NextResponse.json({ guilds: [] })
  }
}
