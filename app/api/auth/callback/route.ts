import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode, fetchDiscordUser } from '@/lib/discord'
import { createSession, sessionCookieOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    const tokenData = await exchangeCode(code)
    const user = await fetchDiscordUser(tokenData.access_token)

    const token = await createSession({
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      discriminator: user.discriminator,
      accessToken: tokenData.access_token,
      email: user.email ?? null,
    })

    const res = NextResponse.redirect(new URL('/dashboard', req.url))
    res.cookies.set(sessionCookieOptions(token))
    return res
  } catch (err) {
    console.error('Auth callback error:', err)
    return NextResponse.redirect(new URL('/?error=auth_failed', req.url))
  }
}
