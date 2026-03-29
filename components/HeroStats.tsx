'use client'

import { useEffect, useRef, useState } from 'react'

function animateCounter(setter: (v: string) => void, target: number, duration = 1400) {
  const startTime = performance.now()
  function tick(now: number) {
    const p = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - p, 3)
    setter(Math.round(target * ease).toLocaleString())
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export default function HeroStats() {
  const [online, setOnline] = useState<boolean | null>(null)
  const [servers, setServers] = useState('—')
  const [users, setUsers] = useState('—')
  const [commands, setCommands] = useState('—')
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    async function load() {
      try {
        const res = await fetch('/api/health')
        if (!res.ok) throw new Error()
        const d = await res.json()

        const isOnline = d.users != null
        setOnline(isOnline)

        if (isOnline) {
          const guilds = (d.clusters || []).reduce(
            (sum: number, c: { shards?: { guilds?: number }[] }) =>
              sum + (c.shards || []).reduce((s2: number, sh) => s2 + (sh.guilds || 0), 0),
            0
          )
          animateCounter(setServers, guilds)
          animateCounter(setUsers, d.users)

          try {
            const cmdRes = await fetch('/api/commands')
            if (cmdRes.ok) {
              const cmdData = await cmdRes.json()
              const cmdMap: Record<string, unknown[]> = cmdData?.data?.commands ?? {}
              const seen = new Set<string>()
              let count = 0
              Object.entries(cmdMap).forEach(([cat, cmds]) => {
                if (!Array.isArray(cmds) || cat.toLowerCase() === 'jishaku') return
                ;(cmds as { qualified_name?: string; name?: string; hidden?: boolean }[]).forEach((cmd) => {
                  const name = cmd.qualified_name || cmd.name
                  if (name && !seen.has(name) && !cmd.hidden) { seen.add(name); count++ }
                })
              })
              animateCounter(setCommands, count)
            }
          } catch { /* ignore */ }
        } else {
          setServers('0'); setUsers('0'); setCommands('0')
        }
      } catch {
        setOnline(false)
        setServers('0'); setUsers('0'); setCommands('0')
      }
    }
    load()
  }, [])

  return (
    <>
      <div className="hero-badge">
        <span
          className="dot"
          style={
            online === false
              ? { background: 'var(--danger)', animation: 'none' }
              : online === true
              ? { background: 'var(--online)' }
              : {}
          }
        />
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-value">{servers}</div>
          <div className="hero-stat-label">Servers</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">{users}</div>
          <div className="hero-stat-label">Users</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-value">{commands}</div>
          <div className="hero-stat-label">Commands</div>
        </div>
      </div>
    </>
  )
}
