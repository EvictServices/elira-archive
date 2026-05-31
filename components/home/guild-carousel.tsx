'use client'

import { useEffect, useState } from 'react'
import { guildInitials } from '@/lib/discord/format'
import { TOP_GUILDS_CACHE_TTL_SEC, type TopGuild } from '@/lib/marketing/top-guilds-shared'
import { api } from '@/lib/routes'

const CLIENT_CACHE_KEY = 'evict:top-guilds'
const CLIENT_CACHE_TTL_MS = TOP_GUILDS_CACHE_TTL_SEC * 1000

function readClientCache(): TopGuild[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CLIENT_CACHE_KEY)
    if (!raw) return null
    const { guilds, fetchedAt } = JSON.parse(raw) as { guilds: TopGuild[]; fetchedAt: number }
    if (!Array.isArray(guilds) || Date.now() - fetchedAt > CLIENT_CACHE_TTL_MS) return null
    return guilds
  } catch {
    return null
  }
}

function writeClientCache(guilds: TopGuild[]) {
  try {
    sessionStorage.setItem(
      CLIENT_CACHE_KEY,
      JSON.stringify({ guilds, fetchedAt: Date.now() }),
    )
  } catch {
    /* quota / private mode */
  }
}

function GuildChip({ guild }: { guild: TopGuild }) {
  const label = `${guild.name}, ${guild.member_count.toLocaleString()} members`
  const inner = (
    <>
      <span className="guild-carousel-chip-icon">
        {guild.icon_url ? (
          <img src={guild.icon_url} alt="" className="guild-carousel-chip-img" loading="lazy" />
        ) : (
          <span className="guild-carousel-chip-placeholder">{guildInitials(guild.name)}</span>
        )}
      </span>
      <span className="guild-carousel-chip-text">
        <span className="guild-carousel-chip-name">{guild.name}</span>
        <span className="guild-carousel-chip-count">
          {guild.member_count.toLocaleString()} members
        </span>
      </span>
    </>
  )

  if (guild.join_url) {
    return (
      <a
        href={guild.join_url}
        target="_blank"
        rel="noopener noreferrer"
        className="guild-carousel-chip guild-carousel-chip-link"
        aria-label={`${label} — join via discord.gg/${guild.vanity_code}`}
      >
        {inner}
      </a>
    )
  }

  return (
    <div className="guild-carousel-chip" aria-label={label}>
      {inner}
    </div>
  )
}

function SkeletonChip() {
  return (
    <div className="guild-carousel-chip guild-carousel-chip--skeleton" aria-hidden>
      <span className="guild-carousel-chip-icon guild-carousel-skeleton-icon" />
      <span className="guild-carousel-chip-text">
        <span className="guild-carousel-skeleton-line guild-carousel-skeleton-line--name" />
        <span className="guild-carousel-skeleton-line guild-carousel-skeleton-line--count" />
      </span>
    </div>
  )
}

export default function GuildCarousel({ initialGuilds = [] }: { initialGuilds?: TopGuild[] }) {
  const hasInitial = initialGuilds.length > 0
  const [guilds, setGuilds] = useState<TopGuild[]>(() => (hasInitial ? initialGuilds : []))
  const [loading, setLoading] = useState(!hasInitial)

  useEffect(() => {
    if (hasInitial) {
      writeClientCache(initialGuilds)
      return
    }

    const cached = readClientCache()
    if (cached?.length) {
      setGuilds(cached)
      setLoading(false)
      return
    }

    let cancelled = false

    fetch(api.guildsTop)
      .then((r) => (r.ok ? r.json() : { guilds: [] }))
      .then((data: { guilds?: TopGuild[] }) => {
        if (cancelled) return
        const list = Array.isArray(data.guilds) ? data.guilds : []
        setGuilds(list)
        if (list.length) writeClientCache(list)
      })
      .catch(() => {
        if (!cancelled) setGuilds([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [hasInitial, initialGuilds])

  if (!loading && guilds.length === 0) return null

  const loop = guilds.length > 0 ? [...guilds, ...guilds] : []

  return (
    <div className="guild-carousel">
      <div className="guild-carousel-viewport">
        <div className={`guild-carousel-track${loading ? ' is-loading' : ''}`}>
          {loading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonChip key={`sk-${i}`} />)
            : loop.map((guild, i) => <GuildChip key={`${guild.id}-${i}`} guild={guild} />)}
        </div>
      </div>
    </div>
  )
}
