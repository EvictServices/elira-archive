'use client'

import { useEffect, useRef, useState } from 'react'
import { animateCounter } from '@/lib/marketing/animate-counter'
import { api } from '@/lib/routes'
import GuildCarousel from '@/components/home/guild-carousel'

export default function HeroStats() {
  const [servers, setServers] = useState('—')
  const [users, setUsers] = useState('—')
  const [commands, setCommands] = useState('—')
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    async function load() {
      try {
        const [res, cmdRes] = await Promise.all([
          fetch(api.cluster.health),
          fetch(api.cluster.commands),
        ])

        if (!res.ok) throw new Error()
        const d = await res.json()

        const isOnline = d.users != null

        if (isOnline) {
          const guilds =
            d.guilds ||
            Object.values(d.clusters || {}).reduce((sum: number, c: unknown) => {
              const cluster = c as { guilds?: number; shards?: { guilds?: number }[] }
              return (
                sum +
                (cluster.guilds ||
                  (cluster.shards || []).reduce((s2: number, sh) => s2 + (sh.guilds || 0), 0))
              )
            }, 0)
          animateCounter(setServers, guilds)
          animateCounter(setUsers, d.users)

          try {
            if (cmdRes.ok) {
              const cmdData = await cmdRes.json()
              if (Array.isArray(cmdData?.commands)) {
                animateCounter(setCommands, cmdData.commands.length)
              } else {
                const cmdMap: Record<string, unknown[]> = cmdData?.data?.commands ?? {}
                const seen = new Set<string>()
                let count = 0
                Object.entries(cmdMap).forEach(([cat, cmds]) => {
                  if (!Array.isArray(cmds) || cat.toLowerCase() === 'jishaku') return
                  ;(
                    cmds as { qualified_name?: string; name?: string; hidden?: boolean }[]
                  ).forEach((cmd) => {
                    const name = cmd.qualified_name || cmd.name
                    if (name && !seen.has(name) && !cmd.hidden) {
                      seen.add(name)
                      count++
                    }
                  })
                })
                animateCounter(setCommands, count)
              }
            }
          } catch {
            /* command count optional */
          }
        } else {
          setServers('0')
          setUsers('0')
          setCommands('0')
        }
      } catch {
        setServers('0')
        setUsers('0')
        setCommands('0')
      }
    }
    load()
  }, [])

  return (
    <div className="hero-foot">
      <ul className="hero-metrics" aria-label="Live stats">
        <li className="hero-metric">
          <span className="hero-metric-value">{servers}</span>
          <span className="hero-metric-label">servers</span>
        </li>
        <li className="hero-metric">
          <span className="hero-metric-value">{users}</span>
          <span className="hero-metric-label">users</span>
        </li>
        <li className="hero-metric">
          <span className="hero-metric-value">{commands}</span>
          <span className="hero-metric-label">commands</span>
        </li>
      </ul>

      <GuildCarousel />
    </div>
  )
}
