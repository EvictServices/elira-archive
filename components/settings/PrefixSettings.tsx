'use client'

import { useEffect, useState } from 'react'

export default function PrefixSettings({ guildId }: { guildId: string }) {
  const [prefix, setPrefix] = useState('')
  const [saved, setSaved] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/settings/${guildId}/prefix`)
      .then((r) => r.json())
      .then((data) => {
        setPrefix(data.prefix ?? ';')
        setSaved(data.prefix ?? ';')
      })
      .catch(() => setError('Failed to load prefix'))
      .finally(() => setLoading(false))
  }, [guildId])

  const handleSave = async () => {
    if (prefix === saved) return
    if (prefix.length < 1 || prefix.length > 7) {
      setError('Prefix must be between 1 and 7 characters')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/settings/${guildId}/prefix`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      setSaved(prefix)
    } catch {
      setError('Failed to save prefix')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="settings-loading">Loading...</div>
  }

  return (
    <div className="settings-field">
      <label className="settings-label">Server Prefix</label>
      <p className="settings-desc">
        The prefix used to trigger commands. Must be between 1 and 7 characters.
      </p>
      <div className="settings-input-row">
        <input
          type="text"
          className="settings-input"
          value={prefix}
          onChange={(e) => {
            setPrefix(e.target.value)
            setError(null)
          }}
          maxLength={7}
          placeholder=";"
        />
        <button
          className="settings-save-btn"
          onClick={handleSave}
          disabled={saving || prefix === saved || prefix.length < 1}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && <p className="settings-error">{error}</p>}
      {prefix !== saved && !error && (
        <p className="settings-hint">You have unsaved changes</p>
      )}
    </div>
  )
}
