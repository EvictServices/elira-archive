'use client'

import { useEffect, useRef, useState } from 'react'

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

export default function AntinukeSettings({ guildId }: { guildId: string }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/settings/${guildId}/antinuke`)
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => setError('Failed to load antinuke settings'))
      .finally(() => setLoading(false))
  }, [guildId])

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

  return (
    <div className="antinuke-settings">
      {error && <p className="settings-error">{error}</p>}

      <div className="an-modules">
        {MODULE_NAMES.map((name) => {
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
        })}
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
      </div>
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
