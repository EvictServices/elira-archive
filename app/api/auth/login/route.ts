import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { oauthStateCookieSet } from '@/lib/auth/index'
import { authRateLimitLogin, clientIpFromRequest } from '@/lib/auth_ratelimit'
import { buildDiscordAuthorizeUrl } from '@/lib/discord/api'

export async function GET(req: NextRequest) {
  const ip = clientIpFromRequest(req)
  if (!(await authRateLimitLogin(ip))) {
    return NextResponse.redirect(new URL('/?error=rate_limit', req.url))
  }

  const state = randomBytes(24).toString('hex')
  const res = NextResponse.redirect(buildDiscordAuthorizeUrl(state))
  res.cookies.set(oauthStateCookieSet(state))
  return res
}
