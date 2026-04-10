import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_PATHS = ['/dashboard']

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/api/auth/login', req.url))
  }

  const secret = getSecret()
  if (!secret) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/api/auth/login', req.url))
    res.cookies.delete('session')
    return res
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
