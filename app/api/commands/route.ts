import { NextResponse } from 'next/server'
import https from 'https'

export async function GET() {
  return new Promise<NextResponse>((resolve) => {
    https
      .get('https://api.evict.bot/commands', { headers: { Accept: 'application/json' } }, (upstream) => {
        let data = ''
        upstream.on('data', (chunk: Buffer) => { data += chunk })
        upstream.on('end', () => {
          try {
            resolve(
              NextResponse.json(JSON.parse(data), {
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
