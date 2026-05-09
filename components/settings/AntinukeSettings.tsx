'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ResolvedDiscordUser } from '@/lib/cluster'

interface Module {
  threshold: number
  duration: number
  punishment: 'ban' | 'kick' | 'strip'
}

interface Settings {
  bot: boolean
  ban: Module | null
  kick: Module | null
  role: Module | null
  channel: Module | null
  webhook: Module | null
  emoji: Module | null
  whitelist: string[]
  trusted_admins: string[]
}

const MODULE_NAMES = ['ban', 'kick', 'role', 'channel', 'webhook', 'emoji'] as const

const MODULE_LABELS: Record<string, string> = {
  ban: 'Ban Protection',
  kick: 'Kick Protection',
  role: 'Role Protection',
  channel: 'Channel Protection',
  webhook: 'Webhook Protection',
  emoji: 'Emoji Protection',
}

const MODULE_DESCRIPTIONS: Record<string, string> = {
  ban: 'Triggers when a user bans too many members.',
  kick: 'Triggers when a user kicks too many members.',
  role: 'Triggers when a user deletes or modifies too many roles.',
  channel: 'Triggers when a user deletes or modifies too many channels.',
  webhook: 'Triggers when a user creates too many webhooks.',
  emoji: 'Triggers when a user deletes too many emojis.',
}

function defaultModule(): Module {
  return { threshold: 5, duration: 60, punishment: 'ban' }
}

const SNOWFLAKE_RE = /^\d{17,20}$/

export default function AntinukeSettings({ guildId }: { guildId: string }) {
  const router = useRouter()
  const exitIfForbidden = useCallback(
    (status: number) => {
      if (status === 403) {
        router.replace(`/dashboard/${guildId}/general`)
        return true
      }
      return false
    },
    [guildId, router]
  )

  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [listSaving, setListSaving] = useState<'whitelist' | 'trusted_admins' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userProfiles, setUserProfiles] = useState<
    Record<string, ResolvedDiscordUser>
  >({})
  const [profilesLoading, setProfilesLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/settings/${guildId}/antinuke`)
      .then(async (r) => {
        if (exitIfForbidden(r.status)) return
        const data = await r.json()
        if (!r.ok) {
          setError(data.error || 'Failed to load antinuke settings')
          return
        }
        setSettings(data as Settings)
      })
      .catch(() => setError('Failed to load antinuke settings'))
      .finally(() => setLoading(false))
  }, [guildId, exitIfForbidden])

  const profileIdsKey = useMemo(() => {
    if (!settings) return ''
    const ids = [
      ...new Set([...settings.trusted_admins, ...settings.whitelist]),
    ].sort()
    return ids.join(',')
  }, [settings])

  useEffect(() => {
    if (!settings) return
    const ids = [
      ...new Set([...settings.trusted_admins, ...settings.whitelist]),
    ]
    if (ids.length === 0) {
      setUserProfiles({})
      return
    }

    let cancelled = false
    setProfilesLoading(true)
    fetch(`/api/settings/${guildId}/antinuke/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then(async (r) => {
        if (exitIfForbidden(r.status)) return
        const data = await r.json()
        if (!r.ok) return
        if (!cancelled && data.users && typeof data.users === 'object') {
          const incoming = data.users as Record<string, ResolvedDiscordUser>
          const pruned: Record<string, ResolvedDiscordUser> = {}
          for (const id of ids) {
            if (incoming[id]) pruned[id] = incoming[id]
          }
          setUserProfiles(pruned)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfilesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [guildId, profileIdsKey, exitIfForbidden])

  const toggleModule = async (name: string) => {
    if (!settings) return
    const current = settings[name as keyof Settings] as Module | null
    const next = current ? null : defaultModule()

    setSaving(name)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/antinuke`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: name, config: next }),
      })
      if (exitIfForbidden(res.status)) return
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

  const updateModule = async (name: string, config: Module) => {
    setSaving(name)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/antinuke`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: name, config }),
      })
      if (exitIfForbidden(res.status)) return
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

  const toggleBot = async () => {
    if (!settings) return
    setSaving('bot')
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/antinuke`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot: !settings.bot }),
      })
      if (exitIfForbidden(res.status)) return
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

  const patchUserList = async (
    field: 'whitelist' | 'trusted_admins',
    next: string[]
  ) => {
    setListSaving(field)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/antinuke`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: next }),
      })
      if (exitIfForbidden(res.status)) return
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }
      setSettings(await res.json())
    } catch {
      setError('Failed to save')
    } finally {
      setListSaving(null)
    }
  }

  if (loading) {
    return <div className="settings-loading">Loading...</div>
  }

  if (!settings) {
    return <div className="settings-error">Failed to load settings</div>
  }

  const enabledModules = MODULE_NAMES.filter((n) => settings[n] !== null)
  const disabledModules = MODULE_NAMES.filter((n) => settings[n] === null)

  const renderModuleCard = (name: (typeof MODULE_NAMES)[number]) => {
    const mod = settings[name] as Module | null
    return (
      <ModuleCard
        key={name}
        name={name}
        label={MODULE_LABELS[name]}
        description={MODULE_DESCRIPTIONS[name]}
        config={mod}
        saving={saving === name}
        onToggle={() => toggleModule(name)}
        onUpdate={(config) => updateModule(name, config)}
      />
    )
  }

  const antiBotCard = (
    <div className={`an-module ${settings.bot ? 'enabled' : ''}`}>
      <div className="an-module-header">
        <span className="an-module-name">Anti-Bot</span>
        <button
          className={`an-toggle ${settings.bot ? 'on' : ''}`}
          onClick={toggleBot}
          disabled={saving === 'bot'}
        >
          <span className="an-toggle-knob" />
        </button>
      </div>
      <span className="an-module-desc">Prevent unauthorized bots from being added.</span>
    </div>
  )

  return (
    <div className="antinuke-settings">
      {error && <p className="settings-error">{error}</p>}

      {enabledModules.length > 0 && (
        <div className="an-modules an-modules-enabled">
          {enabledModules.map(renderModuleCard)}
        </div>
      )}

      <div className="an-modules an-modules-compact">
        {disabledModules.map(renderModuleCard)}
        {antiBotCard}
      </div>

      <section className="an-access" aria-labelledby="an-access-heading">
        <h2 id="an-access-heading" className="an-access-heading">
          Trusted &amp; whitelisted users
        </h2>
        <p className="an-access-lead">
          Trusted admins can manage antinuke from Discord and this dashboard. Whitelisted users
          are ignored by antinuke thresholds (same as the bot).
        </p>
        <div className="an-access-panel">
          <div className="an-access-grid">
            <SnowflakeUserColumn
              title="Trusted admins"
              description="May configure antinuke and appear exempt like the owner."
              ids={settings.trusted_admins}
              userProfiles={userProfiles}
              profilesLoading={profilesLoading}
              disabled={listSaving !== null}
              saving={listSaving === 'trusted_admins'}
              onChange={(next) => {
                void patchUserList('trusted_admins', next)
              }}
            />
            <SnowflakeUserColumn
              title="Whitelist"
              description="Users exempt from antinuke punishment triggers."
              ids={settings.whitelist}
              userProfiles={userProfiles}
              profilesLoading={profilesLoading}
              disabled={listSaving !== null}
              saving={listSaving === 'whitelist'}
              onChange={(next) => {
                void patchUserList('whitelist', next)
              }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function chipUsername(
  p: ResolvedDiscordUser | undefined,
  profilesLoading: boolean
): string {
  if (p) {
    const u = p.username.trim()
    return u || 'Unknown user'
  }
  if (profilesLoading) return 'Loading…'
  return 'Unknown user'
}

function SnowflakeUserColumn({
  title,
  description,
  ids,
  userProfiles,
  profilesLoading,
  disabled,
  saving,
  onChange,
}: {
  title: string
  description: string
  ids: string[]
  userProfiles: Record<string, ResolvedDiscordUser>
  profilesLoading: boolean
  disabled: boolean
  saving: boolean
  onChange: (next: string[]) => void
}) {
  const [input, setInput] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const add = () => {
    const t = input.trim()
    setLocalError(null)
    if (!t) return
    if (!SNOWFLAKE_RE.test(t)) {
      setLocalError('Use a 17–20 digit Discord user ID.')
      return
    }
    if (ids.includes(t)) {
      setLocalError('Already in this list.')
      return
    }
    onChange([...ids, t])
    setInput('')
  }

  return (
    <div className="an-access-card">
      <div className="an-access-card-head">
        <h3 className="an-access-card-title">{title}</h3>
        <span className="an-access-card-count">{ids.length}</span>
      </div>
      <p className="an-access-card-desc">{description}</p>
      <div className="an-access-add">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="User ID"
          value={input}
          disabled={disabled}
          onChange={(e) => {
            setLocalError(null)
            setInput(e.target.value.replace(/\D/g, '').slice(0, 20))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          className="settings-input an-access-input"
        />
        <button
          type="button"
          className="btn btn-ghost an-access-add-btn"
          onClick={add}
          disabled={disabled || !input.trim()}
        >
          Add
        </button>
      </div>
      {localError && <p className="an-access-local-error">{localError}</p>}
      <ul className="an-access-chips" aria-label={title}>
        {ids.length === 0 ? (
          <li className="an-access-empty">No users yet</li>
        ) : (
          ids.map((id) => {
            const p = userProfiles[id]
            const name = chipUsername(p, profilesLoading)
            return (
              <li key={id} className="an-access-chip">
                <div className="an-access-chip-main">
                  {p?.avatar ? (
                    <img
                      src={p.avatar}
                      alt=""
                      className="an-access-chip-avatar"
                    />
                  ) : (
                    <div
                      className="an-access-chip-avatar an-access-chip-avatar-placeholder"
                      aria-hidden
                    >
                      {(name[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <div className="an-access-chip-text">
                    <span className="an-access-chip-name">{name}</span>
                    <span className="an-access-chip-id">{id}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="an-access-chip-remove"
                  title="Remove"
                  disabled={disabled}
                  onClick={() => onChange(ids.filter((x) => x !== id))}
                >
                  ×
                </button>
              </li>
            )
          })
        )}
      </ul>
      {saving && <p className="settings-hint">Saving…</p>}
    </div>
  )
}

function ModuleCard({
  name,
  label,
  description,
  config,
  saving,
  onToggle,
  onUpdate,
}: {
  name: string
  label: string
  description: string
  config: Module | null
  saving: boolean
  onToggle: () => void
  onUpdate: (config: Module) => void
}) {
  const [threshold, setThreshold] = useState(config?.threshold ?? 5)
  const [duration, setDuration] = useState(config?.duration ?? 60)
  const [punishment, setPunishment] = useState<Module['punishment']>(config?.punishment ?? 'ban')

  useEffect(() => {
    if (config) {
      setThreshold(config.threshold)
      setDuration(config.duration)
      setPunishment(config.punishment)
    }
  }, [config])

  const dirty = config && (threshold !== config.threshold || duration !== config.duration || punishment !== config.punishment)

  const handleSave = () => {
    onUpdate({ threshold, duration, punishment })
  }

  return (
    <div className={`an-module ${config ? 'enabled' : ''}`}>
      <div className="an-module-header">
        <span className="an-module-name">{label}</span>
        <button
          className={`an-toggle ${config ? 'on' : ''}`}
          onClick={onToggle}
          disabled={saving}
        >
          <span className="an-toggle-knob" />
        </button>
      </div>
      <span className="an-module-desc">{description}</span>
      {config && (
        <div className="an-module-body">
          <div className="an-edit-field">
            <label>Threshold</label>
            <div className="settings-input-row">
              <input
                type="number"
                min={1}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="settings-input"
              />
            </div>
          </div>
          <div className="an-edit-field">
            <label>Duration (seconds)</label>
            <div className="settings-input-row">
              <input
                type="number"
                min={1}
                max={86400}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="settings-input"
              />
            </div>
          </div>
          <div className="an-edit-field">
            <label>Punishment</label>
            <Dropdown
              value={punishment}
              options={[
                { value: 'ban', label: 'Ban' },
                { value: 'kick', label: 'Kick' },
                { value: 'strip', label: 'Strip Roles' },
              ]}
              onChange={(v) => setPunishment(v as Module['punishment'])}
            />
          </div>
          <div className="settings-input-row" style={{ marginTop: 4 }}>
            <button className="settings-save-btn" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {dirty && <p className="settings-hint">You have unsaved changes</p>}
        </div>
      )}
    </div>
  )
}

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
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
    <div className={`an-dropdown${open ? ' open' : ''}`} ref={ref}>
      <button className="an-dropdown-trigger" onClick={() => setOpen(!open)} type="button">
        <span>{selected?.label}</span>
        <svg className="an-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="an-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`an-dropdown-item${opt.value === value ? ' active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
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
