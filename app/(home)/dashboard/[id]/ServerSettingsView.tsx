'use client'

import Link from 'next/link'

interface Guild {
  guild_id: string
  name: string
  icon_url: string | null
  banner_url: string | null
  owner_id: string
  member_count: number
  [key: string]: unknown
}

function guildInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

export default function ServerSettingsView({ guild }: { guild: Guild }) {

  return (
    <section className="dashboard-section">
      <Link href="/dashboard" className="server-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to servers
      </Link>

      <div className="server-header">
        {guild.icon_url ? (
          <img src={guild.icon_url} alt={guild.name} className="server-icon" />
        ) : (
          <div className="server-icon server-icon-placeholder">
            {guildInitials(guild.name)}
          </div>
        )}
        <div>
          <h1 className="server-name">{guild.name}</h1>
          <p className="server-meta">{guild.member_count.toLocaleString()} members</p>
        </div>
      </div>

      <div className="server-settings-grid">
        <div className="settings-card">
          <h3>General</h3>
          <p>Prefix, language, and basic bot configuration.</p>
        </div>
        <div className="settings-card">
          <h3>Moderation</h3>
          <p>Auto-mod, logging, and punishment settings.</p>
        </div>
        <div className="settings-card">
          <h3>Welcome</h3>
          <p>Join/leave messages and autorole setup.</p>
        </div>
        <div className="settings-card">
          <h3>Music</h3>
          <p>Default volume, DJ role, and queue settings.</p>
        </div>
      </div>
    </section>
  )
}
