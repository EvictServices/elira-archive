import { NextRequest } from 'next/server'
import { proxyGet } from '@/lib/cluster/proxy'

export function GET(req: NextRequest) {
  const idx = req.nextUrl.searchParams.get('idx') ?? ''
  return proxyGet(`http://127.0.0.1:8000/guild/find?idx=${encodeURIComponent(idx)}`)
}
