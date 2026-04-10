'use client'

import Link from 'next/link'

interface DashboardUser {
  id: string
  username: string
  avatar: string | null
}

interface Guild {
  id: string
  name: string
  icon_url: string | null
  member_count: number
}

function avatarUrl(user: DashboardUser) {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=128`
  }
  const index = (Number(user.id) >> 22) % 6
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

function guildInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

export default function DashboardView({ user, guilds }: { user: DashboardUser; guilds: Guild[] }) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-header">
        <img
          src={avatarUrl(user)}
          alt={user.username}
          className="dashboard-avatar"
        />
        <div>
          <h1>Welcome, {user.username}</h1>
          <p className="dashboard-subtitle">Select a server to manage</p>
        </div>
      </div>

      <h2 className="dashboard-guilds-title">Your Servers</h2>
      <div className="guild-grid">
        {guilds.map((guild) => (
          <Link key={guild.id} href={`/dashboard/${guild.id}`} className="guild-card">
            {guild.icon_url ? (
              <img src={guild.icon_url} alt={guild.name} className="guild-icon" />
            ) : (
              <div className="guild-icon guild-icon-placeholder">
                {guildInitials(guild.name)}
              </div>
            )}
            <span className="guild-name">{guild.name}</span>
            <span className="guild-members">{guild.member_count.toLocaleString()} members</span>
          </Link>
        ))}
      </div>

      <a href="/api/auth/logout" className="nav-btn nav-btn-ghost dashboard-logout">
        Log Out
      </a>
    </section>
  )
}
