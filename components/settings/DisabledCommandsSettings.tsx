'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChannelDropdown } from '@/components/settings/AnDropdowns'
import { fetchBundle } from '@/lib/bundleClient'
import { isDiscordCategoryChannel, isDiscordTextChannel } from '@/lib/guild_channel_type'
import type { GuildChannel } from '@/components/settings/types'
import PrefixSettings from './PrefixSettings'

interface DisabledGroup {
  command: string
  channel_ids: string[]
}

const MAX_VISIBLE_CHANNEL_CHIPS = 5

function ChannelOverflowDropdown({
  count,
  ids,
  nameFor,
  disabled,
  onRemoveOne,
}: {
  count: number
  ids: string[]
  nameFor: (id: string) => string | null
  disabled?: boolean
  onRemoveOne: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (count <= 0 || ids.length === 0) return null

  return (
    <div className="disabled-commands-overflow-wrap" ref={wrapRef}>
      <button
        type="button"
        className="disabled-commands-chip disabled-commands-chip--overflow disabled-commands-overflow-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Show ${count} more channels`}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        +{count}
      </button>
      {open && (
        <div className="disabled-commands-overflow-menu" role="listbox">
          {ids.map((cid) => {
            const name = nameFor(cid) ?? cid
            return (
              <div key={cid} className="disabled-commands-overflow-row" role="option">
                <span className="disabled-commands-overflow-name">#{name}</span>
                <button
                  type="button"
                  className="disabled-commands-overflow-remove"
                  aria-label={`Remove #${name}`}
                  disabled={disabled}
                  onClick={() => {
                    onRemoveOne(cid)
                    setOpen(false)
                  }}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DisabledCommandsSettings({ guildId }: { guildId: string }) {
  const [entries, setEntries] = useState<DisabledGroup[]>([])
  const [textChannels, setTextChannels] = useState<GuildChannel[]>([])
  const [allGuildChannels, setAllGuildChannels] = useState<GuildChannel[]>([])
  const [categories, setCategories] = useState<GuildChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commandDraft, setCommandDraft] = useState('')
  const [pickerChannel, setPickerChannel] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const channelById = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of allGuildChannels) {
      const id = String(c.id).trim()
      if (id) m.set(id, c.name)
    }
    return m
  }, [allGuildChannels])

  const channelLabel = (id: string) => channelById.get(String(id).trim()) ?? null

  const load = useCallback(async () => {
    setError(null)
    try {
      const [bundle, disabledRes] = await Promise.all([
        fetchBundle(guildId, ['channels']),
        fetch(`/api/settings/${guildId}/disabled-commands`),
      ])
      const raw = (bundle.channels ?? []) as GuildChannel[]
      const text = raw.filter((c) => isDiscordTextChannel(c))
      const cats = raw.filter((c) => isDiscordCategoryChannel(c))
      setTextChannels(text)
      setCategories(cats)
      setAllGuildChannels(raw)

      if (!disabledRes.ok) {
        const d = await disabledRes.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to load disabled commands')
      }
      const data = (await disabledRes.json()) as { entries: DisabledGroup[] }
      setEntries(data.entries ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [guildId])

  useEffect(() => {
    void load()
  }, [load])

  const addPickerToSelection = () => {
    if (!pickerChannel) return
    setSelectedIds((prev) => (prev.includes(pickerChannel) ? prev : [...prev, pickerChannel]))
    setPickerChannel('')
  }

  const selectAllText = () => {
    setSelectedIds(textChannels.map((c) => c.id))
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const submitDisable = async () => {
    const cmd = commandDraft.trim()
    if (!cmd || selectedIds.length === 0) {
      setError('Enter a command name and choose at least one channel.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/disabled-commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, channelIds: selectedIds }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Save failed')
        return
      }
      setEntries(data.entries ?? [])
      setCommandDraft('')
      setSelectedIds([])
    } catch {
      setError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const removeChannels = async (
    command: string,
    channelIds: string[],
    mode: 'all' | 'one' | 'purge-unknown'
  ) => {
    const key =
      mode === 'all'
        ? `${command}::all`
        : mode === 'purge-unknown'
          ? `${command}::purge-unknown`
          : `${command}::${channelIds[0]}`
    setRemoving(key)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/disabled-commands`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, channelIds }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Remove failed')
        return
      }
      setEntries(data.entries ?? [])
    } catch {
      setError('Remove failed')
    } finally {
      setRemoving(null)
    }
  }

  const selectionVisibleIds = selectedIds.slice(0, MAX_VISIBLE_CHANNEL_CHIPS)
  const selectionExtraIds = selectedIds.slice(MAX_VISIBLE_CHANNEL_CHIPS)
  const selectionExtraCount = selectionExtraIds.length

  const addRulePanel = (
    <section className="general-settings-pane general-settings-pane--add-rule">
      <label className="settings-label">Add a disable rule</label>
      <p className="settings-desc general-settings-pane-desc">
        Command name, then add one or more text channels before saving.
      </p>
      <div className="disabled-commands-add-controls">
        <div className="settings-input-row disabled-commands-command-row">
          <input
            type="text"
            className="settings-input"
            placeholder="Command name"
            value={commandDraft}
            onChange={(e) => {
              setCommandDraft(e.target.value)
              setError(null)
            }}
            disabled={saving || loading}
          />
        </div>
        <div className="disabled-commands-channel-row">
          <ChannelDropdown
            channels={textChannels}
            categories={categories}
            value={pickerChannel}
            onChange={setPickerChannel}
            placeholder="Pick a text channel"
            saving={saving}
          />
        </div>
        <div className="disabled-commands-add-actions">
          <button
            type="button"
            className="settings-save-btn"
            onClick={addPickerToSelection}
            disabled={saving || loading || !pickerChannel}
          >
            Add channel
          </button>
          <button
            type="button"
            className="settings-save-btn"
            onClick={selectAllText}
            disabled={saving || loading || textChannels.length === 0}
          >
            All text channels
          </button>
          <button
            type="button"
            className="settings-save-btn welcome-message-remove-btn"
            onClick={clearSelection}
            disabled={saving || loading || selectedIds.length === 0}
          >
            Clear selection
          </button>
        </div>
        {selectedIds.length > 0 && (
          <div className="disabled-commands-chips disabled-commands-chips--selection">
            {selectionVisibleIds.map((cid) => {
              const name = channelLabel(cid)
              if (!name) return null
              return (
                <span key={cid} className="disabled-commands-chip">
                  #{name}
                  <button
                    type="button"
                    className="disabled-commands-chip-remove"
                    aria-label="Remove from selection"
                    disabled={saving}
                    onClick={() => setSelectedIds((prev) => prev.filter((id) => id !== cid))}
                  >
                    ×
                  </button>
                </span>
              )
            })}
            <ChannelOverflowDropdown
              count={selectionExtraCount}
              ids={selectionExtraIds}
              nameFor={channelLabel}
              disabled={saving}
              onRemoveOne={(cid) => setSelectedIds((prev) => prev.filter((id) => id !== cid))}
            />
          </div>
        )}
        <div className="disabled-commands-save-row">
          <button
            type="button"
            className="settings-save-btn"
            onClick={() => void submitDisable()}
            disabled={saving || loading || !commandDraft.trim() || selectedIds.length === 0}
          >
            {saving ? 'Saving…' : 'Save disables'}
          </button>
        </div>
      </div>
    </section>
  )

  if (loading) {
    return (
      <div className="general-settings-stack">
        <div className="general-settings-top-row">
          <section className="general-settings-pane">
            <PrefixSettings guildId={guildId} />
          </section>
          {addRulePanel}
        </div>
      </div>
    )
  }

  return (
    <div className="general-settings-stack">
      <div className="general-settings-top-row">
        <section className="general-settings-pane">
          <PrefixSettings guildId={guildId} />
        </section>
        {addRulePanel}
      </div>

      <div className="settings-field disabled-commands-below">
        <label className="settings-label">Disabled commands</label>
        <p className="settings-desc">
          Choose where each command cannot be used. Members with Administrator in Discord are not
          blocked. Use each command’s qualified name (for example <code>ban</code> or{' '}
          <code>voicemaster setup</code>).
        </p>

        {error && <p className="settings-error">{error}</p>}

        {entries.length === 0 ? (
          <p className="settings-hint" style={{ marginBottom: '1rem' }}>
            No commands are disabled for this server.
          </p>
        ) : (
          <ul className="disabled-commands-list">
            {entries.map((row) => {
              const knownIds = row.channel_ids.filter((id) => channelLabel(id) != null)
              const unknownIds = row.channel_ids.filter((id) => channelLabel(id) == null)
              const visibleKnownIds = knownIds.slice(0, MAX_VISIBLE_CHANNEL_CHIPS)
              const knownExtraIds = knownIds.slice(MAX_VISIBLE_CHANNEL_CHIPS)
              const knownExtraCount = knownExtraIds.length
              return (
                <li key={row.command} className="disabled-commands-row">
                  <div className="disabled-commands-row-top">
                    <code className="disabled-commands-cmd">{row.command}</code>
                    <button
                      type="button"
                      className="disabled-commands-clear-all"
                      disabled={removing !== null}
                      onClick={() => removeChannels(row.command, row.channel_ids, 'all')}
                    >
                      {removing === `${row.command}::all` ? '…' : 'Clear all'}
                    </button>
                  </div>
                  {knownIds.length > 0 && (
                    <div className="disabled-commands-chips">
                      {visibleKnownIds.map((cid) => {
                        const name = channelLabel(cid)!
                        return (
                          <span key={cid} className="disabled-commands-chip">
                            #{name}
                            <button
                              type="button"
                              className="disabled-commands-chip-remove"
                              aria-label={`Remove #${name}`}
                              disabled={removing !== null}
                              onClick={() => removeChannels(row.command, [cid], 'one')}
                            >
                              {removing === `${row.command}::${cid}` ? '…' : '×'}
                            </button>
                          </span>
                        )
                      })}
                      <ChannelOverflowDropdown
                        count={knownExtraCount}
                        ids={knownExtraIds}
                        nameFor={channelLabel}
                        disabled={removing !== null}
                        onRemoveOne={(cid) => removeChannels(row.command, [cid], 'one')}
                      />
                    </div>
                  )}
                  {unknownIds.length > 0 && (
                    <p className="disabled-commands-stale">
                      {unknownIds.length} channel{unknownIds.length === 1 ? '' : 's'} not in this server’s channel list
                      (deleted, forum, or missing from cache).{' '}
                      <button
                        type="button"
                        className="disabled-commands-link-btn"
                        disabled={removing !== null}
                        onClick={() => removeChannels(row.command, unknownIds, 'purge-unknown')}
                      >
                        {removing === `${row.command}::purge-unknown` ? '…' : 'Remove those'}
                      </button>
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
