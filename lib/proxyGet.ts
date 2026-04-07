import { NextResponse } from 'next/server'
import http from 'http'

export function proxyGet(
  url: string,
  transform?: (data: unknown) => unknown
): Promise<NextResponse> {
  return new Promise<NextResponse>((resolve) => {
    http
      .get(url, { headers: { Accept: 'application/json' } }, (upstream) => {
        let data = ''
        upstream.on('data', (chunk: Buffer) => { data += chunk })
        upstream.on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve(
              NextResponse.json(transform ? transform(json) : json, {
                status: upstream.statusCode ?? 200,
                headers: { 'Cache-Control': 'no-store' },
              })
            )
          } catch {
            resolve(NextResponse.json({ error: 'parse error' }, { status: 502 }))
          }
        })
      })
      .on('error', () => resolve(NextResponse.json({ error: 'upstream error' }, { status: 502 })))
  })
}
