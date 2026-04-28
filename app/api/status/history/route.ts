import { NextResponse } from 'next/server'
import http from 'http'

const POINTS = 60
const INTERVAL = 3000

interface HistoryBuffer {
  latency: number[]
  cpu: number[]
  memory: number[]
  network: number[]
  lastRx: number | null
  lastTx: number | null
  lastTs: number | null
}

const g = globalThis as typeof globalThis & {
  _statusBuf?: HistoryBuffer
  _statusTimer?: ReturnType<typeof setInterval>
}

if (!g._statusBuf) {
  g._statusBuf = { latency: [], cpu: [], memory: [], network: [], lastRx: null, lastTx: null, lastTs: null }
}
const buf = g._statusBuf

function push(arr: number[], val: number) {
  arr.push(val)
  if (arr.length > POINTS) arr.shift()
}

function fetchUpstream(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = http.get(
      'http://127.0.0.1:8000/health',
      { headers: { Accept: 'application/json' }, timeout: 4000 },
      (res) => {
        let data = ''
        res.on('data', (chunk: Buffer) => { data += chunk })
        res.on('end', () => {
          try { resolve(JSON.parse(data)) } catch { reject(new Error('parse')) }
        })
      }
    )
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function collect() {
  try {
    const raw = await fetchUpstream() as {
      clusters?: Record<string, { shards?: Array<{ latency: number }> }>
      system?: {
        cpu?: { percent: number }
        memory?: { used: number }
        network?: { bytes_recv: number; bytes_sent: number }
      }
    }

    const allLats: number[] = []
    for (const c of Object.values(raw.clusters ?? {})) {
      for (const s of c.shards ?? []) {
        if (s.latency > 0) allLats.push(s.latency)
      }
    }
    const avgLat = allLats.length
      ? Math.round((allLats.reduce((a, b) => a + b, 0) / allLats.length) * 1000)
      : 0
    push(buf.latency, avgLat)

    const sys = raw.system ?? {}
    const cpu = sys.cpu?.percent ?? 0
    const memMb = Math.round((sys.memory?.used ?? 0) / 1048576)
    const rx = sys.network?.bytes_recv ?? 0
    const tx = sys.network?.bytes_sent ?? 0
    push(buf.cpu, cpu)
    push(buf.memory, memMb)

    const ts = Date.now()
    let netRate = 0
    if (buf.lastRx !== null && buf.lastTx !== null && buf.lastTs !== null) {
      const dt = Math.max(1, (ts - buf.lastTs) / 1000)
      netRate = (Math.max(0, rx - buf.lastRx) + Math.max(0, tx - buf.lastTx)) / dt
    }
    buf.lastRx = rx
    buf.lastTx = tx
    buf.lastTs = ts
    push(buf.network, netRate)
  } catch {
  }
}

if (!g._statusTimer) {
  collect()
  g._statusTimer = setInterval(collect, INTERVAL)
  if (typeof g._statusTimer === 'object' && 'unref' in g._statusTimer) {
    (g._statusTimer as NodeJS.Timeout).unref()
  }
}

export async function GET() {
  return NextResponse.json(
    {
      latency: [...buf.latency],
      cpu: [...buf.cpu],
      memory: [...buf.memory],
      network: [...buf.network],
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
