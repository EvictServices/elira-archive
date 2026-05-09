'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useConfirm } from '@/components/ConfirmModal'

interface Configuration {
  guild_id: string
  category_id: string | null
  interface_id: string | null
  channel_id: string | null
  role_id: string | null
  region: string | null
  bitrate: number | null
  interface_layout: string
}

interface VmChannel {
  guild_id: string
  channel_id: string
  owner_id: string | null
  name: string | null
  member_count: number | null
  bitrate: number | null
  user_limit: number | null
  exists: boolean
}

interface GuildChannel {
  id: string
  name: string
  type: number | string
  position: number
  parent_id: string | null
}

interface GuildRole {
  id: string
  name: string
  color: number
  position: number
  managed: boolean
}

const REGIONS = [
  'brazil',
  'hongkong',
  'india',
  'japan',
  'rotterdam',
  'russia',
  'singapore',
  'south-korea',
  'southafrica',
  'sydney',
  'us-central',
  'us-east',
  'us-south',
  'us-west',
] as const

const REGION_LABELS: Record<string, string> = {
  brazil: 'Brazil',
  hongkong: 'Hong Kong',
  india: 'India',
  japan: 'Japan',
  rotterdam: 'Rotterdam',
  russia: 'Russia',
  singapore: 'Singapore',
  'south-korea': 'South Korea',
  southafrica: 'South Africa',
  sydney: 'Sydney',
  'us-central': 'US Central',
  'us-east': 'US East',
  'us-south': 'US South',
  'us-west': 'US West',
}

const MIN_BITRATE = 8
const MAX_BITRATE = 384

function colorHex(color: number): string | null {
  if (!color) return null
  return `#${color.toString(16).padStart(6, '0')}`
}

export default function VoicemasterSettings({ guildId }: { guildId: string }) {
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [channels, setChannels] = useState<VmChannel[]>([])
  const [categories, setCategories] = useState<GuildChannel[]>([])
  const [voiceChannels, setVoiceChannels] = useState<GuildChannel[]>([])
  const [textChannels, setTextChannels] = useState<GuildChannel[]>([])
  const [roles, setRoles] = useState<GuildRole[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bitrateDraft, setBitrateDraft] = useState<string>('')
  const [customChannelDraft, setCustomChannelDraft] = useState<string>('')
  const { confirm, modal: confirmModal } = useConfirm()

  useEffect(() => {
    Promise.all([
      fetch(`/api/settings/${guildId}/voicemaster`).then((r) => r.json()),
      fetch(`/api/settings/${guildId}/voicemaster/channels`).then((r) => r.json()),
      fetch(`/api/settings/${guildId}/channels?type=category`).then((r) => r.json()),
      fetch(`/api/settings/${guildId}/channels?type=voice`).then((r) => r.json()),
      fetch(`/api/settings/${guildId}/channels?type=text`).then((r) => r.json()),
      fetch(`/api/settings/${guildId}/roles`).then((r) => r.json()),
    ])
      .then(([cfg, ch, cats, voices, texts, rolesData]) => {
        const config = (cfg?.configuration ?? null) as Configuration | null
        setConfiguration(config)
        setBitrateDraft(config?.bitrate ? String(Math.round(config.bitrate / 1000)) : '')
        if (Array.isArray(ch?.channels)) setChannels(ch.channels)
        if (Array.isArray(cats)) setCategories(cats)
        if (Array.isArray(voices)) setVoiceChannels(voices)
        if (Array.isArray(texts)) setTextChannels(texts)
        if (Array.isArray(rolesData)) setRoles(rolesData)
      })
      .catch(() => setError('Failed to load voicemaster settings'))
      .finally(() => setLoading(false))
  }, [guildId])

  const channelsById = useMemo(() => {
    const map = new Map<string, GuildChannel>()
    for (const c of [...categories, ...voiceChannels, ...textChannels]) map.set(c.id, c)
    return map
  }, [categories, voiceChannels, textChannels])

  const rolesById = useMemo(() => {
    const map = new Map<string, GuildRole>()
    for (const r of roles) map.set(r.id, r)
    return map
  }, [roles])

  const patch = async (
    body: Record<string, unknown>,
    savingKey: string
  ): Promise<boolean> => {
    setSaving(savingKey)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/voicemaster`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save')
        return false
      }
      setConfiguration(data.configuration ?? null)
      if (data.configuration?.bitrate != null) {
        setBitrateDraft(String(Math.round(data.configuration.bitrate / 1000)))
      } else if ('bitrate' in body) {
        setBitrateDraft('')
      }
      return true
    } catch {
      setError('Failed to save')
      return false
    } finally {
      setSaving(null)
    }
  }

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset VoiceMaster?',
      description:
        'This wipes the configuration for this server. Existing temporary channels will be left in place but no longer tracked, and you will need to run the setup command again.',
      confirmLabel: 'Reset configuration',
      cancelLabel: 'Cancel',
      destructive: true,
    })
    if (!ok) return
    setSaving('reset')
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/voicemaster`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to reset')
        return
      }
      setConfiguration(null)
      setBitrateDraft('')
      const ch = await fetch(`/api/settings/${guildId}/voicemaster/channels`).then((r) => r.json())
      if (Array.isArray(ch?.channels)) setChannels(ch.channels)
    } catch {
      setError('Failed to reset')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    const ok = await confirm({
      title: 'Delete this voice channel?',
      description:
        'Everyone currently inside will be disconnected and the channel will be removed from Discord. This cannot be undone.',
      confirmLabel: 'Delete channel',
      cancelLabel: 'Cancel',
      destructive: true,
    })
    if (!ok) return

    setSaving(`channel:${channelId}`)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/voicemaster/channels`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_id: channelId, mode: 'hard' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to delete')
        return
      }
      if (data.warning) setError(data.warning)
      if (Array.isArray(data.channels)) setChannels(data.channels)
    } catch {
      setError('Failed to delete')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <div className="settings-loading">Loading...</div>
  }

  if (!configuration) {
    return (
      <>
      <div className="autorole-settings">
        {error && <p className="settings-error">{error}</p>}
        <div className="an-module" style={{ animationDelay: '0.03s' }}>
          <div className="an-module-header">
            <span className="an-module-name">VoiceMaster is not set up</span>
          </div>
          <span className="an-module-desc">
            Run <code>voicemaster setup</code> in your server to create the join-to-create
            channel and interface. Once configured, you&apos;ll be able to manage the defaults
            here.
          </span>
        </div>
      </div>
      {confirmModal}
      </>
    )
  }

  const categoryName = configuration.category_id
    ? channelsById.get(configuration.category_id)?.name
    : null
  const joinToCreateName = configuration.channel_id
    ? channelsById.get(configuration.channel_id)?.name
    : null
  const defaultRole = configuration.role_id
    ? rolesById.get(configuration.role_id)
    : null
  const bitrateKbps = configuration.bitrate != null
    ? Math.round(configuration.bitrate / 1000)
    : null
  const parsedBitrate = bitrateDraft.trim() === '' ? null : Number(bitrateDraft)
  const bitrateChanged = parsedBitrate !== bitrateKbps
  const bitrateValid =
    parsedBitrate === null ||
    (Number.isFinite(parsedBitrate) && parsedBitrate >= MIN_BITRATE && parsedBitrate <= MAX_BITRATE)

  return (
    <>
    <div className="autorole-settings">
      {error && <p className="settings-error">{error}</p>}

      <div className="an-module enabled" style={{ animationDelay: '0.03s' }}>
        <div className="an-module-header">
          <span className="an-module-name">Join-to-create channel</span>
        </div>
        <span className="an-module-desc">
          When a member joins this voice channel, the bot creates a personal temporary
          channel for them in the configured category.
        </span>
        <div className="an-module-body">
          <div className="an-edit-field">
            <label>{joinToCreateName ? `Currently: ${joinToCreateName}` : 'Pick a voice channel'}</label>
            <ChannelDropdown
              channels={voiceChannels}
              value={configuration.channel_id ?? ''}
              onChange={(id) => id && patch({ channel_id: id }, 'channel')}
              placeholder="Select a voice channel"
              saving={saving === 'channel'}
              prefix=""
            />
          </div>
          <div className="an-edit-field">
            <label>Or enter a channel id</label>
            <div className="settings-input-row">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="settings-input"
                value={customChannelDraft}
                onChange={(e) =>
                  setCustomChannelDraft(e.target.value.replace(/[^0-9]/g, ''))
                }
                placeholder="e.g. 1234567890123456789"
                maxLength={20}
              />
              <button
                className="settings-save-btn"
                disabled={
                  saving === 'channel-custom' ||
                  customChannelDraft.length < 17 ||
                  customChannelDraft.length > 20 ||
                  customChannelDraft === configuration.channel_id
                }
                onClick={async () => {
                  const ok = await patch(
                    { channel_id: customChannelDraft },
                    'channel-custom'
                  )
                  if (ok) setCustomChannelDraft('')
                }}
              >
                {saving === 'channel-custom' ? 'Saving...' : 'Apply'}
              </button>
            </div>
            {customChannelDraft.length > 0 &&
              (customChannelDraft.length < 17 || customChannelDraft.length > 20) && (
                <p className="settings-hint">Channel ids are 17–20 digits</p>
              )}
          </div>
          <div className="an-edit-field">
            <label>Interface channel</label>
            <div className="settings-input-row">
              <input
                type="text"
                className="settings-input"
                value={
                  configuration.interface_id
                    ? (() => {
                        const ch = channelsById.get(configuration.interface_id)
                        return ch ? `#${ch.name}` : configuration.interface_id
                      })()
                    : '—'
                }
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      <div className="an-module enabled" style={{ animationDelay: '0.06s' }}>
        <div className="an-module-header">
          <span className="an-module-name">Category</span>
        </div>
        <span className="an-module-desc">
          The category that newly created VoiceMaster channels are placed in.
        </span>
        <div className="an-module-body">
          <div className="an-edit-field">
            <label>{categoryName ? `Currently: ${categoryName}` : 'Pick a category'}</label>
            <ChannelDropdown
              channels={categories}
              value={configuration.category_id ?? ''}
              onChange={(id) => patch({ category_id: id || null }, 'category')}
              placeholder="Select a category"
              saving={saving === 'category'}
              prefix=""
            />
          </div>
        </div>
      </div>

      <div className="an-module enabled" style={{ animationDelay: '0.09s' }}>
        <div className="an-module-header">
          <span className="an-module-name">Default role</span>
          {configuration.role_id && (
            <button
              className="an-toggle-btn"
              onClick={() => patch({ role_id: null }, 'role-clear')}
              disabled={saving === 'role-clear'}
            >
              {saving === 'role-clear' ? 'Removing...' : 'Remove'}
            </button>
          )}
        </div>
        <span className="an-module-desc">
          Role automatically assigned to members while they are inside a VoiceMaster channel.
          Removed when they leave.
        </span>
        <div className="an-module-body">
          <div className="an-edit-field">
            <label>{defaultRole ? `Currently: ${defaultRole.name}` : 'Pick a role'}</label>
            <RoleDropdown
              roles={roles.filter((r) => !r.managed)}
              value={configuration.role_id ?? ''}
              onChange={(id) => patch({ role_id: id || null }, 'role')}
              saving={saving === 'role'}
              placeholder="Select a role"
            />
          </div>
        </div>
      </div>

      <div className="an-module enabled" style={{ animationDelay: '0.12s' }}>
        <div className="an-module-header">
          <span className="an-module-name">Default region</span>
          {configuration.region && (
            <button
              className="an-toggle-btn"
              onClick={() => patch({ region: null }, 'region-clear')}
              disabled={saving === 'region-clear'}
            >
              {saving === 'region-clear' ? 'Clearing...' : 'Auto'}
            </button>
          )}
        </div>
        <span className="an-module-desc">
          Voice region used when creating new channels. Leave on auto to let Discord pick the
          best region.
        </span>
        <div className="an-module-body">
          <div className="an-edit-field">
            <label>
              {configuration.region
                ? `Currently: ${REGION_LABELS[configuration.region] ?? configuration.region}`
                : 'Currently: Auto'}
            </label>
            <Dropdown
              value={configuration.region ?? ''}
              options={[
                { value: '', label: 'Auto (recommended)' },
                ...REGIONS.map((r) => ({ value: r, label: REGION_LABELS[r] ?? r })),
              ]}
              onChange={(v) => patch({ region: v || null }, 'region')}
              saving={saving === 'region'}
            />
          </div>
        </div>
      </div>

      <div className="an-module enabled" style={{ animationDelay: '0.15s' }}>
        <div className="an-module-header">
          <span className="an-module-name">Default bitrate</span>
          {configuration.bitrate != null && (
            <button
              className="an-toggle-btn"
              onClick={() => patch({ bitrate: null }, 'bitrate-clear')}
              disabled={saving === 'bitrate-clear'}
            >
              {saving === 'bitrate-clear' ? 'Clearing...' : 'Default'}
            </button>
          )}
        </div>
        <span className="an-module-desc">
          Bitrate in kbps used when creating new channels (between {MIN_BITRATE} and {MAX_BITRATE}).
          Leave blank to use the server&apos;s default.
        </span>
        <div className="an-module-body">
          <div className="an-edit-field">
            <label>kbps</label>
            <div className="settings-input-row">
              <input
                type="number"
                className="settings-input"
                min={MIN_BITRATE}
                max={MAX_BITRATE}
                value={bitrateDraft}
                onChange={(e) => setBitrateDraft(e.target.value)}
                placeholder="e.g. 64"
              />
              <button
                className="settings-save-btn"
                onClick={() =>
                  patch({ bitrate: parsedBitrate }, 'bitrate')
                }
                disabled={saving === 'bitrate' || !bitrateChanged || !bitrateValid}
              >
                {saving === 'bitrate' ? 'Saving...' : 'Save'}
              </button>
            </div>
            {!bitrateValid && (
              <p className="settings-error">
                Bitrate must be between {MIN_BITRATE} and {MAX_BITRATE} kbps
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="an-module enabled" style={{ animationDelay: '0.18s' }}>
        <div className="an-module-header">
          <span className="an-module-name">
            Active channels{channels.length > 0 ? ` (${channels.length})` : ''}
          </span>
        </div>
        <span className="an-module-desc">
          Temporary voice channels the bot is currently tracking. Deleting a row
          disconnects every member and removes the channel from Discord; if the
          channel was already deleted manually, the tracking record is just dropped.
        </span>
        <div className="an-module-body">
          {channels.length === 0 ? (
            <p className="settings-hint" style={{ margin: 0 }}>
              No active VoiceMaster channels right now.
            </p>
          ) : (
            <div className="autorole-list">
              {channels.map((ch) => {
                const fallback = channelsById.get(ch.channel_id)
                const name = ch.name ?? fallback?.name ?? null
                const key = `channel:${ch.channel_id}`
                const meta: string[] = []
                if (ch.exists) {
                  if (ch.member_count != null) {
                    meta.push(
                      `${ch.member_count}${ch.user_limit ? `/${ch.user_limit}` : ''} connected`
                    )
                  }
                  if (ch.bitrate != null) {
                    meta.push(`${Math.round(ch.bitrate / 1000)} kbps`)
                  }
                } else {
                  meta.push('not in Discord')
                }
                if (ch.owner_id) {
                  meta.push(`owner ${ch.owner_id}`)
                } else {
                  meta.push('no owner')
                }
                return (
                  <div key={ch.channel_id} className="autorole-row">
                    <span className="autorole-role">
                      <span className="autorole-role-name">
                        {name ?? `Channel · ${ch.channel_id}`}
                      </span>
                    </span>
                    <span className="autorole-delay">{meta.join(' · ')}</span>
                    <button
                      className="autorole-remove-btn"
                      onClick={() => handleDeleteChannel(ch.channel_id)}
                      disabled={saving === key}
                      title="Disconnect members and delete the voice channel"
                    >
                      {saving === key ? '…' : 'Delete'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="an-module" style={{ animationDelay: '0.21s' }}>
        <div className="an-module-header">
          <span className="an-module-name">Reset configuration</span>
          <button
            className="autorole-remove-btn"
            onClick={handleReset}
            disabled={saving === 'reset'}
          >
            {saving === 'reset' ? 'Resetting...' : 'Reset'}
          </button>
        </div>
        <span className="an-module-desc">
          Remove the VoiceMaster configuration entirely. You&apos;ll need to run{' '}
          <code>voicemaster setup</code> again to reconfigure.
        </span>
      </div>
    </div>
    {confirmModal}
    </>
  )
}

function Dropdown({
  value,
  options,
  onChange,
  saving,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  saving?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={`an-dropdown${open ? ' open' : ''}${saving ? ' saving' : ''}`} ref={ref}>
      <button
        className="an-dropdown-trigger"
        onClick={() => !saving && setOpen(!open)}
        type="button"
        disabled={saving}
      >
        <span>{saving ? 'Saving...' : selected?.label ?? 'Select...'}</span>
        <svg className="an-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="an-dropdown-menu" style={{ maxHeight: 240, overflowY: 'auto' }}>
          {options.map((opt) => (
            <button
              key={opt.value || '__none'}
              className={`an-dropdown-item${opt.value === value ? ' active' : ''}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              type="button"
            >
              {opt.label}
              {opt.value === value && (
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

function ChannelDropdown({
  channels,
  value,
  onChange,
  placeholder,
  saving,
  prefix = '#',
}: {
  channels: GuildChannel[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  saving?: boolean
  prefix?: string
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
      <button
        className="an-dropdown-trigger"
        onClick={() => !saving && setOpen(!open)}
        type="button"
        disabled={saving}
      >
        <span>
          {saving
            ? 'Saving...'
            : selected
              ? `${prefix}${selected.name}`
              : placeholder}
        </span>
        <svg className="an-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="an-dropdown-menu" style={{ maxHeight: 240, overflowY: 'auto' }}>
          {channels.length === 0 && (
            <div className="an-dropdown-item" style={{ opacity: 0.4, cursor: 'default' }}>
              None available
            </div>
          )}
          {channels.map((c) => (
            <button
              key={c.id}
              className={`an-dropdown-item${c.id === value ? ' active' : ''}`}
              onClick={() => {
                onChange(c.id)
                setOpen(false)
              }}
              type="button"
            >
              {prefix}{c.name}
              {c.id === value && (
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

function RoleDropdown({
  roles,
  value,
  onChange,
  placeholder,
  saving,
}: {
  roles: GuildRole[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  saving?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = roles.find((r) => r.id === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={`an-dropdown${open ? ' open' : ''}${saving ? ' saving' : ''}`} ref={ref}>
      <button
        className="an-dropdown-trigger"
        onClick={() => !saving && setOpen(!open)}
        type="button"
        disabled={saving}
      >
        <span>
          {saving ? (
            'Saving...'
          ) : selected ? (
            <span className="autorole-role">
              <span
                className="autorole-role-dot"
                style={
                  selected.color
                    ? { background: `#${selected.color.toString(16).padStart(6, '0')}` }
                    : undefined
                }
              />
              {selected.name}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <svg className="an-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="an-dropdown-menu" style={{ maxHeight: 240, overflowY: 'auto' }}>
          {roles.length === 0 && (
            <div className="an-dropdown-item" style={{ opacity: 0.4, cursor: 'default' }}>
              No roles available
            </div>
          )}
          {roles.map((role) => {
            const hex = colorHex(role.color)
            return (
              <button
                key={role.id}
                className={`an-dropdown-item${role.id === value ? ' active' : ''}`}
                onClick={() => {
                  onChange(role.id)
                  setOpen(false)
                }}
                type="button"
              >
                <span className="autorole-role">
                  <span
                    className="autorole-role-dot"
                    style={hex ? { background: hex } : undefined}
                  />
                  {role.name}
                </span>
                {role.id === value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
