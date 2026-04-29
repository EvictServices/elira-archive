'use client'

import { useEffect, useMemo, useState } from 'react'

type Guild = {
  id: string
  name: string
  icon?: string | null
  members: number
}

const SLIDES_TO_SHOW = 5
const ROTATE_EVERY_MS = 3500

export default function BiggestGuildsCarousel() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const res = await fetch('/api/guilds')
        if (!res.ok) return
        const data = await res.json()
        if (!alive) return

        const items = Array.isArray(data?.guilds) ? data.guilds : []
        setGuilds(items)
      } catch {
        // Keep silent and show fallback UI.
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (guilds.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % guilds.length)
    }, ROTATE_EVERY_MS)

    return () => window.clearInterval(timer)
  }, [guilds.length])

  const visible = useMemo(() => {
    if (guilds.length === 0) return []
    const count = Math.min(SLIDES_TO_SHOW, guilds.length)
    return Array.from({ length: count }, (_, i) => {
      const idx = (activeIndex + i) % guilds.length
      return { guild: guilds[idx], rank: idx + 1, offset: i }
    })
  }, [activeIndex, guilds])

  if (guilds.length === 0) {
    return (
      <div className="guild-carousel" aria-live="polite">
        <div className="guild-carousel-head">
          <h3>Largest Guilds</h3>
          <span>Live ranking updates every 5 minutes</span>
        </div>
        <div className="guild-carousel-empty">Largest guilds are unavailable right now.</div>
      </div>
    )
  }

  return (
    <div className="guild-carousel" aria-live="polite">
      <div className="guild-carousel-head">
        <h3>Largest Guilds</h3>
        <span>Cached for 5 minutes</span>
      </div>

      <div className="guild-carousel-track-wrap">
        <div className="guild-carousel-track spin-in">
          {visible.map(({ guild, rank, offset }) => (
            <article
              key={`${guild.id}-${offset}`}
              className={`guild-slide ${offset === 0 ? 'is-active' : ''}`}
            >
              <div className="guild-rank">#{rank}</div>
              <div className="guild-avatar-wrap">
                {guild.icon ? (
                  <img src={guild.icon} alt="" className="guild-avatar" loading="lazy" />
                ) : (
                  <div className="guild-avatar guild-avatar-fallback" aria-hidden="true">
                    {guild.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="guild-orbit" aria-hidden="true" />
              </div>
              <div className="guild-meta">
                <strong>{guild.name}</strong>
                <span>{guild.members.toLocaleString()} members</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
