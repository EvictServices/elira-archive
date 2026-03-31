'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const POLL = 5000
const POINTS = 40

interface Shard {
  id: number
  guilds: number
  users: number
  latency: number
  uptime: number
}

interface ClusterData {
  alive: boolean
  guilds: number
  users: number
  shards: Shard[]
  uptime: number
}

interface TopCmd {
  command_name: string
  category: string
  count: number
}

interface History {
  latency: number[]
  cpu: number[]
  memory: number[]
  network: number[]
}

const COLORS: Record<string, { stroke: string; fill: string }> = {
  accent: { stroke: '#4a5568', fill: 'rgba(74,85,104,0.08)' },
  green: { stroke: '#2d3748', fill: 'rgba(45,55,72,0.08)' },
  orange: { stroke: '#1a202c', fill: 'rgba(26,32,44,0.08)' },
  purple: { stroke: '#2d3748', fill: 'rgba(45,55,72,0.08)' },
}

function renderChartToEl(
  el: HTMLDivElement,
  data: number[],
  maxVal: number,
  colorKey: string,
  fmtFn: (v: number) => string,
  idSuffix: string
) {
  while (data.length < POINTS) data.unshift(0)
  if (data.length > POINTS) data.splice(0, data.length - POINTS)
  const w = 400,
    h = 100,
    pad = 1
  const m = maxVal > 0 ? maxVal : 1
  const c = COLORS[colorKey] ?? COLORS.accent
  const pts = data.map((v, i) => ({
    x: pad + (i / (POINTS - 1)) * (w - pad * 2),
    y: h - pad - (v / m) * (h - pad * 2),
    v,
  }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${h} L${pts[0].x.toFixed(1)},${h} Z`
  const last = pts[pts.length - 1]

  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="chart-svg">
      <defs>
        <linearGradient id="grad-${idSuffix}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c.stroke}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${c.stroke}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#grad-${idSuffix})" />
      <path d="${linePath}" fill="none" stroke="${c.stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3" fill="${c.stroke}" vector-effect="non-scaling-stroke"/>
      <line class="chart-hover-line" x1="0" y1="0" x2="0" y2="${h}" stroke="${c.stroke}" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="3,2" vector-effect="non-scaling-stroke" style="display:none"/>
      <circle class="chart-hover-dot" cx="0" cy="0" r="4" fill="${c.stroke}" stroke="#0d1017" stroke-width="1.5" vector-effect="non-scaling-stroke" style="display:none"/>
      <rect width="${w}" height="${h}" fill="transparent" class="chart-hit-area"/>
    </svg>
    <div class="chart-tooltip"></div>`

  const svg = el.querySelector<SVGSVGElement>('.chart-svg')!
  const tooltip = el.querySelector<HTMLDivElement>('.chart-tooltip')!
  const hoverLine = el.querySelector<SVGLineElement>('.chart-hover-line')!
  const hoverDot = el.querySelector<SVGCircleElement>('.chart-hover-dot')!
  let active = false

  function onMove(clientX: number) {
    const rect = svg.getBoundingClientRect()
    const xRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const idx = Math.round(xRatio * (pts.length - 1))
    if (idx < 0 || idx >= pts.length) return
    const p = pts[idx]
    hoverLine.setAttribute('x1', p.x.toFixed(1))
    hoverLine.setAttribute('x2', p.x.toFixed(1))
    hoverLine.style.display = ''
    hoverDot.setAttribute('cx', p.x.toFixed(1))
    hoverDot.setAttribute('cy', p.y.toFixed(1))
    hoverDot.style.display = ''
    tooltip.textContent = fmtFn(p.v)
    if (!active) {
      tooltip.classList.add('visible')
      active = true
    }
    tooltip.style.left = (p.x / w) * 100 + '%'
    tooltip.style.top = Math.max(0, (p.y / h) * 100 - 28) + '%'
  }
  function onLeave() {
    hoverLine.style.display = 'none'
    hoverDot.style.display = 'none'
    tooltip.classList.remove('visible')
    active = false
  }
  svg.addEventListener('mousemove', (e) => onMove(e.clientX))
  svg.addEventListener('mouseleave', onLeave)
  svg.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault()
      onMove(e.touches[0].clientX)
    },
    { passive: false }
  )
  svg.addEventListener('touchend', onLeave)
}

function fmtUptime(s?: number): string {
  if (!s || s <= 0) return '—'
  const d = Math.floor(s / 86400),
    h = Math.floor((s % 86400) / 3600),
    m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function fmtBytes(b: number): string {
  if (b < 1024) return b.toFixed(0) + ' B/s'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB/s'
  return (b / 1048576).toFixed(2) + ' MB/s'
}

function fmtMem(mb: number): string {
  if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB'
  return mb + ' MB'
}

function animateNum(setter: (v: string) => void, to: number, dur = 900) {
  const t0 = performance.now()
  let prev = 0
  const step = (now: number) => {
    const t = Math.min((now - t0) / dur, 1)
    const e = 1 - Math.pow(1 - t, 3)
    const v = Math.round(prev + (to - prev) * e)
    setter(v.toLocaleString())
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function StatusView() {
  const [guilds, setGuilds] = useState('—')
  const [users, setUsers] = useState('—')
  const [shards, setShards] = useState('—')
  const [latVal, setLatVal] = useState('—')
  const [cpuVal, setCpuVal] = useState('—')
  const [memVal, setMemVal] = useState('—')
  const [netVal, setNetVal] = useState('—')
  const [clusters, setClusters] = useState<Record<string, ClusterData>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [topCmds, setTopCmds] = useState<TopCmd[]>([])

  const histRef = useRef<History>({ latency: [], cpu: [], memory: [], network: [] })
  const lastRxRef = useRef<number | null>(null)
  const lastTxRef = useRef<number | null>(null)

  const chartLatRef = useRef<HTMLDivElement>(null)
  const chartCpuRef = useRef<HTMLDivElement>(null)
  const chartMemRef = useRef<HTMLDivElement>(null)
  const chartNetRef = useRef<HTMLDivElement>(null)

  const renderCharts = useCallback(() => {
    const h = histRef.current
    if (chartLatRef.current)
      renderChartToEl(chartLatRef.current, [...h.latency], Math.max(...h.latency, 50), 'accent', (v) => v.toFixed(0) + 'ms', 'lat')
    if (chartCpuRef.current) renderChartToEl(chartCpuRef.current, [...h.cpu], 100, 'orange', (v) => v.toFixed(1) + '%', 'cpu')
    if (chartMemRef.current)
      renderChartToEl(chartMemRef.current, [...h.memory], Math.max(...h.memory, 64), 'purple', (v) => fmtMem(Math.round(v)), 'mem')
    if (chartNetRef.current)
      renderChartToEl(chartNetRef.current, [...h.network], Math.max(...h.network, 1024), 'green', fmtBytes, 'net')
  }, [])

  const load = useCallback(async () => {
    const [healthRes, sysRes, cmdRes] = await Promise.allSettled([
      fetch('/api/health').then((r) => {
        if (!r.ok) throw 0
        return r.json()
      }),
      fetch('/api/status').then((r) => {
        if (!r.ok) throw 0
        return r.json()
      }),
      fetch('/api/top-commands').then((r) => {
        if (!r.ok) throw 0
        return r.json()
      }),
    ])

    if (cmdRes.status === 'fulfilled') {
      setTopCmds(cmdRes.value)
    }

    if (healthRes.status === 'fulfilled') {
      const d = healthRes.value
      const rawClusters: { id: number; shards?: Shard[]; last_heartbeat?: number }[] = d.clusters || []

      if (!rawClusters.length) {
        histRef.current.latency.push(0)
        histRef.current.cpu.push(0)
        histRef.current.memory.push(0)
        histRef.current.network.push(0)
        renderCharts()
        setGuilds('0')
        setUsers('0')
        setShards('0')
        setLatVal('0ms')
        setCpuVal('0%')
        setMemVal('0 MB')
        setNetVal('0 B/s')
        return
      }

      let totalGuilds = 0,
        totalShards = 0
      const allLats: number[] = []
      const nowSec = Date.now() / 1000
      const newClusters: Record<string, ClusterData> = {}

      for (const c of rawClusters) {
        const shardList = c.shards || []
        const cGuilds = shardList.reduce((a, s) => a + (s.guilds || 0), 0)
        const cUsers = shardList.reduce((a, s) => a + (s.users || 0), 0)
        totalGuilds += cGuilds
        totalShards += shardList.length
        shardList.forEach((s) => {
          if (s.latency > 0) allLats.push(s.latency)
        })
        newClusters[String(c.id)] = {
          alive: nowSec - (c.last_heartbeat || 0) < 30,
          guilds: cGuilds,
          users: cUsers,
          shards: shardList,
          uptime: shardList[0]?.uptime || 0,
        }
      }

      animateNum(setGuilds, totalGuilds)
      animateNum(setUsers, d.users || 0)
      setShards(String(totalShards))
      setClusters(newClusters)

      const avgLat = allLats.length ? Math.round((allLats.reduce((a, b) => a + b, 0) / allLats.length) * 1000) : 0
      histRef.current.latency.push(avgLat)
      setLatVal(avgLat + 'ms')
    }

    if (sysRes.status === 'fulfilled') {
      const s = sysRes.value
      const cpu = s.cpu?.percent ?? 0
      const memMb = Math.round((s.memory?.used ?? 0) / 1048576)
      const rx = s.network?.bytes_recv ?? 0
      const tx = s.network?.bytes_sent ?? 0

      histRef.current.cpu.push(cpu)
      histRef.current.memory.push(memMb)

      let netRate = 0
      if (lastRxRef.current !== null && lastTxRef.current !== null) {
        netRate = (Math.max(0, rx - lastRxRef.current) + Math.max(0, tx - lastTxRef.current)) / (POLL / 1000)
      }
      lastRxRef.current = rx
      lastTxRef.current = tx
      histRef.current.network.push(netRate)

      setCpuVal(cpu.toFixed(1) + '%')
      setMemVal(fmtMem(memMb))
      setNetVal(fmtBytes(histRef.current.network[histRef.current.network.length - 1] || 0))
    }

    renderCharts()
  }, [renderCharts])

  useEffect(() => {
    renderCharts()
    load()
    const interval = setInterval(load, POLL)
    return () => clearInterval(interval)
  }, [load, renderCharts])

  const toggleCluster = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="st-wrap" style={{ background: '#1a1a1a', minHeight: '100vh' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }} data-reveal>
          <h2 className="section-title">Status</h2>
          <p className="section-desc" style={{ margin: 0 }}>
            Real-time performance metrics and cluster health for Evict.
          </p>
        </div>

        <div className="st-charts" data-reveal>
          {(
            [
              { ref: chartLatRef, name: 'Latency', val: latVal, id: 'lat' },
              { ref: chartCpuRef, name: 'CPU', val: cpuVal, id: 'cpu' },
              { ref: chartMemRef, name: 'Memory', val: memVal, id: 'mem' },
              { ref: chartNetRef, name: 'Network', val: netVal, id: 'net' },
            ] as const
          ).map((ch) => (
            <div key={ch.id} className="st-chart">
              <div className="st-chart-row">
                <span className="st-chart-name">{ch.name}</span>
                <span className="st-chart-cur mono">{ch.val}</span>
              </div>
              <div className="chart-area" ref={ch.ref as React.RefObject<HTMLDivElement>} />
            </div>
          ))}
        </div>

        <div className="st-panels" data-reveal>
          <div className="st-panel">
            <div className="st-panel-title">Clusters</div>
            <div className="shard-grid">
              {Object.keys(clusters).length === 0 ? (
                <div className="cluster-empty">No clusters</div>
              ) : (
                Object.entries(clusters).map(([cId, c], idx) => {
                  const isExpanded = expanded.has(cId)
                  const avgLat = c.shards.length
                    ? ((c.shards.reduce((a, s) => a + (s.latency || 0), 0) / c.shards.length) * 1000).toFixed(0)
                    : '—'
                  return (
                    <div key={cId} className="cluster-item">
                      <div className="cluster-item-header" onClick={() => toggleCluster(cId)} style={{ cursor: 'pointer' }}>
                        <div className="cluster-item-left">
                          <span className={`cluster-toggle${isExpanded ? ' expanded' : ''}`}>▶</span>
                          <span className="cluster-item-id">Cluster {idx}</span>
                          <span className={`cluster-status ${c.alive ? 'online' : 'offline'}`}>{c.alive ? '●' : '○'}</span>
                        </div>
                        <div className="cluster-item-stats">
                          <div className="cluster-item-stat">
                            <span className="cluster-item-stat-value">{c.guilds.toLocaleString()}</span>
                            <span className="cluster-item-stat-label">guilds</span>
                          </div>
                          <div className="cluster-item-stat">
                            <span className="cluster-item-stat-value">{c.users.toLocaleString()}</span>
                            <span className="cluster-item-stat-label">users</span>
                          </div>
                          <div className="cluster-item-stat">
                            <span className="cluster-item-stat-value">{c.shards.length}</span>
                            <span className="cluster-item-stat-label">shards</span>
                          </div>
                          <div className="cluster-item-stat">
                            <span className="cluster-item-stat-value">{avgLat}</span>
                            <span className="cluster-item-stat-label">ms</span>
                          </div>
                        </div>
                        <span className="cluster-item-uptime">{fmtUptime(c.uptime)}</span>
                      </div>
                      <div className={`cluster-item-content${isExpanded ? '' : ' hidden'}`}>
                        {c.shards.map((s) => (
                          <div key={s.id} className="shard-item">
                            <div className="shard-item-left">
                              <span className="shard-item-id">Shard {s.id}</span>
                            </div>
                            <div className="shard-item-stats">
                              <div className="shard-item-stat">
                                <span className="shard-item-stat-value">{(s.guilds || 0).toLocaleString()}</span>
                                <span className="shard-item-stat-label">guilds</span>
                              </div>
                              <div className="shard-item-stat">
                                <span className="shard-item-stat-value">{(s.users || 0).toLocaleString()}</span>
                                <span className="shard-item-stat-label">users</span>
                              </div>
                              <div className="shard-item-stat">
                                <span className="shard-item-stat-value">
                                  {s.latency && s.latency > 0 ? (s.latency * 1000).toFixed(0) : '—'}
                                </span>
                                <span className="shard-item-stat-label">ms</span>
                              </div>
                            </div>
                            <span className="shard-item-uptime">{fmtUptime(s.uptime)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="st-panel">
            <div className="st-panel-title">Top Commands</div>
            <div className="top-commands-grid">
              {topCmds.length === 0 ? (
                <div className="top-cmd-empty">No data yet</div>
              ) : (
                topCmds.map((cmd, i) => (
                  <div key={cmd.command_name} className="top-cmd-item">
                    <span className={`top-cmd-item-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>#{i + 1}</span>
                    <span className="top-cmd-item-name">{cmd.command_name}</span>
                    <span className="top-cmd-item-uses">{cmd.count.toLocaleString()} uses</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
