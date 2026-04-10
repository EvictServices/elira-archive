import { NextResponse } from 'next/server'
import { DISCORD_AUTH_URL } from '@/lib/discord'

export async function GET() {
  return NextResponse.redirect(DISCORD_AUTH_URL)
}
