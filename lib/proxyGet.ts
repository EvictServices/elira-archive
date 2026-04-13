import { NextResponse } from 'next/server'
import http from 'http'

const UPSTREAM_TIMEOUT = 5000
const MEM_TTL = 30_000

const cache = new Map<string, { data: unknown; ts: number }>()

export function proxyGet(
  url: string,
  transform?: (data: unknown) => unknown
): Promise<NextResponse> {
  const key = url
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < MEM_TTL) {
    const body = transform ? transform(cached.data) : cached.data
    return Promise.resolve(
      NextResponse.json(body, {
        headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60' },
      })
    )
  }

  return new Promise<NextResponse>((resolve) => {
    const req = http
      .get(url, { headers: { Accept: 'application/json' }, timeout: UPSTREAM_TIMEOUT }, (upstream) => {
        let data = ''
        upstream.on('data', (chunk: Buffer) => { data += chunk })
        upstream.on('end', () => {
          try {
            const json = JSON.parse(data)
            cache.set(key, { data: json, ts: Date.now() })
            resolve(
              NextResponse.json(transform ? transform(json) : json, {
                status: upstream.statusCode ?? 200,
                headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60' },
              })
            )
          } catch {
            resolve(NextResponse.json({ error: 'parse error' }, { status: 502 }))
          }
        })
      })
      .on('timeout', () => { req.destroy(); resolve(NextResponse.json({ error: 'upstream timeout' }, { status: 504 })) })
      .on('error', () => resolve(NextResponse.json({ error: 'upstream error' }, { status: 502 })))
  })
}
