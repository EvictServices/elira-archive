import { NextResponse } from 'next/server'
import http from 'http'

export async function GET() {
  return new Promise<NextResponse>((resolve) => {
    http
      .get('http://127.0.0.1:8000/health', { headers: { Accept: 'application/json' } }, (upstream) => {
        let data = ''
        upstream.on('data', (chunk: Buffer) => { data += chunk })
        upstream.on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve(
              NextResponse.json(json.system || {}, {
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
