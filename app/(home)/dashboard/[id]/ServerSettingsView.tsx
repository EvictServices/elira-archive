'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrefixSettings from '@/components/settings/PrefixSettings'
import AntinukeSettings from '@/components/settings/AntinukeSettings'
import LoggingSettings from '@/components/settings/LoggingSettings'
import AutoroleSettings from '@/components/settings/AutoroleSettings'

interface Guild {
  guild_id: string
  name: string
  icon_url: string | null
  banner_url: string | null
  owner_id: string
  member_count: number
  [key: string]: unknown
}

interface User {
  id: string
  username: string
  avatar: string | null
  email: string | null
  serverCount: number
}

function userAvatarUrl(user: User) {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`
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

interface SidebarSection {
  label: string
  items: { id: string; label: string; icon: React.ReactNode }[]
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`sidebar-chevron${open ? ' open' : ''}`}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const sections: SidebarSection[] = [
  {
    label: 'Configuration',
    items: [
      {
        id: 'general',
        label: 'General',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Moderation',
    items: [
      {
        id: 'automod',
        label: 'Auto Moderation',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        id: 'logging',
        label: 'Logging',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
        ),
      },
      {
        id: 'antinuke',
        label: 'Antinuke',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Engagement',
    items: [
      {
        id: 'welcome',
        label: 'Welcome',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        id: 'autorole',
        label: 'Autorole',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        ),
      },
      {
        id: 'starboard',
        label: 'Starboard',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Features',
    items: [
      {
        id: 'music',
        label: 'Music',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        ),
      },
      {
        id: 'voicemaster',
        label: 'VoiceMaster',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ),
      },
      {
        id: 'tickets',
        label: 'Tickets',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
    ],
  },
]

const sectionDescriptions: Record<string, string> = {
  general: 'Manage general server configuration.',
  automod: 'Configure automatic moderation rules',
  logging: 'Set up event logging channels.',
  antinuke: 'Protect your server from malicious actions by rogue administrators.',
  welcome: 'Customize welcome messages for new members.',
  autorole: 'Automatically assign roles to new members.',
  starboard: 'Highlight popular messages in a starboard channel.',
  music: 'Configure music playback settings.',
  voicemaster: 'Create temporary voice channels on demand.',
  tickets: 'Set up a support ticket system.',
}

export default function ServerSettingsView({ guild, user, activeTab, canAccessAntinuke }: { guild: Guild; user: User; activeTab: string; canAccessAntinuke: boolean }) {
  const activeItem = activeTab
  const filteredSections = canAccessAntinuke
    ? sections
    : sections.map((s) => ({
        ...s,
        items: s.items.filter((i) => i.id !== 'antinuke'),
      }))
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.label, true]))
  )

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div className="server-layout">
      <aside className="server-sidebar">
        <Link href="/dashboard" className="server-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to servers
        </Link>

        <div className="sidebar-guild">
          {guild.icon_url ? (
            <img src={guild.icon_url} alt={guild.name} className="sidebar-guild-icon" />
          ) : (
            <div className="sidebar-guild-icon sidebar-guild-icon-placeholder">
              {guildInitials(guild.name)}
            </div>
          )}
          <div className="sidebar-guild-info">
            <span className="sidebar-guild-name">
              {guild.name}
              {(guild.boost_level as number) > 0 && (
                <svg className={`sidebar-boost-badge boost-level-${guild.boost_level as number}`} width="16" height="16" viewBox="0 0 24 24" title={`Server Boost Level ${guild.boost_level as number}`}>
                  <path fill="currentColor" d="M3.06 9.72c.18-.18.42-.18.6-.06l.06.06 2.22 2.22V5.34c0-.24.18-.42.42-.48h.06c.24 0 .42.18.48.42v6.66l2.22-2.22c.18-.18.42-.18.6 0 .18.18.18.42.06.6l-.06.06-3 3c-.06.06-.12.06-.18.06h-.12s-.06 0-.12-.06l-3-3c-.18-.12-.24-.42-.06-.6Zm17.88 4.56c-.18.18-.42.18-.6.06l-.06-.06-2.22-2.22v6.6c0 .24-.18.42-.42.48h-.06c-.24 0-.42-.18-.48-.42v-6.66l-2.22 2.22c-.18.18-.42.18-.6 0-.18-.18-.18-.42-.06-.6l.06-.06 3-3c.06-.06.12-.06.18-.06h.12s.06 0 .12.06l3 3c.18.12.24.42.06.6Z" />
                </svg>
              )}
            </span>
            <span className="sidebar-guild-meta">{guild.member_count.toLocaleString()} members</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredSections.map((section) => (
            <div key={section.label} className="sidebar-section">
              <button
                className="sidebar-section-toggle"
                onClick={() => toggleSection(section.label)}
              >
                <span>{section.label}</span>
                <ChevronIcon open={openSections[section.label]} />
              </button>
              <div className={`sidebar-section-items${openSections[section.label] ? ' open' : ''}`}>
                <div className="sidebar-section-items-inner">
                  {section.items.map((item) => (
                    <Link
                      key={item.id}
                      className={`sidebar-item${activeItem === item.id ? ' active' : ''}`}
                      href={`/dashboard/${guild.guild_id}/${item.id === 'general' ? '' : item.id}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <img src={userAvatarUrl(user)} alt={user.username} className="sidebar-user-avatar" />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.username}</span>
            {user.email && <span className="sidebar-user-email">{user.email}</span>}
            <span className="sidebar-user-servers">{user.serverCount} server{user.serverCount !== 1 ? 's' : ''}</span>
          </div>
          <a href="/api/auth/logout" className="sidebar-user-logout" title="Log out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </a>
        </div>
      </aside>

      <main className="server-content">
        <h1 className="server-content-title">
          {sections.flatMap((s) => s.items).find((i) => i.id === activeItem)?.label}
          {sectionDescriptions[activeItem] && (
            <p className="server-content-desc">{sectionDescriptions[activeItem]}</p>
          )}
        </h1>
        <div className="server-content-body">
          {activeItem === 'general' && <PrefixSettings guildId={guild.guild_id} />}
          {activeItem === 'antinuke' && <AntinukeSettings guildId={guild.guild_id} />}
          {activeItem === 'logging' && <LoggingSettings guildId={guild.guild_id} />}
          {activeItem === 'autorole' && <AutoroleSettings guildId={guild.guild_id} />}
          {activeItem !== 'general' &&
            activeItem !== 'antinuke' &&
            activeItem !== 'logging' &&
            activeItem !== 'autorole' && (
              <p className="server-content-placeholder">Settings for this section coming soon.</p>
            )}
        </div>
      </main>
    </div>
  )
}
