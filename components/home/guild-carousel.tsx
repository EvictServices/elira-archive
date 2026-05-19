'use client'

import { useEffect, useRef, useState } from 'react'

type TopGuild = {
  id: string
  name: string
  member_count: number
  icon_url: string | null
  vanity_code?: string | null
  join_url?: string | null
}

import { guildInitials } from '@/lib/discord/format'
import { api } from '@/lib/routes'

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

export default function GuildCarousel() {
  const [guilds, setGuilds] = useState<TopGuild[]>([])
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    fetch(api.guildsTop)
      .then((r) => (r.ok ? r.json() : { guilds: [] }))
      .then((data: { guilds?: TopGuild[] }) => {
        const list = Array.isArray(data.guilds) ? data.guilds : []
        if (list.length > 0) setGuilds(list)
      })
      .catch(() => {})
  }, [])

  if (guilds.length === 0) return null

  const loop = [...guilds, ...guilds]

  return (
    <div className="guild-carousel">
      <div className="guild-carousel-viewport">
        <div className="guild-carousel-track">
          {loop.map((guild, i) => (
            <GuildChip key={`${guild.id}-${i}`} guild={guild} />
          ))}
        </div>
      </div>
    </div>
  )
}
