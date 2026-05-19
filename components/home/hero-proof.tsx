'use client'

import { useEffect, useRef, useState } from 'react'
import { animateCounter } from '@/lib/marketing/animate-counter'
import { api } from '@/lib/routes'

export default function HeroProof() {
  const [servers, setServers] = useState('—')
  const [users, setUsers] = useState('—')
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    async function load() {
      try {
        const res = await fetch(api.cluster.health)
        if (!res.ok) throw new Error()
        const d = await res.json()

        if (d.users != null) {
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
        } else {
          setServers('0')
          setUsers('0')
        }
      } catch {
        setServers('0')
        setUsers('0')
      }
    }
    load()
  }, [])

  return (
    <p className="hero-proof" aria-live="polite">
      Powering <strong className="hero-proof-strong">{users}</strong> users across{' '}
      <strong className="hero-proof-strong">{servers}</strong> servers
    </p>
  )
}
