'use client'

import { useCallback, useEffect, useState } from 'react'
import AnimatedCounter from '@/components/shared/animated-counter'
import { api } from '@/lib/routes'

const POLL_MS = 5000

function sumGuilds(d: {
  guilds?: number
  clusters?: Record<string, { guilds?: number; shards?: { guilds?: number }[] }>
}): number {
  if (d.guilds != null) return d.guilds
  return Object.values(d.clusters || {}).reduce((sum, c) => {
    return (
      sum +
      (c.guilds || (c.shards || []).reduce((s2, sh) => s2 + (sh.guilds || 0), 0))
    )
  }, 0)
}

export default function HeroProof() {
  const [users, setUsers] = useState<number | null>(null)
  const [servers, setServers] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(api.cluster.health)
      if (!res.ok) throw new Error()
      const d = await res.json()

      if (d.users != null) {
        setUsers(d.users)
        setServers(sumGuilds(d))
      } else {
        setUsers(0)
        setServers(0)
      }
    } catch {
      setUsers(0)
      setServers(0)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = window.setInterval(load, POLL_MS)
    return () => window.clearInterval(interval)
  }, [load])

  return (
    <p className="hero-proof" aria-live="polite">
      Powering <AnimatedCounter value={users} className="hero-proof-strong" /> users across{' '}
      <AnimatedCounter value={servers} className="hero-proof-strong" /> servers
    </p>
  )
}
