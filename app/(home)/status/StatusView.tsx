'use client'

import { useEffect, useRef, useState } from 'react'

const POINTS = 60

interface Shard {
  id: number
  guilds: number
  users: number
  latency: number
  uptime: number
  reconnect_count?: number
  restart_count?: number
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
  accent: { stroke: 'rgba(255,255,255,0.7)', fill: 'rgba(255,255,255,0.06)' },
  green: { stroke: 'rgba(255,255,255,0.7)', fill: 'rgba(255,255,255,0.06)' },
  orange: { stroke: 'rgba(255,255,255,0.7)', fill: 'rgba(255,255,255,0.06)' },
  purple: { stroke: 'rgba(255,255,255,0.7)', fill: 'rgba(255,255,255,0.06)' },
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

function fmtShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

import { animateCounter } from '@/lib/animateCounter'

interface SelectedShard extends Shard {
  clusterId: string
  clusterIdx: number
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
  const [totalCmds, setTotalCmds] = useState(0)
  const [allTimeCmds, setAllTimeCmds] = useState(0)
  const [allTimeCmdList, setAllTimeCmdList] = useState<TopCmd[]>([])
  const [selectedShard, setSelectedShard] = useState<SelectedShard | null>(null)
  const [guildSearch, setGuildSearch] = useState('')
  const [shardResult, setShardResult] = useState<{ shardId: number; clusterId: string; clusterIdx: number; shard: Shard } | null | 'invalid' | 'notfound'>(null)
  const [guildInfo, setGuildInfo] = useState<{ name: string; icon_url: string | null; member_count: number } | null>(null)
  const guildFetchRef = useRef<AbortController | null>(null)

  function lookupGuild(raw: string) {
    const id = raw.trim()
    if (!id) { setShardResult(null); setGuildInfo(null); return }
    let guildBig: bigint
    try { guildBig = BigInt(id) } catch { setShardResult('invalid'); setGuildInfo(null); return }
    const allShards = Object.values(clusters).flatMap((c) => c.shards)
    const totalShards = allShards.length
    if (!totalShards) { setShardResult('notfound'); setGuildInfo(null); return }
    const shardId = Number((guildBig >> BigInt(22)) % BigInt(totalShards))
    for (const [clusterId, c] of Object.entries(clusters)) {
      const shard = c.shards.find((s) => s.id === shardId)
      if (shard) {
        const clusterIdx = Object.keys(clusters).indexOf(clusterId)
        setShardResult({ shardId, clusterId, clusterIdx, shard })
        setExpanded((prev) => new Set([...prev, clusterId]))
        guildFetchRef.current?.abort()
        const ac = new AbortController()
        guildFetchRef.current = ac
        setGuildInfo(null)
        fetch(`/api/guild/find?idx=${encodeURIComponent(id)}`, { signal: ac.signal })
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setGuildInfo({ name: d.name, icon_url: d.icon_url ?? null, member_count: d.member_count ?? 0 }) })
          .catch(() => {})
        return
      }
    }
    setShardResult('notfound')
    setGuildInfo(null)
  }

  const matchedShardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (shardResult && shardResult !== 'invalid' && shardResult !== 'notfound') {
      setTimeout(() => matchedShardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
    }
  }, [shardResult])

  const histRef = useRef<History>({ latency: [], cpu: [], memory: [], network: [] })
  const lastRxRef = useRef<number | null>(null)
  const lastTxRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const curGuildsRef = useRef(0)
  const curUsersRef = useRef(0)

  const chartLatRef = useRef<HTMLDivElement>(null)
  const chartCpuRef = useRef<HTMLDivElement>(null)
  const chartMemRef = useRef<HTMLDivElement>(null)
  const chartNetRef = useRef<HTMLDivElement>(null)

  function renderCharts() {
    const h = histRef.current
    if (chartLatRef.current)
      renderChartToEl(chartLatRef.current, [...h.latency], Math.max(...h.latency, 50), 'accent', (v) => v.toFixed(0) + 'ms', 'lat')
    if (chartCpuRef.current) renderChartToEl(chartCpuRef.current, [...h.cpu], 100, 'orange', (v) => v.toFixed(1) + '%', 'cpu')
    if (chartMemRef.current)
      renderChartToEl(chartMemRef.current, [...h.memory], Math.max(...h.memory, 64), 'purple', (v) => fmtMem(Math.round(v)), 'mem')
    if (chartNetRef.current)
      renderChartToEl(chartNetRef.current, [...h.network], Math.max(...h.network, 1024), 'green', fmtBytes, 'net')
  }

  const processDataRef = useRef<(data: { health: unknown; sys: unknown; cmds: unknown; ts: number }) => void>(null!)
  processDataRef.current = ({ health, sys, cmds, ts }) => {
    if (cmds) {
      const c = cmds as { commands: TopCmd[]; total: number; allTime: number; allTimeCommands: TopCmd[] }
      setTopCmds(c.commands)
      setTotalCmds(c.total)
      setAllTimeCmds(c.allTime)
      setAllTimeCmdList(c.allTimeCommands ?? [])
    }

    if (health) {
      const d = health as { clusters?: Record<string, { alive?: boolean; uptime?: number; users?: number; guilds?: number; shards?: Shard[] }>; guilds?: number; users?: number }
      const rawClusters = d.clusters || {}
      const clusterEntries = Object.entries(rawClusters)

      if (!clusterEntries.length) {
        histRef.current.latency.push(0)
        renderCharts()
        setGuilds('0'); setUsers('0'); setShards('0'); setLatVal('0ms')
        return
      }

      let totalGuilds = 0, totalShards = 0
      const allLats: number[] = []
      const newClusters: Record<string, ClusterData> = {}

      for (const [cId, c] of clusterEntries) {
        const shardList = c.shards || []
        const cGuilds = c.guilds || shardList.reduce((a, s) => a + (s.guilds || 0), 0)
        const cUsers = c.users || shardList.reduce((a, s) => a + (s.users || 0), 0)
        totalGuilds += cGuilds
        totalShards += shardList.length
        shardList.forEach((s) => { if (s.latency > 0) allLats.push(s.latency) })
        newClusters[cId] = { alive: c.alive ?? false, guilds: cGuilds, users: cUsers, shards: shardList, uptime: c.uptime || shardList[0]?.uptime || 0 }
      }

      const newGuilds = d.guilds || totalGuilds
      const newUsers = d.users || 0
      animateCounter(setGuilds, newGuilds, 600, curGuildsRef.current)
      animateCounter(setUsers, newUsers, 600, curUsersRef.current)
      curGuildsRef.current = newGuilds
      curUsersRef.current = newUsers
      setShards(String(totalShards))
      setClusters(newClusters)

      const avgLat = allLats.length ? Math.round((allLats.reduce((a, b) => a + b, 0) / allLats.length) * 1000) : 0
      histRef.current.latency.push(avgLat)
      setLatVal(avgLat + 'ms')
    }

    if (sys) {
      const s = sys as { cpu?: { percent: number }; memory?: { used: number }; network?: { bytes_recv: number; bytes_sent: number } }
      const cpu = s.cpu?.percent ?? 0
      const memMb = Math.round((s.memory?.used ?? 0) / 1048576)
      const rx = s.network?.bytes_recv ?? 0
      const txBytes = s.network?.bytes_sent ?? 0

      histRef.current.cpu.push(cpu)
      histRef.current.memory.push(memMb)

      let netRate = 0
      if (lastRxRef.current !== null && lastTxRef.current !== null && lastTsRef.current !== null) {
        const dt = Math.max(1, (ts - lastTsRef.current) / 1000)
        netRate = (Math.max(0, rx - lastRxRef.current) + Math.max(0, txBytes - lastTxRef.current)) / dt
      }
      lastRxRef.current = rx
      lastTxRef.current = txBytes
      lastTsRef.current = ts
      histRef.current.network.push(netRate)

      setCpuVal(cpu.toFixed(1) + '%')
      setMemVal(fmtMem(memMb))
      setNetVal(fmtBytes(netRate))
    }

    renderCharts()
  }

  useEffect(() => {
    fetch('/api/status/history')
      .then((r) => (r.ok ? r.json() : null))
      .then((h) => {
        if (!h) return
        histRef.current.latency = h.latency ?? []
        histRef.current.cpu = h.cpu ?? []
        histRef.current.memory = h.memory ?? []
        histRef.current.network = h.network ?? []
        renderCharts()
      })
      .catch(() => {})

    const worker = new Worker('/status-worker.js')
    worker.onmessage = (e) => processDataRef.current(e.data)
    return () => worker.terminate()
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = selectedShard ? 'hidden' : ''
    document.body.style.overflow = selectedShard ? 'hidden' : ''
  }, [selectedShard])

  const toggleCluster = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="st-wrap">
      {selectedShard && (
        <div className="shard-popout-overlay" onClick={() => setSelectedShard(null)}>
          <div className="shard-popout" onClick={(e) => e.stopPropagation()}>
            <div className="shard-popout-header">
              <div className="shard-popout-title-row">
                <span className={`cluster-status-dot ${selectedShard.latency > 0 ? 'online' : 'offline'}`} />
                <div>
                  <div className="shard-popout-title">Shard #{selectedShard.id}</div>
                  <div className="shard-popout-sub">Cluster {selectedShard.clusterIdx}</div>
                </div>
              </div>
              <button className="shard-popout-close" onClick={() => setSelectedShard(null)} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="shard-popout-grid">
              <div className="shard-popout-stat">
                <span className="shard-popout-stat-label">Guilds</span>
                <span className="shard-popout-stat-value">{(selectedShard.guilds || 0).toLocaleString()}</span>
              </div>
              <div className="shard-popout-stat">
                <span className="shard-popout-stat-label">Users</span>
                <span className="shard-popout-stat-value">{(selectedShard.users || 0).toLocaleString()}</span>
              </div>
              <div className="shard-popout-stat">
                <span className="shard-popout-stat-label">Latency</span>
                <span className="shard-popout-stat-value mono">{selectedShard.latency && selectedShard.latency > 0 ? (selectedShard.latency * 1000).toFixed(0) + 'ms' : '—'}</span>
              </div>
              <div className="shard-popout-stat">
                <span className="shard-popout-stat-label">Uptime</span>
                <span className="shard-popout-stat-value mono">{fmtUptime(selectedShard.uptime)}</span>
              </div>
              <div className="shard-popout-stat">
                <span className="shard-popout-stat-label">Reconnects</span>
                <span className="shard-popout-stat-value mono">{(selectedShard.reconnect_count ?? 0).toLocaleString()}</span>
              </div>
              <div className="shard-popout-stat">
                <span className="shard-popout-stat-label">Restarts</span>
                <span className="shard-popout-stat-value mono">{(selectedShard.restart_count ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container">

        <div className="st-header" data-reveal>
          <div className="st-header-top">
            <div className="st-header-left">
              <h1 className="st-title">Status</h1>
            </div>
            <p className="st-subtitle">Real-time performance metrics and cluster health.</p>
          </div>

          <div className="st-header-stats">
            <div className="st-hstat-col">
              <div className="st-hstat">
                <span className="st-hstat-num">{shards}</span>
                <span className="st-hstat-key">Shards</span>
              </div>
              <div className="st-hstat st-hstat-sub">
                <span className="st-hstat-num mono">{latVal}</span>
                <span className="st-hstat-key">Latency</span>
              </div>
            </div>
            <div className="st-hstat-col">
              <div className="st-hstat">
                <span className="st-hstat-num">{guilds}</span>
                <span className="st-hstat-key">Servers</span>
              </div>
              <div className="st-hstat st-hstat-sub">
                <span className="st-hstat-num">{users}</span>
                <span className="st-hstat-key">Members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="st-charts" data-reveal>
          {(
            [
              { ref: chartLatRef, name: 'Latency', val: latVal, id: 'lat' },
              { ref: chartCpuRef, name: 'CPU',     val: cpuVal, id: 'cpu' },
              { ref: chartMemRef, name: 'Memory',  val: memVal, id: 'mem' },
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

        {/* Panels */}
        <div className="st-panels" data-reveal>

          <div className="st-panel">
            <div className="st-panel-title" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Clusters</span>
              </div>
              <div className="st-shard-input-row">
                <input
                  className="st-shard-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="Find shard by Guild ID…"
                  value={guildSearch}
                  onChange={(e) => { setGuildSearch(e.target.value); lookupGuild(e.target.value) }}
                  spellCheck={false}
                />
                {guildSearch && (
                  <button className="st-shard-clear" onClick={() => { setGuildSearch(''); setShardResult(null) }} aria-label="Clear">✕</button>
                )}
              </div>
              {shardResult === 'invalid' && (
                <div className="st-shard-result st-shard-error">Invalid Guild ID — must be a numeric snowflake.</div>
              )}
              {shardResult === 'notfound' && (
                <div className="st-shard-result st-shard-error">No shard found — cluster data may still be loading.</div>
              )}
              {shardResult && shardResult !== 'invalid' && shardResult !== 'notfound' && (
                <div className="st-shard-guild-result">
                  {guildInfo && (
                    <div className="st-shard-guild-info">
                      {guildInfo.icon_url
                        ? <img src={guildInfo.icon_url} className="st-shard-guild-icon" alt="" />
                        : <div className="st-shard-guild-icon st-shard-guild-icon--placeholder" />}
                      <span className="st-shard-guild-name">{guildInfo.name}</span>
                      <span className="st-shard-guild-members mono">{guildInfo.member_count.toLocaleString()} members</span>
                    </div>
                  )}
                  <div className="st-shard-result">
                    <span>Shard <strong className="mono">#{shardResult.shardId}</strong></span>
                    <span className="st-shard-sep">·</span>
                    <span>Cluster <strong className="mono">{shardResult.clusterIdx}</strong></span>
                    <span className="st-shard-sep">·</span>
                    <span className={`st-shard-status ${shardResult.shard.latency > 0 ? 'ok' : 'dead'}`}>
                      {shardResult.shard.latency > 0 ? `${(shardResult.shard.latency * 1000).toFixed(0)}ms` : 'Offline'}
                    </span>
                    <span className="st-shard-sep">·</span>
                    <span className="mono">{shardResult.shard.guilds.toLocaleString()} guilds</span>
                  </div>
                </div>
              )}
            </div>
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
                      <div className="cluster-item-header" onClick={() => toggleCluster(cId)}>
                        <span className={`cluster-toggle${isExpanded ? ' expanded' : ''}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                        <div className="cluster-item-main">
                          <div className="cluster-item-lhs">
                            <div className="cluster-item-name-row">
                              <span className={`cluster-status-dot ${c.alive ? 'online' : 'offline'}`} />
                              <span className="cluster-item-id">Cluster {idx}</span>
                            </div>
                            <div className="cluster-item-stat cluster-item-lat">
                              <span className="cluster-item-stat-value mono">{avgLat}</span>
                              <span className="cluster-item-stat-label">ms</span>
                            </div>
                          </div>
                          <div className="cluster-item-rhs">
                            <div className="cluster-item-stat">
                              <span className="cluster-item-stat-value">{fmtShort(c.guilds)}</span>
                              <span className="cluster-item-stat-label">guilds</span>
                            </div>
                            <div className="cluster-item-stat">
                              <span className="cluster-item-stat-value">{fmtShort(c.users)}</span>
                              <span className="cluster-item-stat-label">users</span>
                            </div>
                          </div>
                        </div>
                        <div className="cluster-item-extras">
                          <div className="cluster-item-stat">
                            <span className="cluster-item-stat-value">{c.shards.length}</span>
                            <span className="cluster-item-stat-label">shards</span>
                          </div>
                          <span className="cluster-item-uptime mono">{fmtUptime(c.uptime)}</span>
                        </div>
                      </div>
                      <div className={`cluster-item-content${isExpanded ? '' : ' hidden'}`}>
                        {c.shards.map((s) => {
                          const isMatch = shardResult && shardResult !== 'invalid' && shardResult !== 'notfound' && shardResult.shardId === s.id && shardResult.clusterId === cId
                          return (
                          <div
                            key={s.id}
                            ref={isMatch ? matchedShardRef : undefined}
                            className={`shard-item${isMatch ? ' shard-item--match' : ''}`}
                            onClick={() => setSelectedShard({ ...s, clusterId: cId, clusterIdx: idx })}
                          >
                            <div className="shard-item-main">
                              <div className="shard-item-lhs">
                                <span className="shard-item-id">#{s.id}</span>
                                <div className="shard-item-stat shard-item-lat">
                                  <span className="shard-item-stat-value mono">{s.latency && s.latency > 0 ? (s.latency * 1000).toFixed(0) : '—'}</span>
                                  <span className="shard-item-stat-label">ms</span>
                                </div>
                              </div>
                              <div className="shard-item-rhs">
                                <div className="shard-item-stat">
                                  <span className="shard-item-stat-value">{fmtShort(s.guilds || 0)}</span>
                                  <span className="shard-item-stat-label">guilds</span>
                                </div>
                                <div className="shard-item-stat">
                                  <span className="shard-item-stat-value">{fmtShort(s.users || 0)}</span>
                                  <span className="shard-item-stat-label">users</span>
                                </div>
                              </div>
                            </div>
                            <span className="shard-item-uptime mono">{fmtUptime(s.uptime)}</span>
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="st-panel">
              <div className="st-panel-title">
                <span>Top Commands</span>
                <span className="st-panel-meta mono">{totalCmds.toLocaleString()} today</span>
              </div>
              <div className="top-commands-grid">
                {topCmds.length === 0 ? (
                  <div className="top-cmd-empty">No data yet</div>
                ) : (
                  topCmds.map((cmd, i) => {
                    const pct = topCmds[0]?.count ? (cmd.count / topCmds[0].count) * 100 : 0
                    return (
                      <div key={cmd.command_name} className="top-cmd-item">
                        <div className="top-cmd-bar" style={{ width: pct + '%' }} />
                        <span className={`top-cmd-item-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>#{i + 1}</span>
                        <span className="top-cmd-item-name">{cmd.command_name}</span>
                        <span className="top-cmd-item-uses">{cmd.count.toLocaleString()}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="st-panel">
              <div className="st-panel-title">
                <span>All Time</span>
                <span className="st-panel-meta mono">{allTimeCmds.toLocaleString()} total</span>
              </div>
              <div className="top-commands-grid">
                {allTimeCmdList.length === 0 ? (
                  <div className="top-cmd-empty">No data yet</div>
                ) : (
                  allTimeCmdList.map((cmd, i) => {
                    const pct = allTimeCmdList[0]?.count ? (cmd.count / allTimeCmdList[0].count) * 100 : 0
                    return (
                      <div key={cmd.command_name} className="top-cmd-item">
                        <div className="top-cmd-bar" style={{ width: pct + '%' }} />
                        <span className={`top-cmd-item-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>#{i + 1}</span>
                        <span className="top-cmd-item-name">{cmd.command_name}</span>
                        <span className="top-cmd-item-uses">{cmd.count.toLocaleString()}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
