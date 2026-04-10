'use client'

import { useEffect, useState } from 'react'

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
  const [editing, setEditing] = useState(false)
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

  const handleSave = () => {
    onUpdate({ threshold, duration, punishment })
    setEditing(false)
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
          {!editing ? (
            <div className="an-module-summary">
              <div className="an-summary-stats">
                <span>Threshold: <b>{config.threshold}</b></span>
                <span>Duration: <b>{config.duration}s</b></span>
                <span>Punishment: <b>{config.punishment}</b></span>
              </div>
              <button className="an-edit-btn" onClick={() => setEditing(true)}>Edit</button>
            </div>
          ) : (
            <div className="an-module-edit">
              <div className="an-edit-field">
                <label>Threshold</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="settings-input"
                />
              </div>
              <div className="an-edit-field">
                <label>Duration (seconds)</label>
                <input
                  type="number"
                  min={1}
                  max={86400}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="settings-input"
                />
              </div>
              <div className="an-edit-field">
                <label>Punishment</label>
                <select
                  value={punishment}
                  onChange={(e) => setPunishment(e.target.value as Module['punishment'])}
                  className="settings-input"
                >
                  <option value="ban">Ban</option>
                  <option value="kick">Kick</option>
                  <option value="strip">Strip Roles</option>
                </select>
              </div>
              <div className="an-edit-actions">
                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                  Save
                </button>
                <button className="an-cancel-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
