'use client'

import { useEffect, useRef, useState } from 'react'

interface LoggingChannel {
  channel_id: string
  events: string[]
}

interface GuildChannel {
  id: string
  name: string
  type: number
  position: number
  parent_id: string | null
}

interface Settings {
  channels: LoggingChannel[]
  ignored: string[]
}

const EVENT_TYPES = [
  'MESSAGE',
  'MEMBER',
  'ROLE',
  'CHANNEL',
  'INVITE',
  'MODERATION',
  'VOICE',
  'EMOJI',
  'STICKER',
] as const

const EVENT_LABELS: Record<string, string> = {
  MESSAGE: 'Message',
  MEMBER: 'Member',
  ROLE: 'Role',
  CHANNEL: 'Channel',
  INVITE: 'Invite',
  MODERATION: 'Moderation',
  VOICE: 'Voice',
  EMOJI: 'Emoji',
  STICKER: 'Sticker',
}

const EVENT_DESCRIPTIONS: Record<string, string> = {
  MESSAGE: 'Message edits, deletions, and bulk deletes.',
  MEMBER: 'Member joins, leaves, and profile updates.',
  ROLE: 'Role creation, deletion, and permission changes.',
  CHANNEL: 'Channel creation, deletion, and updates.',
  INVITE: 'Invite creation and deletion.',
  MODERATION: 'Bans, kicks, mutes, and warnings.',
  VOICE: 'Voice channel joins, leaves, and moves.',
  EMOJI: 'Emoji creation, deletion, and updates.',
  STICKER: 'Sticker creation, deletion, and updates.',
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  MESSAGE: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  MEMBER: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ROLE: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  CHANNEL: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  INVITE: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  MODERATION: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  VOICE: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  ),
  EMOJI: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  STICKER: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" /><path d="M14 3v4a2 2 0 0 0 2 2h4" />
    </svg>
  ),
}

export default function LoggingSettings({ guildId }: { guildId: string }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [guildChannels, setGuildChannels] = useState<GuildChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/settings/${guildId}/logging`).then((r) => r.json()),
      fetch(`/api/settings/${guildId}/channels`).then((r) => r.json()),
    ])
      .then(([settingsData, channelsData]) => {
        setSettings(settingsData)
        if (Array.isArray(channelsData)) setGuildChannels(channelsData)
      })
      .catch(() => setError('Failed to load logging settings'))
      .finally(() => setLoading(false))
  }, [guildId])

  const eventChannelMap: Record<string, string | null> = {}
  if (settings) {
    for (const event of EVENT_TYPES) {
      const match = settings.channels.find((ch) => ch.events.includes(event))
      eventChannelMap[event] = match ? match.channel_id : null
    }
  }

  const setEventChannel = async (event: string, channelId: string | null) => {
    setSaving(event)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/logging`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, channel_id: channelId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }
      setSettings(await res.json())
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <div className="settings-loading">Loading...</div>
  }

  if (!settings) {
    return <div className="settings-error">Failed to load settings</div>
  }

  const enabledCount = EVENT_TYPES.filter((e) => eventChannelMap[e]).length

  return (
    <div className="logging-settings">
      {error && <p className="settings-error">{error}</p>}

      <div className="logging-channels-header">
        <span className="logging-channels-count">
          {enabledCount} of {EVENT_TYPES.length} event{enabledCount !== 1 ? 's' : ''} configured
        </span>
      </div>

      <div className="an-modules">
        {EVENT_TYPES.map((event, i) => (
          <EventCard
            key={event}
            event={event}
            index={i}
            channelId={eventChannelMap[event]}
            channels={guildChannels}
            saving={saving === event}
            onSetChannel={(channelId) => setEventChannel(event, channelId)}
          />
        ))}
      </div>
    </div>
  )
}

function EventCard({
  event,
  index,
  channelId,
  channels,
  saving,
  onSetChannel,
}: {
  event: string
  index: number
  channelId: string | null
  channels: GuildChannel[]
  saving: boolean
  onSetChannel: (channelId: string | null) => void
}) {
  const enabled = !!channelId

  const handleToggle = () => {
    if (enabled) {
      onSetChannel(null)
    }
  }

  return (
    <div
      className={`an-module${enabled ? ' enabled' : ''}`}
      style={{ animationDelay: `${0.03 * (index + 1)}s` }}
    >
      <div className="an-module-header">
        <span className="an-module-name">
          <span className="logging-event-icon">{EVENT_ICONS[event]}</span>
          {EVENT_LABELS[event]}
        </span>
        <button
          className={`an-toggle ${enabled ? 'on' : ''}`}
          onClick={handleToggle}
          disabled={saving || !enabled}
        >
          <span className="an-toggle-knob" />
        </button>
      </div>
      <span className="an-module-desc">{EVENT_DESCRIPTIONS[event]}</span>
      <div className="an-module-body">
        <div className="an-edit-field">
          <label>Channel</label>
          <ChannelDropdown
            channels={channels}
            value={channelId || ''}
            onChange={(id) => onSetChannel(id || null)}
            saving={saving}
          />
        </div>
      </div>
    </div>
  )
}

function ChannelDropdown({
  channels,
  value,
  onChange,
  saving,
}: {
  channels: GuildChannel[]
  value: string
  onChange: (value: string) => void
  saving?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = channels.find((c) => c.id === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={`an-dropdown${open ? ' open' : ''}${saving ? ' saving' : ''}`} ref={ref}>
      <button className="an-dropdown-trigger" onClick={() => !saving && setOpen(!open)} type="button" disabled={saving}>
        <span>{saving ? 'Saving...' : selected ? `#${selected.name}` : 'Select a channel'}</span>
        <svg className="an-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="an-dropdown-menu" style={{ maxHeight: 200, overflowY: 'auto' }}>
          {channels.length === 0 && (
            <div className="an-dropdown-item" style={{ opacity: 0.4, cursor: 'default' }}>
              No channels available
            </div>
          )}
          {channels.map((ch) => (
            <button
              key={ch.id}
              className={`an-dropdown-item${ch.id === value ? ' active' : ''}`}
              onClick={() => { onChange(ch.id); setOpen(false) }}
              type="button"
            >
              #{ch.name}
              {ch.id === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
