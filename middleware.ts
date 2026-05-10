import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/dashboard']
const SESSION_ID_RE = /^[a-f0-9]{64}$/

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (!isProtected) return NextResponse.next()

  const sid = req.cookies.get('session')?.value
  if (!sid) {
    return NextResponse.redirect(new URL('/api/auth/login', req.url))
  }

  if (sid.includes('.')) {
    const res = NextResponse.redirect(new URL('/api/auth/login', req.url))
    res.cookies.delete('session')
    return res
  }

  if (!SESSION_ID_RE.test(sid)) {
    const res = NextResponse.redirect(new URL('/api/auth/login', req.url))
    res.cookies.delete('session')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
