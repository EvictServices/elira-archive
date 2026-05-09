'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface AuditEntry {
  id: string
  guild_id?: string
  user_id: string
  actor_username: string | null
  action: string
  detail: Record<string, unknown>
  created_at: string
}

const ACTION_TITLE: Record<string, string> = {
  'prefix.update': 'Command prefix',
  'antinuke.module.update': 'Antinuke module',
  'antinuke.bot_toggle': 'Antinuke bot monitoring',
  'antinuke.whitelist.update': 'Antinuke whitelist',
  'antinuke.trusted_admins.update': 'Antinuke trusted admins',
  'logging.event_channel': 'Logging event route',
  'logging.channel_events': 'Logging channel events',
  'logging.ignored_add': 'Logging ignore list',
  'logging.ignored_remove': 'Logging ignore list',
  'logging.channel_remove': 'Logging channel',
  'autorole.add': 'Autorole rule',
  'autorole.remove': 'Autorole rule',
  'autorole.clear': 'Autorole rules',
  'autorole.reassign': 'Role reassignment',
  'autorole.reassign_ignore': 'Reassignment ignores',
  'voicemaster.create': 'VoiceMaster setup',
  'voicemaster.update': 'VoiceMaster settings',
  'voicemaster.delete': 'VoiceMaster',
  'voicemaster.temp_channel.owner': 'Temp voice channel',
  'voicemaster.temp_channel.delete': 'Temp voice channel',
  'voicemaster.temp_channels.delete_bulk': 'Temp voice channels',
  'welcome.upsert': 'Welcome message',
  'welcome.delete': 'Welcome message',
}

const ACTION_CATEGORY: Record<string, string> = {
  'prefix.update': 'General',
  'antinuke.module.update': 'Antinuke',
  'antinuke.bot_toggle': 'Antinuke',
  'antinuke.whitelist.update': 'Antinuke',
  'antinuke.trusted_admins.update': 'Antinuke',
  'logging.event_channel': 'Logging',
  'logging.channel_events': 'Logging',
  'logging.ignored_add': 'Logging',
  'logging.ignored_remove': 'Logging',
  'logging.channel_remove': 'Logging',
  'autorole.add': 'Autorole',
  'autorole.remove': 'Autorole',
  'autorole.clear': 'Autorole',
  'autorole.reassign': 'Autorole',
  'autorole.reassign_ignore': 'Autorole',
  'voicemaster.create': 'VoiceMaster',
  'voicemaster.update': 'VoiceMaster',
  'voicemaster.delete': 'VoiceMaster',
  'voicemaster.temp_channel.owner': 'VoiceMaster',
  'voicemaster.temp_channel.delete': 'VoiceMaster',
  'voicemaster.temp_channels.delete_bulk': 'VoiceMaster',
  'welcome.upsert': 'Welcome',
  'welcome.delete': 'Welcome',
}

function categoryForAction(action: string): string {
  return ACTION_CATEGORY[action] ?? 'Dashboard'
}

function titleForAction(action: string): string {
  return ACTION_TITLE[action] ?? action.replace(/\./g, ' · ')
}

function formatSnowflake(id: unknown): string {
  if (typeof id !== 'string') return String(id)
  return id
}

function buildChangeBlurb(action: string, detail: Record<string, unknown>): string {
  const d = detail
  switch (action) {
    case 'prefix.update':
      return typeof d.prefix === 'string' ? `Set to “${d.prefix}”` : 'Updated'
    case 'antinuke.module.update':
      return typeof d.module === 'string' ? `Module: ${d.module}` : 'Configuration saved'
    case 'antinuke.bot_toggle':
      return d.enabled === true ? 'Turned on' : d.enabled === false ? 'Turned off' : 'Toggled'
    case 'antinuke.whitelist.update':
      return typeof d.count === 'number' ? `${d.count} user(s)` : 'List updated'
    case 'antinuke.trusted_admins.update':
      return typeof d.count === 'number' ? `${d.count} admin(s)` : 'List updated'
    case 'logging.event_channel': {
      const ev = typeof d.event === 'string' ? d.event : 'event'
      const ch = d.channel_id
      return ch ? `${ev} → channel ${formatSnowflake(ch)}` : `${ev} → cleared`
    }
    case 'logging.channel_events':
      return typeof d.events_count === 'number'
        ? `${d.events_count} event type(s) on one channel`
        : 'Events updated'
    case 'logging.ignored_add':
    case 'logging.ignored_remove':
      return typeof d.target_id === 'string' ? `Target ${d.target_id}` : 'Updated'
    case 'logging.channel_remove':
      return typeof d.channel_id === 'string' ? `Channel ${d.channel_id}` : 'Removed'
    case 'autorole.add':
      return typeof d.role_id === 'string'
        ? `Role ${d.role_id} · ${String(d.action ?? '')}${d.delay != null ? ` · ${d.delay}s` : ''}`
        : 'Rule added'
    case 'autorole.remove':
      return typeof d.role_id === 'string' ? `Role ${d.role_id}` : 'Rule removed'
    case 'autorole.clear':
      return 'All rules removed'
    case 'autorole.reassign':
      return d.enabled === true ? 'Enabled' : d.enabled === false ? 'Disabled' : 'Toggled'
    case 'autorole.reassign_ignore':
      return typeof d.role_ids_count === 'number'
        ? `${d.role_ids_count} role(s) ignored`
        : 'Ignore list updated'
    case 'voicemaster.create':
      return 'Category, interface & join channel linked'
    case 'voicemaster.update': {
      const parts: string[] = []
      if ('category_id' in d && d.category_id != null) parts.push('category')
      if ('channel_id' in d && d.channel_id != null) parts.push('join channel')
      if ('role_id' in d) parts.push('role')
      if ('region' in d) parts.push('region')
      if ('bitrate' in d) parts.push('bitrate')
      return parts.length ? `Updated: ${parts.join(', ')}` : 'Settings saved'
    }
    case 'voicemaster.delete':
      return 'Configuration removed'
    case 'voicemaster.temp_channel.owner':
      return typeof d.channel_id === 'string' && typeof d.owner_id === 'string'
        ? `Channel ${d.channel_id.slice(0, 8)}… → owner ${d.owner_id.slice(0, 8)}…`
        : 'Ownership updated'
    case 'voicemaster.temp_channel.delete':
      return typeof d.channel_id === 'string' ? `Channel ${d.channel_id}` : 'Deleted'
    case 'voicemaster.temp_channels.delete_bulk':
      return typeof d.count === 'number'
        ? `${d.count} channel(s) · ${String(d.mode ?? '')}`
        : 'Bulk delete'
    case 'welcome.upsert':
      if (typeof d.from_channel_id === 'string' && typeof d.channel_id === 'string') {
        return `Moved ${d.from_channel_id.slice(0, 8)}… → ${d.channel_id.slice(0, 8)}…`
      }
      return typeof d.channel_id === 'string' ? `Channel ${d.channel_id}` : 'Updated'
    case 'welcome.delete':
      return typeof d.channel_id === 'string' ? `Channel ${d.channel_id}` : 'Updated'
    default:
      return Object.keys(d).length === 0 ? 'Saved' : 'See details'
  }
}

const DETAIL_LABELS: Record<string, string> = {
  prefix: 'Prefix',
  module: 'Module',
  enabled: 'Enabled',
  count: 'Count',
  event: 'Event',
  channel_id: 'Channel ID',
  from_channel_id: 'Previous channel ID',
  events_count: 'Event types',
  target_id: 'Target ID',
  role_id: 'Role ID',
  action: 'Action',
  delay: 'Delay (seconds)',
  role_ids_count: 'Roles count',
  category_id: 'Category ID',
  interface_id: 'Interface channel ID',
  owner_id: 'Owner ID',
  region: 'Region',
  bitrate: 'Bitrate',
  mode: 'Mode',
}

function formatDetailValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number' || typeof v === 'string') return String(v)
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const sec = Math.round((Date.now() - t) / 1000)
  if (sec < 45) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 48) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 14) return `${day}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function AuditDetailPopout({
  entry,
  guildId,
  onClose,
}: {
  entry: AuditEntry
  guildId: string
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  if (!mounted) return null

  const when = new Date(entry.created_at)
  const localOk = !Number.isNaN(when.getTime())
  const localStr = localOk
    ? when.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'medium' })
    : entry.created_at
  const isoStr = localOk ? when.toISOString() : entry.created_at
  const rel = localOk ? relativeTime(entry.created_at) : ''

  const detailRows = Object.entries(entry.detail).map(([key, val]) => (
    <div key={key} className="audit-detail-kv">
      <dt className="audit-detail-k">{DETAIL_LABELS[key] ?? key}</dt>
      <dd className="audit-detail-v">{formatDetailValue(val)}</dd>
    </div>
  ))

  const content = (
    <div
      className="audit-detail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-detail-title"
    >
      <div className="audit-detail-card">
        <div className="audit-detail-head">
          <div>
            <p className="audit-detail-eyebrow">{categoryForAction(entry.action)}</p>
            <h2 id="audit-detail-title" className="audit-detail-title">
              {titleForAction(entry.action)}
            </h2>
            <p className="audit-detail-blurb">{buildChangeBlurb(entry.action, entry.detail)}</p>
          </div>
          <button type="button" className="audit-detail-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="audit-detail-body">
        <div className="audit-detail-section">
          <h3 className="audit-detail-h3">When</h3>
          <dl className="audit-detail-dl">
            <div className="audit-detail-kv">
              <dt className="audit-detail-k">Local time</dt>
              <dd className="audit-detail-v">{localStr}</dd>
            </div>
            {rel && (
              <div className="audit-detail-kv">
                <dt className="audit-detail-k">Relative</dt>
                <dd className="audit-detail-v">{rel}</dd>
              </div>
            )}
            <div className="audit-detail-kv">
              <dt className="audit-detail-k">UTC (ISO)</dt>
              <dd className="audit-detail-v audit-detail-mono">{isoStr}</dd>
            </div>
          </dl>
        </div>

        <div className="audit-detail-section">
          <h3 className="audit-detail-h3">Who</h3>
          <dl className="audit-detail-dl">
            <div className="audit-detail-kv">
              <dt className="audit-detail-k">Username</dt>
              <dd className="audit-detail-v">{entry.actor_username ?? '—'}</dd>
            </div>
            <div className="audit-detail-kv">
              <dt className="audit-detail-k">User ID</dt>
              <dd className="audit-detail-v audit-detail-mono">{entry.user_id}</dd>
            </div>
          </dl>
        </div>

        <div className="audit-detail-section">
          <h3 className="audit-detail-h3">Record</h3>
          <dl className="audit-detail-dl">
            <div className="audit-detail-kv">
              <dt className="audit-detail-k">Entry ID</dt>
              <dd className="audit-detail-v audit-detail-mono">{entry.id}</dd>
            </div>
            <div className="audit-detail-kv">
              <dt className="audit-detail-k">Action key</dt>
              <dd className="audit-detail-v audit-detail-mono">{entry.action}</dd>
            </div>
            <div className="audit-detail-kv">
              <dt className="audit-detail-k">Guild ID</dt>
              <dd className="audit-detail-v audit-detail-mono">{entry.guild_id || guildId}</dd>
            </div>
          </dl>
        </div>

        {detailRows.length > 0 && (
          <div className="audit-detail-section">
            <h3 className="audit-detail-h3">Payload</h3>
            <dl className="audit-detail-dl audit-detail-dl-stack">{detailRows}</dl>
          </div>
        )}
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default function AuditLogSettings({ guildId }: { guildId: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AuditEntry | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/settings/${guildId}/audit?limit=80`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load audit log')
        return r.json()
      })
      .then((data) => {
        const list = Array.isArray(data.entries) ? data.entries : []
        setEntries(
          list.map((e: AuditEntry) => ({
            ...e,
            guild_id: e.guild_id ?? guildId,
          }))
        )
        setUnavailable(Boolean(data.unavailable))
      })
      .catch(() => setError('Could not load audit log'))
      .finally(() => setLoading(false))
  }, [guildId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <div className="settings-loading">Loading audit log…</div>
  }

  return (
    <div className="audit-log-settings">
      <div className="settings-field">
        <label className="settings-label">Recent activity</label>
        <p className="settings-desc">
          Tap an entry for full timestamps, actor, and raw fields. Only changes from this dashboard
          are listed.
        </p>
        {unavailable && (
          <p className="settings-error">
            The audit log table is not available yet. Apply{' '}
            <code className="audit-log-code">sql/dashboard_audit_log.sql</code> to your database.
          </p>
        )}
        {error && <p className="settings-error">{error}</p>}
        <div className="audit-log-toolbar">
          <button type="button" className="settings-save-btn audit-log-refresh" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {entries.length === 0 && !unavailable && !error ? (
        <p className="audit-log-empty">No dashboard changes recorded yet.</p>
      ) : (
        <ul className="audit-log-list" role="list">
          {entries.map((e) => {
            const cat = categoryForAction(e.action)
            const title = titleForAction(e.action)
            const blurb = buildChangeBlurb(e.action, e.detail)
            const rel = relativeTime(e.created_at)
            const who = e.actor_username ?? e.user_id.slice(0, 8) + '…'

            return (
              <li key={e.id} className="audit-log-item-wrap">
                <button
                  type="button"
                  className="audit-log-row"
                  onClick={() => setSelected(e)}
                  aria-label={`Details: ${title}`}
                >
                  <span className="audit-log-row-main">
                    <span className="audit-log-row-top">
                      <span className="audit-log-pill">{cat}</span>
                      <span className="audit-log-row-title">{title}</span>
                    </span>
                    <span className="audit-log-row-blurb">{blurb}</span>
                  </span>
                  <span className="audit-log-row-aside">
                    <span className="audit-log-row-who">{who}</span>
                    <span className="audit-log-row-when">{rel || '—'}</span>
                    <span className="audit-log-row-chevron" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {selected && (
        <AuditDetailPopout guildId={guildId} entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
