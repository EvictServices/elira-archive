'use client'

import { useEffect, useState } from 'react'
import { guildInitials } from '@/lib/discord/format'
import { api } from '@/lib/routes'

type TopGuild = {
  id: string
  name: string
  member_count: number
  icon_url: string | null
  vanity_code?: string | null
  join_url?: string | null
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

export default function GuildCarousel() {
  const [guilds, setGuilds] = useState<TopGuild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch(api.guildsTop)
      .then((r) => (r.ok ? r.json() : { guilds: [] }))
      .then((data: { guilds?: TopGuild[] }) => {
        if (cancelled) return
        setGuilds(Array.isArray(data.guilds) ? data.guilds : [])
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
  }, [])

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
