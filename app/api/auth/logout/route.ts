import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, destroySession, oauthStateCookieClear } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await destroySession()
  const res = NextResponse.redirect(new URL('/', req.url))
  res.cookies.set(clearSessionCookie())
  res.cookies.set(oauthStateCookieClear())
  return res
}
