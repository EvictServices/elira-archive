'use client'

import { useEffect, useState } from 'react'
import { animateCounter } from '@/lib/animateCounter'

export default function HeroStats() {
  const [online, setOnline] = useState<boolean | null>(null)
  const [servers, setServers] = useState('—')
  const [users, setUsers] = useState('—')
  const [commands, setCommands] = useState('—')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [res, cmdRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/commands'),
        ])

        if (cancelled) return
        if (!res.ok) throw new Error()
        const d = await res.json()

        const isOnline = d.users != null
        setOnline(isOnline)

        if (isOnline) {
          const guilds = d.guilds || Object.values(d.clusters || {}).reduce(
            (sum: number, c: unknown) => {
              const cluster = c as { guilds?: number; shards?: { guilds?: number }[] }
              return sum + (cluster.guilds || (cluster.shards || []).reduce((s2: number, sh) => s2 + (sh.guilds || 0), 0))
            },
            0
          )
          animateCounter(setServers, guilds)
          animateCounter(setUsers, d.users)

          try {
            if (cmdRes.ok) {
              const cmdData = await cmdRes.json()
              const payload: unknown = cmdData?.data?.commands ?? cmdData?.commands ?? cmdData ?? []
              const seen = new Set<string>()
              let count = 0

              if (Array.isArray(payload)) {
                payload.forEach((group: unknown) => {
                  if (!group || typeof group !== 'object') return
                  const cat = String((group as { category?: unknown }).category ?? '').toLowerCase()
                  const cmds = (group as { commands?: unknown }).commands
                  if (!Array.isArray(cmds) || cat === 'jishaku') return
                  ;(cmds as { qualified_name?: string; name?: string; hidden?: boolean }[]).forEach((cmd) => {
                    const name = cmd.qualified_name || cmd.name
                    if (name && name !== 'help' && !seen.has(name) && !cmd.hidden) {
                      seen.add(name)
                      count++
                    }
                  })
                })
              } else if (typeof payload === 'object' && payload) {
                Object.entries(payload as Record<string, unknown[]>).forEach(([cat, cmds]) => {
                  if (!Array.isArray(cmds) || cat.toLowerCase() === 'jishaku') return
                  ;(cmds as { qualified_name?: string; name?: string; hidden?: boolean }[]).forEach((cmd) => {
                    const name = cmd.qualified_name || cmd.name
                    if (name && name !== 'help' && !seen.has(name) && !cmd.hidden) {
                      seen.add(name)
                      count++
                    }
                  })
                })
              }

              animateCounter(setCommands, count)
            }
          } catch {}
        } else {
          setServers('0'); setUsers('0'); setCommands('0')
        }
      } catch {
        if (cancelled) return
        setOnline(false)
        setServers('0'); setUsers('0'); setCommands('0')
      }
    }
    load()

    return () => { cancelled = true }
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
