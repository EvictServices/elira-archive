import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { oauthStateCookieSet } from '@/lib/auth'
import { buildDiscordAuthorizeUrl } from '@/lib/discord'

export async function GET() {
  const state = randomBytes(24).toString('hex')
  const res = NextResponse.redirect(buildDiscordAuthorizeUrl(state))
  res.cookies.set(oauthStateCookieSet(state))
  return res
}
