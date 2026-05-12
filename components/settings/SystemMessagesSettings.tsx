'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import EmbedEditor from '@/app/(home)/embeds/components/EmbedEditor'
import EmbedPreview from '@/app/(home)/embeds/components/EmbedPreview'
import VariablesPaginator from '@/app/(home)/embeds/components/VariablesPaginator'
import Autocomplete from '@/app/(home)/embeds/components/Autocomplete'
import {
  defaultEmbed,
  generateScript,
  parseScriptToEmbed,
  type EmbedButton,
  type EmbedData,
  type EmbedField,
} from '@/app/(home)/embeds/lib/types'
import type { ParsedEmbedPatch } from '@/app/(home)/embeds/lib/parse'
import type { PreviewContext } from '@/app/(home)/embeds/lib/preview'
import { fetchBundle } from '@/lib/bundleClient'
import type { GuildChannel } from '@/components/settings/types'

type MessageKind = 'welcome' | 'boost' | 'goodbye'

interface ScriptRow {
  channel_id: string
  template: string
}

interface BoostRow extends ScriptRow {
  delete_after: number | null
}

const MAX_PER_KIND = 2

const DELETE_AFTER_RE = /\s*--delete_after\s+(\d+)\s*$/i

function extractDeleteAfter(template: string): { cleaned: string; deleteAfter: number | null } {
  const m = template.match(DELETE_AFTER_RE)
  if (!m || m.index == null) return { cleaned: template, deleteAfter: null }
  const n = parseInt(m[1], 10)
  if (!Number.isFinite(n) || n < 0) return { cleaned: template, deleteAfter: null }
  return { cleaned: template.slice(0, m.index).trimEnd(), deleteAfter: n }
}

function appendDeleteAfter(template: string, seconds: number): string {
  const base = template.replace(DELETE_AFTER_RE, '').trimEnd()
  return `${base} --delete_after ${seconds}`
}

function PencilIcon() {
  return (
    <svg
      className="system-messages-icon-svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

const KIND_CONFIG: Record<
  MessageKind,
  {
    apiPath: string
    label: string
    unavailable: string
    empty: string
    addBtn: string
    titleAdd: string
    titleEdit: string
    channelHint: string
    everyChannelHint: string
    showDeleteAfter: boolean
  }
> = {
  welcome: {
    apiPath: 'system',
    label: 'Welcome Messages',
    unavailable: 'Welcome messages are not available for this server right now.',
    empty: 'No welcome messages yet. Add one to send a message when members join.',
    addBtn: 'Add welcome message',
    titleAdd: 'Add welcome message',
    titleEdit: 'Edit welcome message',
    channelHint: 'Where this welcome is sent when someone joins.',
    everyChannelHint: 'Every text channel already has a welcome message. Remove one to add elsewhere.',
    showDeleteAfter: true,
  },
  boost: {
    apiPath: 'boost',
    label: 'Boost Messages',
    unavailable: 'Boost messages are not available for this server right now.',
    empty: 'No boost messages yet. Add one to celebrate when someone boosts the server.',
    addBtn: 'Add boost message',
    titleAdd: 'Add boost message',
    titleEdit: 'Edit boost message',
    channelHint: 'Where this message is sent when the server receives a new boost.',
    everyChannelHint: 'Every text channel already has a boost message. Remove one to add elsewhere.',
    showDeleteAfter: true,
  },
  goodbye: {
    apiPath: 'goodbye',
    label: 'Leave Messages',
    unavailable: 'Leave messages are not available for this server right now.',
    empty: 'No leave messages yet. Add one to send a message when members leave.',
    addBtn: 'Add leave message',
    titleAdd: 'Add leave message',
    titleEdit: 'Edit leave message',
    channelHint: 'Where this message is sent when someone leaves the server.',
    everyChannelHint: 'Every text channel already has a leave message. Remove one to add elsewhere.',
    showDeleteAfter: true,
  },
}

function normalizeSnowflake(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'bigint') return String(v)
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
  if (typeof v === 'string') {
    const t = v.trim()
    if (!t || t === 'null' || t === 'undefined') return ''
    return t
  }
  return String(v).trim()
}

function normalizeOptionalSnowflake(v: unknown): string | null {
  const s = normalizeSnowflake(v)
  return s || null
}

const DISCORD_CHANNEL_TYPE_BY_NAME: Record<string, number> = {
  GUILD_TEXT: 0,
  GUILD_NEWS: 5,
  ANNOUNCEMENT: 5,
  GUILD_CATEGORY: 4,
  GUILD_VOICE: 2,
  GUILD_STAGE_VOICE: 13,
  GUILD_FORUM: 15,
}

function channelTypeCode(t: number | string | undefined): number | null {
  if (t === undefined || t === null) return null
  if (typeof t === 'number' && !Number.isNaN(t)) return t
  if (typeof t === 'string') {
    if (t === 'text' || t === 'news' || t === 'category') return null
    const key = t.toUpperCase().replace(/-/g, '_')
    const mapped = DISCORD_CHANNEL_TYPE_BY_NAME[key]
    if (mapped !== undefined) return mapped
    const n = parseInt(t, 10)
    return Number.isNaN(n) ? null : n
  }
  return null
}

function parentIdFromChannelRow(o: Record<string, unknown>): string | null {
  const pick = (v: unknown): string | null => {
    if (v === undefined || v === null) return null
    if (typeof v === 'object' && v !== null && 'id' in v) {
      return normalizeOptionalSnowflake((v as { id: unknown }).id)
    }
    return normalizeOptionalSnowflake(v)
  }
  return (
    pick(o.parent_id) ??
    pick(o.parentId) ??
    pick(o.category_id) ??
    pick(o.categoryId) ??
    pick(o.parent)
  )
}

function isTextChannel(c: { type: number | string }): boolean {
  const t = c.type
  if (t === 'text' || t === 'news') return true
  const n = channelTypeCode(t)
  return n === 0 || n === 5
}

function isCategoryChannel(c: { type: number | string }): boolean {
  const t = c.type
  if (t === 'category') return true
  const n = channelTypeCode(t)
  return n === 4
}

function parseGuildChannelsFromApi(raw: unknown): GuildChannel[] {
  if (!Array.isArray(raw)) return []
  const out: GuildChannel[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const o = row as Record<string, unknown>
    const id = normalizeSnowflake(o.id)
    if (!id) continue
    const name = typeof o.name === 'string' ? o.name : String(o.name ?? '')
    const position = Number(o.position) || 0
    const parent_id = parentIdFromChannelRow(o)
    out.push({
      id,
      name,
      type: o.type as number | string,
      position,
      parent_id,
    })
  }
  return out
}

function categoryLabel(parentId: string | null, categoryById: Record<string, string>): string {
  const key = parentId ? normalizeSnowflake(parentId) : ''
  if (!key) return 'Uncategorized'
  const name = categoryById[key]
  if (name) return name
  return 'Uncategorized'
}

function WelcomeChannelDropdown({
  channels,
  value,
  onChange,
  placeholder,
  categoryById,
  disabled,
}: {
  channels: GuildChannel[]
  value: string
  onChange: (id: string) => void
  placeholder: string
  categoryById: Record<string, string>
  disabled?: boolean
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

  const empty = channels.length === 0

  return (
    <div className={`an-dropdown welcome-channel-dd${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="an-dropdown-trigger welcome-channel-dd-trigger"
        onClick={() => !disabled && !empty && setOpen(!open)}
        disabled={disabled || empty}
      >
        <span className="welcome-channel-dd-trigger-inner">
          {empty ? (
            <span className="welcome-channel-dd-placeholder">{placeholder}</span>
          ) : selected ? (
            <span className="welcome-channel-dd-row">
              <span className="welcome-channel-dd-name">#{selected.name}</span>
              <span className="welcome-channel-dd-cat">
                {categoryLabel(selected.parent_id, categoryById)}
              </span>
            </span>
          ) : (
            <span className="welcome-channel-dd-placeholder">{placeholder}</span>
          )}
        </span>
        <svg
          className="an-dropdown-chevron"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && !empty && (
        <div className="an-dropdown-menu welcome-channel-dd-menu">
          {channels.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`an-dropdown-item welcome-channel-dd-item${c.id === value ? ' active' : ''}`}
              onClick={() => {
                onChange(c.id)
                setOpen(false)
              }}
            >
              <span className="welcome-channel-dd-item-inner welcome-channel-dd-row">
                <span className="welcome-channel-dd-name">#{c.name}</span>
                <span className="welcome-channel-dd-cat">{categoryLabel(c.parent_id, categoryById)}</span>
              </span>
              {c.id === value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="welcome-channel-dd-check"
                >
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

const containerStyle = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04) inset',
}

const headerStyle = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  padding: '0.75rem 1.05rem',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const headerTitle = {
  fontWeight: 700,
  fontSize: '0.88rem',
  color: '#fff',
  letterSpacing: '-0.01em',
}

const headerSub = {
  fontSize: '0.68rem',
  color: '#626876',
  fontWeight: 500,
}

type ModalMode = 'add' | 'edit'

function ScriptEditorModal({
  open,
  mode,
  guildName,
  guildIconUrl,
  channels,
  categoryById,
  usedChannelIds,
  draftChannelId,
  setDraftChannelId,
  embed,
  saving,
  modalError,
  onClose,
  onSave,
  lastInputRef,
  handleEditorFocus,
  insertVariable,
  update,
  updateAuthor,
  updateFooter,
  addField,
  updateField,
  removeField,
  addButton,
  updateButton,
  removeButton,
  applyEmbedPatch,
  previewContext,
  titleAdd,
  titleEdit,
  channelHint,
  showDeleteAfter,
  deleteAfterDraft,
  setDeleteAfterDraft,
}: {
  open: boolean
  mode: ModalMode
  guildName: string
  guildIconUrl: string | null
  channels: GuildChannel[]
  categoryById: Record<string, string>
  usedChannelIds: Set<string>
  draftChannelId: string
  setDraftChannelId: (id: string) => void
  embed: EmbedData
  saving: boolean
  modalError: string | null
  onClose: () => void
  onSave: () => void
  lastInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  handleEditorFocus: (e: React.FocusEvent) => void
  insertVariable: (variable: string) => void
  update: <K extends keyof EmbedData>(key: K, value: EmbedData[K]) => void
  updateAuthor: (key: keyof EmbedData['author'], value: string) => void
  updateFooter: (key: keyof EmbedData['footer'], value: string) => void
  addField: () => void
  updateField: (index: number, key: keyof EmbedField, value: string | boolean) => void
  removeField: (index: number) => void
  addButton: () => void
  updateButton: (index: number, key: keyof EmbedButton, value: string | boolean) => void
  removeButton: (index: number) => void
  applyEmbedPatch: (patch: ParsedEmbedPatch) => void
  previewContext: PreviewContext
  titleAdd: string
  titleEdit: string
  channelHint: string
  showDeleteAfter: boolean
  deleteAfterDraft: string
  setDeleteAfterDraft: (s: string) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const scrollY = window.scrollY
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    }
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev.overflow
      document.body.style.position = prev.position
      document.body.style.top = prev.top
      document.body.style.left = prev.left
      document.body.style.right = prev.right
      document.body.style.width = prev.width
      window.scrollTo(0, scrollY)
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  const freeChannels = channels.filter((c) => !usedChannelIds.has(c.id))
  const dropdownChannels =
    mode === 'edit'
      ? channels.filter((c) => !usedChannelIds.has(c.id) || c.id === draftChannelId)
      : freeChannels
  const previewAvatar = guildIconUrl || '/img/evict.webp'

  return createPortal(
    <>
      <Autocomplete inputRef={lastInputRef} onInsert={insertVariable} />
      <div
        className="welcome-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="welcome-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="welcome-modal-head">
            <div>
              <h2 id="welcome-modal-title" className="welcome-modal-title">
                {mode === 'add' ? titleAdd : titleEdit}
              </h2>
              <p className="welcome-modal-sub">Choose a channel, then build the message.</p>
            </div>
            <button type="button" className="welcome-modal-close" onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="welcome-modal-middle">
            <div className="welcome-modal-channel-pane">
              {modalError && <p className="settings-error welcome-modal-error">{modalError}</p>}

              <section className="welcome-modal-section" aria-labelledby="welcome-modal-channel-label">
                <h3 id="welcome-modal-channel-label" className="welcome-modal-h3">
                  Channel
                </h3>
                <p className="welcome-modal-hint">{channelHint}</p>
                <WelcomeChannelDropdown
                  channels={dropdownChannels}
                  value={draftChannelId}
                  onChange={setDraftChannelId}
                  placeholder="Select a text channel"
                  categoryById={categoryById}
                  disabled={saving}
                />
              </section>

              {showDeleteAfter && (
                <section className="welcome-modal-section" aria-labelledby="script-modal-delete-after-label">
                  <h3 id="script-modal-delete-after-label" className="welcome-modal-h3">
                    Auto-delete
                  </h3>
                  <p className="welcome-modal-hint">
                    Seconds before the message is removed. Leave empty to disable auto-delete.
                  </p>
                  <input
                    type="number"
                    min={0}
                    className="settings-input"
                    style={{ maxWidth: '12rem' }}
                    placeholder="e.g. 10"
                    value={deleteAfterDraft}
                    onChange={(e) => setDeleteAfterDraft(e.target.value)}
                    disabled={saving}
                  />
                </section>
              )}
            </div>

            <div className="welcome-modal-scroll">
            <section className="welcome-modal-section" aria-labelledby="welcome-modal-message-label">
              <h3 id="welcome-modal-message-label" className="welcome-modal-h3">
                Message
              </h3>
              <p className="welcome-modal-hint">Embed, content, variables, and buttons.</p>

              <div className="embed-grid welcome-modal-embed-grid">
                <div className="welcome-modal-embed-col">
                  <div className="embed-container" style={containerStyle}>
                    <div style={headerStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#5865f2',
                            boxShadow: '0 0 8px rgba(88,101,242,0.5)',
                          }}
                        />
                        <span style={headerTitle}>Editor</span>
                      </div>
                      <span style={headerSub}>Build message</span>
                    </div>
                    <div
                      style={{
                        padding: '1.1rem',
                        maxHeight: 'min(45vh, 420px)',
                        overflowY: 'auto',
                        overscrollBehavior: 'contain',
                        touchAction: 'pan-y',
                      }}
                      onFocusCapture={handleEditorFocus}
                    >
                      <EmbedEditor
                        data={embed}
                        update={update}
                        updateAuthor={updateAuthor}
                        updateFooter={updateFooter}
                        addField={addField}
                        updateField={updateField}
                        removeField={removeField}
                        addButton={addButton}
                        updateButton={updateButton}
                        removeButton={removeButton}
                        applyEmbedPatch={applyEmbedPatch}
                      />
                    </div>
                  </div>

                  <div className="embed-container" style={containerStyle}>
                    <div style={headerStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#faa61a',
                            boxShadow: '0 0 8px rgba(250,166,26,0.4)',
                          }}
                        />
                        <span style={headerTitle}>Variables</span>
                      </div>
                      <span style={headerSub}>Insert at cursor</span>
                    </div>
                    <div style={{ padding: '0.9rem' }}>
                      <VariablesPaginator onInsert={insertVariable} />
                    </div>
                  </div>
                </div>

                <div className="embed-grid-right welcome-modal-embed-col">
                  <div
                    className="embed-container"
                    style={{ ...containerStyle, background: '#313338', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      style={{
                        ...headerStyle,
                        background: 'linear-gradient(135deg, rgba(88,101,242,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#57f287',
                            boxShadow: '0 0 8px rgba(87,242,135,0.5)',
                          }}
                        />
                        <span style={headerTitle}>Preview</span>
                      </div>
                      <span style={headerSub}>Approximate layout</span>
                    </div>
                    <div style={{ padding: '0.9rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <img
                          src={previewAvatar}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{guildName}</span>
                            <span
                              style={{
                                background: '#5865f2',
                                color: '#fff',
                                fontSize: '0.6rem',
                                padding: '0.1rem 0.3rem',
                                borderRadius: '3px',
                                fontWeight: 600,
                              }}
                            >
                              APP
                            </span>
                            {timeStr && (
                              <span style={{ color: '#a3a6aa', fontSize: '0.7rem' }}>Today at {timeStr}</span>
                            )}
                          </div>
                          <EmbedPreview data={embed} context={previewContext} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="embed-container" style={containerStyle}>
                    <div style={headerStyle}>
                      <span style={headerTitle}>Stored script</span>
                      <span style={headerSub}>Saved format</span>
                    </div>
                    <div style={{ padding: '0.9rem' }}>
                      <pre className="welcome-script-pre welcome-modal-script-pre">
                        {(() => {
                          let s = generateScript(embed)
                          if (s && showDeleteAfter && deleteAfterDraft.trim() !== '') {
                            const n = parseInt(deleteAfterDraft.trim(), 10)
                            if (Number.isFinite(n) && n >= 0) {
                              s = appendDeleteAfter(s, n)
                            }
                          }
                          return s || '// Empty — add content or embed fields'
                        })()}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </div>
          </div>

          <div className="welcome-modal-footer">
            <button type="button" className="welcome-modal-btn ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="button"
              className="welcome-modal-btn primary"
              disabled={saving || !draftChannelId}
              onClick={onSave}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

function rowsForKind(kind: MessageKind, welcome: ScriptRow[], boost: BoostRow[], goodbye: ScriptRow[]): ScriptRow[] {
  if (kind === 'welcome') return welcome
  if (kind === 'goodbye') return goodbye
  return boost
}

interface SystemMessagesUser {
  id: string
  username: string
  display_name?: string | null
  avatar_url: string
}

export default function SystemMessagesSettings({
  guildId,
  guildName,
  guildIconUrl,
  guildBannerUrl,
  user,
}: {
  guildId: string
  guildName: string
  guildIconUrl: string | null
  guildBannerUrl?: string | null
  user?: SystemMessagesUser
}) {
  const previewContext: PreviewContext = {
    user: user
      ? {
          id: user.id,
          name: user.username,
          display_name: user.display_name || user.username,
          avatar_url: user.avatar_url,
        }
      : undefined,
    moderator: user
      ? {
          id: user.id,
          name: user.username,
          display_name: user.display_name || user.username,
          avatar_url: user.avatar_url,
        }
      : undefined,
    guild: {
      id: guildId,
      name: guildName,
      icon_url: guildIconUrl,
      banner_url: guildBannerUrl ?? null,
    },
  }

  const [messagesWelcome, setMessagesWelcome] = useState<ScriptRow[]>([])
  const [messagesBoost, setMessagesBoost] = useState<BoostRow[]>([])
  const [messagesGoodbye, setMessagesGoodbye] = useState<ScriptRow[]>([])
  const [channels, setChannels] = useState<GuildChannel[]>([])
  const [categoryById, setCategoryById] = useState<Record<string, string>>({})
  const [unavailable, setUnavailable] = useState<Partial<Record<MessageKind, boolean>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalKind, setModalKind] = useState<MessageKind>('welcome')
  const [modalMode, setModalMode] = useState<ModalMode>('add')
  const [draftChannelId, setDraftChannelId] = useState('')
  const [editSourceChannelId, setEditSourceChannelId] = useState<string | null>(null)
  const [embed, setEmbed] = useState<EmbedData>(defaultEmbed)
  const [deleteAfterDraft, setDeleteAfterDraft] = useState('')

  const lastInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const setMessagesForKind = useCallback((kind: MessageKind, list: ScriptRow[] | BoostRow[]) => {
    if (kind === 'welcome') setMessagesWelcome(list as ScriptRow[])
    else if (kind === 'boost') setMessagesBoost(list as BoostRow[])
    else setMessagesGoodbye(list as ScriptRow[])
  }, [])

  const load = useCallback((isCancelled?: () => boolean) => {
    setLoading(true)
    setError(null)
    fetchBundle(guildId, ['system', 'boost', 'goodbye', 'channels'])
      .then((data) => {
        if (isCancelled?.()) return
        const w = (data.system ?? {}) as { messages?: unknown; unavailable?: boolean }
        const b = (data.boost ?? {}) as { messages?: unknown; unavailable?: boolean }
        const g = (data.goodbye ?? {}) as { messages?: unknown; unavailable?: boolean }
        const raw = data.channels ?? []
        const listW: ScriptRow[] = Array.isArray(w.messages) ? (w.messages as ScriptRow[]) : []
        const listB: BoostRow[] = Array.isArray(b.messages)
          ? (b.messages as Record<string, unknown>[]).map((m) => ({
              channel_id: String(m.channel_id ?? ''),
              template: String(m.template ?? ''),
              delete_after: m.delete_after != null ? Number(m.delete_after) : null,
            }))
          : []
        const listG: ScriptRow[] = Array.isArray(g.messages) ? (g.messages as ScriptRow[]) : []
        const all = parseGuildChannelsFromApi(raw)
        const cats: Record<string, string> = {}
        for (const c of all) {
          if (isCategoryChannel(c)) cats[normalizeSnowflake(c.id)] = c.name
        }
        const textList = all.filter(isTextChannel).sort((a, b) => a.position - b.position)
        setMessagesWelcome(listW)
        setMessagesBoost(listB)
        setMessagesGoodbye(listG)
        setUnavailable({
          welcome: Boolean(w.unavailable),
          boost: Boolean(b.unavailable),
          goodbye: Boolean(g.unavailable),
        })
        setCategoryById(cats)
        setChannels(textList)
      })
      .catch(() => {
        if (isCancelled?.()) return
        setError('Failed to load system messages')
      })
      .finally(() => {
        if (isCancelled?.()) return
        setLoading(false)
      })
  }, [guildId])

  useEffect(() => {
    let cancelled = false
    load(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [load])

  const channelName = (id: string) => channels.find((c) => c.id === id)?.name ?? id

  const openAdd = (kind: MessageKind) => {
    const rows = rowsForKind(kind, messagesWelcome, messagesBoost, messagesGoodbye)
    const usedIds = new Set(rows.map((m) => m.channel_id))
    const freeChannels = channels.filter((c) => !usedIds.has(c.id))
    setModalKind(kind)
    setModalMode('add')
    setEditSourceChannelId(null)
    setModalError(null)
    setEmbed(defaultEmbed())
    setDeleteAfterDraft('')
    setDraftChannelId(freeChannels[0]?.id ?? '')
    setModalOpen(true)
  }

  const openEdit = (kind: MessageKind, row: ScriptRow) => {
    setModalKind(kind)
    setModalMode('edit')
    setEditSourceChannelId(row.channel_id)
    setModalError(null)
    setDraftChannelId(row.channel_id)
    const { cleaned, deleteAfter } = extractDeleteAfter(row.template)
    setEmbed(parseScriptToEmbed(cleaned))
    setDeleteAfterDraft(deleteAfter != null ? String(deleteAfter) : '')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalError(null)
    setEditSourceChannelId(null)
    setDeleteAfterDraft('')
  }

  const handleEditorFocus = useCallback((e: React.FocusEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      lastInputRef.current = target as HTMLInputElement | HTMLTextAreaElement
    }
  }, [])

  const insertVariable = useCallback((variable: string) => {
    const el = lastInputRef.current
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const newValue = el.value.slice(0, start) + variable + el.value.slice(end)
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
    if (setter) {
      setter.call(el, newValue)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    el.focus()
    const cursor = start + variable.length
    el.setSelectionRange(cursor, cursor)
  }, [])

  const update = useCallback(<K extends keyof EmbedData>(key: K, value: EmbedData[K]) => {
    setEmbed((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateAuthor = useCallback((key: keyof EmbedData['author'], value: string) => {
    setEmbed((prev) => ({ ...prev, author: { ...prev.author, [key]: value } }))
  }, [])

  const updateFooter = useCallback((key: keyof EmbedData['footer'], value: string) => {
    setEmbed((prev) => ({ ...prev, footer: { ...prev.footer, [key]: value } }))
  }, [])

  const addField = useCallback(() => {
    setEmbed((prev) => ({ ...prev, fields: [...prev.fields, { name: '', value: '', inline: false }] }))
  }, [])

  const updateField = useCallback((index: number, key: keyof EmbedField, value: string | boolean) => {
    setEmbed((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, [key]: value } : f)),
    }))
  }, [])

  const removeField = useCallback((index: number) => {
    setEmbed((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }))
  }, [])

  const addButton = useCallback(() => {
    setEmbed((prev) => ({
      ...prev,
      buttons: [...prev.buttons, { style: 'link', label: '', url: '', emoji: '', disabled: false }],
    }))
  }, [])

  const updateButton = useCallback((index: number, key: keyof EmbedButton, value: string | boolean) => {
    setEmbed((prev) => ({
      ...prev,
      buttons: prev.buttons.map((b, i) => (i === index ? { ...b, [key]: value } : b)),
    }))
  }, [])

  const removeButton = useCallback((index: number) => {
    setEmbed((prev) => ({ ...prev, buttons: prev.buttons.filter((_, i) => i !== index) }))
  }, [])

  const applyEmbedPatch = useCallback((patch: ParsedEmbedPatch) => {
    setEmbed((prev) => {
      const next: EmbedData = { ...prev }
      if (patch.content !== undefined) next.content = patch.content
      if (patch.color !== undefined) next.color = patch.color
      if (patch.url !== undefined) next.url = patch.url
      if (patch.title !== undefined) next.title = patch.title
      if (patch.description !== undefined) next.description = patch.description
      if (patch.thumbnail !== undefined) next.thumbnail = patch.thumbnail
      if (patch.image !== undefined) next.image = patch.image
      if (patch.timestamp !== undefined) next.timestamp = patch.timestamp
      if (patch.footer) next.footer = patch.footer
      if (patch.author) next.author = patch.author
      if (patch.addFields?.length) next.fields = [...prev.fields, ...patch.addFields]
      if (patch.addButtons?.length) next.buttons = [...prev.buttons, ...patch.addButtons]
      return next
    })
  }, [])

  const saveModal = async () => {
    const cfg = KIND_CONFIG[modalKind]
    if (!draftChannelId) {
      setModalError('Select a channel.')
      return
    }
    const rows = rowsForKind(modalKind, messagesWelcome, messagesBoost, messagesGoodbye)
    if (modalMode === 'add') {
      const isNew = !rows.some((m) => m.channel_id === draftChannelId)
      if (isNew && rows.length >= MAX_PER_KIND) {
        setModalError(`You can only have ${MAX_PER_KIND} messages for this type. Remove one first.`)
        return
      }
    }
    let template = generateScript(embed)
    if (cfg.showDeleteAfter && deleteAfterDraft.trim() !== '') {
      const n = parseInt(deleteAfterDraft.trim(), 10)
      if (Number.isNaN(n) || n < 0) {
        setModalError('Auto-delete must be a non-negative number.')
        return
      }
      template = appendDeleteAfter(template, n)
    }

    setSaving(true)
    setModalError(null)
    try {
      const body: Record<string, unknown> = { channel_id: draftChannelId, template }
      if (modalMode === 'edit' && editSourceChannelId && editSourceChannelId !== draftChannelId) {
        body.from_channel_id = editSourceChannelId
      }
      const res = await fetch(`/api/settings/${guildId}/${cfg.apiPath}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setModalError(data.error || 'Failed to save')
        return
      }
      if (modalKind === 'welcome') setMessagesWelcome(data.messages ?? [])
      else if (modalKind === 'boost') {
        const raw = data.messages ?? []
        setMessagesBoost(
          Array.isArray(raw)
            ? raw.map((m: Record<string, unknown>) => ({
                channel_id: String(m.channel_id ?? ''),
                template: String(m.template ?? ''),
                delete_after: m.delete_after != null ? Number(m.delete_after) : null,
              }))
            : []
        )
      } else setMessagesGoodbye(data.messages ?? [])
      closeModal()
    } catch {
      setModalError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (kind: MessageKind, cid: string) => {
    const cfg = KIND_CONFIG[kind]
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/${cfg.apiPath}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_id: cid }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to remove')
        return
      }
      if (kind === 'boost') {
        const raw = data.messages ?? []
        setMessagesBoost(
          Array.isArray(raw)
            ? raw.map((m: Record<string, unknown>) => ({
                channel_id: String(m.channel_id ?? ''),
                template: String(m.template ?? ''),
                delete_after: m.delete_after != null ? Number(m.delete_after) : null,
              }))
            : []
        )
      } else {
        setMessagesForKind(kind, data.messages ?? [])
      }
    } catch {
      setError('Failed to remove')
    }
  }

  if (loading) {
    return <div className="settings-loading">Loading system messages…</div>
  }

  const renderSection = (kind: MessageKind) => {
    const cfg = KIND_CONFIG[kind]
    const rows = rowsForKind(kind, messagesWelcome, messagesBoost, messagesGoodbye)
    const usedIds = new Set(rows.map((m) => m.channel_id))
    const freeChannels = channels.filter((c) => !usedIds.has(c.id))
    const un = Boolean(unavailable[kind])
    const canAdd = !un && rows.length < MAX_PER_KIND && freeChannels.length > 0

    return (
      <div key={kind} className="settings-field system-messages-section">
        <div className="system-messages-section-head">
          <label className="settings-label system-messages-section-label">{cfg.label}</label>
          <button
            type="button"
            className="system-messages-icon-btn system-messages-plus-btn"
            disabled={!canAdd}
            onClick={() => openAdd(kind)}
            aria-label={cfg.addBtn}
            title={cfg.addBtn}
          >
            +
          </button>
        </div>
        {un && <p className="settings-error system-messages-section-error">{cfg.unavailable}</p>}

        {!canAdd && !un && rows.length < MAX_PER_KIND && freeChannels.length === 0 && channels.length > 0 && (
          <p className="settings-hint system-messages-section-hint">{cfg.everyChannelHint}</p>
        )}

        <div className="system-messages-section-body">
        {rows.length === 0 ? (
          <div className="an-module system-messages-placeholder-card">
            <p className="settings-desc system-messages-placeholder-text">{cfg.empty}</p>
          </div>
        ) : (
          <div className="an-modules welcome-message-modules system-messages-modules">
            {rows.map((m, i) => {
              const ch = channels.find((c) => c.id === m.channel_id)
              const templateDeleteAfter = extractDeleteAfter(m.template).deleteAfter
              const fallbackDeleteAfter =
                kind === 'boost' && 'delete_after' in m && m.delete_after != null
                  ? Number(m.delete_after)
                  : null
              const deleteAfter = templateDeleteAfter ?? fallbackDeleteAfter
              const boostMeta = deleteAfter != null ? ` · auto-delete ${deleteAfter}s` : ''
              return (
                <div
                  key={m.channel_id}
                  className="an-module welcome-message-module"
                  style={{ animationDelay: `${0.03 * (i + 1)}s` }}
                >
                  <div className="an-module-header">
                    <span className="an-module-name welcome-message-module-title">
                      <span>#{channelName(m.channel_id)}</span>
                      <span className="welcome-message-title-sep" aria-hidden>
                        ·
                      </span>
                      <span className="welcome-message-title-category">
                        {categoryLabel(ch?.parent_id ?? null, categoryById)}
                        {boostMeta && (
                          <span style={{ opacity: 0.75, fontWeight: 500 }}>{boostMeta}</span>
                        )}
                      </span>
                    </span>
                    <div className="welcome-message-module-actions">
                      <button
                        type="button"
                        className="system-messages-icon-btn system-messages-edit-btn"
                        onClick={() => openEdit(kind, m)}
                        aria-label={`Edit message for #${channelName(m.channel_id)}`}
                        title="Edit"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        className="system-messages-icon-btn system-messages-minus-btn"
                        onClick={() => void remove(kind, m.channel_id)}
                        aria-label={`Remove message for #${channelName(m.channel_id)}`}
                        title="Remove"
                      >
                        -
                      </button>
                    </div>
                  </div>
                  <span className="an-module-desc welcome-message-channel-id">{m.channel_id}</span>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>
    )
  }

  const modalCfg = KIND_CONFIG[modalKind]
  const modalRows = rowsForKind(modalKind, messagesWelcome, messagesBoost, messagesGoodbye)
  const modalUsed = new Set(modalRows.map((m) => m.channel_id))

  return (
    <div className="system-messages-stack">
      {error && <p className="settings-error">{error}</p>}
      <div className="system-messages-kinds-grid">
        {(['welcome', 'boost', 'goodbye'] as const).map(renderSection)}
      </div>

      <ScriptEditorModal
        open={modalOpen}
        mode={modalMode}
        guildName={guildName}
        guildIconUrl={guildIconUrl}
        channels={channels}
        categoryById={categoryById}
        usedChannelIds={modalUsed}
        draftChannelId={draftChannelId}
        setDraftChannelId={setDraftChannelId}
        embed={embed}
        saving={saving}
        modalError={modalError}
        onClose={closeModal}
        onSave={() => void saveModal()}
        lastInputRef={lastInputRef}
        handleEditorFocus={handleEditorFocus}
        insertVariable={insertVariable}
        update={update}
        updateAuthor={updateAuthor}
        updateFooter={updateFooter}
        addField={addField}
        updateField={updateField}
        removeField={removeField}
        addButton={addButton}
        updateButton={updateButton}
        removeButton={removeButton}
        applyEmbedPatch={applyEmbedPatch}
        previewContext={previewContext}
        titleAdd={modalCfg.titleAdd}
        titleEdit={modalCfg.titleEdit}
        channelHint={modalCfg.channelHint}
        showDeleteAfter={modalCfg.showDeleteAfter}
        deleteAfterDraft={deleteAfterDraft}
        setDeleteAfterDraft={setDeleteAfterDraft}
      />
    </div>
  )
}
