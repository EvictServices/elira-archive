'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent } from 'react'
import { ChannelDropdown, RoleDropdown } from '@/components/settings/AnDropdowns'
import type { AnGuildRole } from '@/components/settings/AnDropdowns'
import EmbedScriptEditorModal from '@/components/settings/EmbedScriptEditorModal'
import { useConfirm } from '@/components/ConfirmModal'
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
import { isDiscordCategoryChannel, isDiscordTextChannel } from '@/lib/guild_channel_type'
import {
  getDangerousPermissions,
  permissionLabel,
} from '@/lib/discord/permissions'
import type { GuildChannel, GuildMemberInfo, GuildRole } from '@/components/settings/types'
import { MAX_TAG_REWARD_ROLES, type TagRewardsState, type VanityRewardsState } from '@/lib/settings/rewards_types'
import { TAG_REWARDS_DEFAULT_TEMPLATE, vanityRewardsDefaultTemplate } from '@/lib/settings/rewards_constants'

export interface RewardsSettingsUser {
  id: string
  username: string
  display_name?: string | null
  avatar_url: string
}

function rolesToAn(roles: GuildRole[]): AnGuildRole[] {
  return roles.map((r) => ({ id: r.id, name: r.name, color: r.color }))
}

function truncateOneLine(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export default function RewardsSettings({
  guildId,
  guildName,
  guildIconUrl,
  guildBannerUrl,
  vanityUrlCode,
  user,
}: {
  guildId: string
  guildName: string
  guildIconUrl: string | null
  guildBannerUrl?: string | null
  vanityUrlCode: string | null
  user: RewardsSettingsUser
}) {
  const { confirm, modal: confirmModal } = useConfirm()
  const previewContext: PreviewContext = useMemo(
    () => ({
      user: {
        id: user.id,
        name: user.username,
        display_name: user.display_name || user.username,
        avatar_url: user.avatar_url,
      },
      moderator: {
        id: user.id,
        name: user.username,
        display_name: user.display_name || user.username,
        avatar_url: user.avatar_url,
      },
      guild: {
        id: guildId,
        name: guildName,
        icon_url: guildIconUrl,
        banner_url: guildBannerUrl ?? null,
      },
    }),
    [guildId, guildName, guildIconUrl, guildBannerUrl, user]
  )

  const [tag, setTag] = useState<TagRewardsState | null>(null)
  const [vanity, setVanity] = useState<VanityRewardsState | null>(null)
  const [textChannels, setTextChannels] = useState<GuildChannel[]>([])
  const [categories, setCategories] = useState<GuildChannel[]>([])
  const [guildRoles, setGuildRoles] = useState<GuildRole[]>([])
  const [me, setMe] = useState<GuildMemberInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [tagAddRoleId, setTagAddRoleId] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingKind, setEditingKind] = useState<'tag' | 'vanity' | null>(null)
  const [embed, setEmbed] = useState<EmbedData>(defaultEmbed)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalSaving, setModalSaving] = useState(false)
  const lastInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const loadRewards = useCallback(async () => {
    const [tagRes, vanityRes] = await Promise.all([
      fetch(`/api/settings/${guildId}/rewards/tag`, { credentials: 'same-origin' }),
      fetch(`/api/settings/${guildId}/rewards/vanity`, { credentials: 'same-origin' }),
    ])
    const tagData = await tagRes.json().catch(() => ({}))
    const vanityData = await vanityRes.json().catch(() => ({}))
    if (!tagRes.ok) {
      throw new Error(typeof tagData.error === 'string' ? tagData.error : 'Failed to load tag rewards')
    }
    if (!vanityRes.ok) {
      throw new Error(
        typeof vanityData.error === 'string' ? vanityData.error : 'Failed to load vanity rewards'
      )
    }
    setTag(tagData.tag as TagRewardsState)
    setVanity(vanityData.vanity as VanityRewardsState)
  }, [guildId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([fetchBundle(guildId, ['channels', 'roles', 'me']), loadRewards()])
      .then(([bundle]) => {
        if (cancelled) return
        const all = Array.isArray(bundle.channels) ? (bundle.channels as GuildChannel[]) : []
        setTextChannels(all.filter((c) => isDiscordTextChannel(c)))
        setCategories(all.filter((c) => isDiscordCategoryChannel(c)))
        const rs = bundle.roles
        if (Array.isArray(rs)) setGuildRoles(rs as GuildRole[])
        const meData = bundle.me
        if (meData && typeof meData === 'object' && 'top_role_position' in meData) {
          setMe(meData as GuildMemberInfo)
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load rewards')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [guildId, loadRewards])

  const rolesById = useMemo(() => {
    const m = new Map<string, GuildRole>()
    for (const r of guildRoles) m.set(r.id, r)
    return m
  }, [guildRoles])

  const availableRoles = useMemo(() => guildRoles.filter((r) => !r.managed), [guildRoles])

  const roleEligibility = useCallback(
    (role: GuildRole): { ok: boolean; reason?: string } => {
      if (!me) return { ok: true }
      if (!me.is_owner && role.position >= me.top_role_position) {
        return { ok: false, reason: 'Above your highest role' }
      }
      const dangerous = getDangerousPermissions(role.permissions ?? '0')
      if (dangerous.length > 0) {
        return {
          ok: false,
          reason: `Has ${dangerous.map(permissionLabel).join(', ')}`,
        }
      }
      return { ok: true }
    },
    [me]
  )

  const assignableRoleEntries = useMemo(
    () =>
      availableRoles.map((r) => {
        const e = roleEligibility(r)
        return { role: r, disabled: !e.ok, reason: e.reason }
      }),
    [availableRoles, roleEligibility]
  )

  const anRoles = useMemo(() => rolesToAn(availableRoles), [availableRoles])

  const patchTag = async (body: Record<string, unknown>, key: string) => {
    setSaving(key)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/rewards/tag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Save failed')
        return false
      }
      setTag(data.tag as TagRewardsState)
      return true
    } catch {
      setError('Save failed')
      return false
    } finally {
      setSaving(null)
    }
  }

  const patchVanity = async (body: Record<string, unknown>, key: string) => {
    setSaving(key)
    setError(null)
    try {
      const res = await fetch(`/api/settings/${guildId}/rewards/vanity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Save failed')
        return false
      }
      setVanity(data.vanity as VanityRewardsState)
      return true
    } catch {
      setError('Save failed')
      return false
    } finally {
      setSaving(null)
    }
  }

  const openEditor = (kind: 'tag' | 'vanity') => {
    const raw = kind === 'tag' ? tag?.template ?? '' : vanity?.template ?? ''
    setEditingKind(kind)
    setModalError(null)
    try {
      setEmbed(raw.trim() ? parseScriptToEmbed(raw) : defaultEmbed)
    } catch {
      setEmbed(defaultEmbed)
    }
    setModalOpen(true)
  }

  const closeEditor = () => {
    setModalOpen(false)
    setEditingKind(null)
    setModalError(null)
  }

  const handleEditorFocus = useCallback((e: FocusEvent) => {
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
    if (!editingKind) return
    const script = generateScript(embed).trim()
    if (!script) {
      setModalError('Add message content or embed fields before saving.')
      return
    }
    setModalSaving(true)
    setModalError(null)
    const ok =
      editingKind === 'tag'
        ? await patchTag({ template: script }, 'tag-template')
        : await patchVanity({ template: script }, 'vanity-template')
    setModalSaving(false)
    if (ok) closeEditor()
    else setModalError('Save failed')
  }

  const clearTemplate = async (kind: 'tag' | 'vanity') => {
    const ok = await confirm({
      title: kind === 'tag' ? 'Reset tag notification message?' : 'Reset vanity notification message?',
      description: 'The bot will use its built-in default text for new notifications.',
      confirmLabel: 'Reset',
      destructive: true,
    })
    if (!ok) return
    if (kind === 'tag') await patchTag({ template: null }, 'tag-clear-template')
    else await patchVanity({ template: null }, 'vanity-clear-template')
  }

  const scriptEmpty = !generateScript(embed).trim()

  if (loading || !tag || !vanity) {
    return <div className="settings-loading">Loading...</div>
  }

  const tagTemplateSummary = tag.template
    ? truncateOneLine(tag.template, 72)
    : truncateOneLine(TAG_REWARDS_DEFAULT_TEMPLATE, 72)

  const vanityDefault = vanityUrlCode ? vanityRewardsDefaultTemplate(vanityUrlCode) : ''
  const vanityTemplateSummary = vanity.template
    ? truncateOneLine(vanity.template, 72)
    : vanityDefault
      ? truncateOneLine(vanityDefault, 72)
      : '—'

  return (
    <div className="rewards-settings-stack">
      {confirmModal}
      <EmbedScriptEditorModal
        open={modalOpen && editingKind != null}
        title={
          editingKind === 'tag'
            ? 'Edit tag reward notification'
            : editingKind === 'vanity'
              ? 'Edit vanity reward notification'
              : 'Edit notification'
        }
        guildName={guildName}
        guildIconUrl={guildIconUrl}
        previewContext={previewContext}
        embed={embed}
        saving={modalSaving}
        modalError={modalError}
        saveDisabled={scriptEmpty}
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
        onClose={closeEditor}
        onSave={() => void saveModal()}
      />

      {error && <p className="settings-error">{error}</p>}

      <div className="an-module enabled" style={{ animationDelay: '0.02s' }}>
        <div className="an-module-header">
          <span className="an-module-name">Guild tag rewards</span>
        </div>
        <span className="an-module-desc">
          When someone sets this server as their primary profile tag, grant roles and optionally send a
          notification (Elara <code className="prefix-settings-inline-code">tag</code> parity).
        </span>
        <div className="an-module-body rewards-module-body">
          <div className="an-edit-field">
            <label>Roles to grant</label>
            <div className="rewards-role-chips">
              {tag.role_ids.length === 0 ? (
                <span className="rewards-muted">No roles yet</span>
              ) : (
                tag.role_ids.map((rid) => {
                  const r = rolesById.get(rid)
                  return (
                    <span key={rid} className="rewards-chip">
                      <span className="autorole-role">
                        {r && (
                          <span
                            className="autorole-role-dot"
                            style={
                              r.color
                                ? { background: `#${r.color.toString(16).padStart(6, '0')}` }
                                : undefined
                            }
                          />
                        )}
                        {r?.name ?? rid}
                      </span>
                      <button
                        type="button"
                        className="system-messages-icon-btn system-messages-minus-btn"
                        aria-label={`Remove ${r?.name ?? 'role'}`}
                        disabled={Boolean(saving)}
                        onClick={() =>
                          void patchTag(
                            { role_ids: tag.role_ids.filter((x) => x !== rid) },
                            `tag-rm-${rid}`
                          )
                        }
                      >
                        −
                      </button>
                    </span>
                  )
                })
              )}
            </div>
            <div className="rewards-add-role-row">
              <RoleDropdown
                roles={anRoles}
                entries={assignableRoleEntries}
                value={tagAddRoleId}
                onChange={(id) => {
                  setTagAddRoleId('')
                  if (!id || tag.role_ids.includes(id) || tag.role_ids.length >= MAX_TAG_REWARD_ROLES) return
                  void patchTag({ role_ids: [...tag.role_ids, id] }, 'tag-add-role')
                }}
                placeholder={
                  tag.role_ids.length >= MAX_TAG_REWARD_ROLES
                    ? `Max ${MAX_TAG_REWARD_ROLES} roles`
                    : 'Add role…'
                }
                saving={Boolean(saving)}
              />
            </div>
          </div>

          <div className="an-edit-field">
            <label>Notification channel</label>
            <ChannelDropdown
              channels={textChannels}
              categories={categories}
              value={tag.channel_id ?? ''}
              onChange={(id) => void patchTag({ channel_id: id || null }, 'tag-channel')}
              placeholder="Pick a channel…"
              saving={Boolean(saving)}
            />
          </div>

          <div className="an-edit-field">
            <label>Message template</label>
            <p className="rewards-template-preview">{tagTemplateSummary}</p>
            <div className="settings-input-row rewards-template-actions">
              <button
                type="button"
                className="settings-save-btn"
                onClick={() => openEditor('tag')}
                disabled={Boolean(saving)}
              >
                Edit in builder
              </button>
              {tag.template && (
                <button
                  type="button"
                  className="settings-save-btn welcome-message-remove-btn"
                  onClick={() => void clearTemplate('tag')}
                  disabled={Boolean(saving)}
                >
                  Use default text
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`an-module enabled${!vanityUrlCode ? ' rewards-vanity-locked' : ''}`}
        style={{ animationDelay: '0.06s' }}
      >
        <div className="an-module-header">
          <span className="an-module-name">Vanity URL rewards</span>
        </div>
        <span className="an-module-desc">
          When someone puts your vanity invite in their custom status, grant a role and optionally notify a
          channel (Elara <code className="prefix-settings-inline-code">vanity</code> parity).
        </span>
        {!vanityUrlCode && (
          <p className="rewards-vanity-hint">
            This server does not have a vanity URL yet. Set one under Discord → Server Settings → Vanity URL.
          </p>
        )}
        <div className="an-module-body rewards-module-body">
          <div className="an-edit-field">
            <label>Role to grant</label>
            <RoleDropdown
              roles={anRoles}
              entries={assignableRoleEntries}
              value={vanity.role_id ?? ''}
              onChange={(id) => void patchVanity({ role_id: id || null }, 'vanity-role')}
              placeholder="Pick a role…"
              saving={Boolean(saving) || !vanityUrlCode}
            />
          </div>

          <div className="an-edit-field">
            <label>Notification channel</label>
            <ChannelDropdown
              channels={textChannels}
              categories={categories}
              value={vanity.channel_id ?? ''}
              onChange={(id) => void patchVanity({ channel_id: id || null }, 'vanity-channel')}
              placeholder="Pick a channel…"
              saving={Boolean(saving) || !vanityUrlCode}
            />
          </div>

          <div className="an-edit-field">
            <label>Message template</label>
            <p className="rewards-template-preview">{vanityTemplateSummary}</p>
            <div className="settings-input-row rewards-template-actions">
              <button
                type="button"
                className="settings-save-btn"
                onClick={() => openEditor('vanity')}
                disabled={Boolean(saving) || !vanityUrlCode}
              >
                Edit in builder
              </button>
              {vanity.template && (
                <button
                  type="button"
                  className="settings-save-btn welcome-message-remove-btn"
                  onClick={() => void clearTemplate('vanity')}
                  disabled={Boolean(saving) || !vanityUrlCode}
                >
                  Use default text
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
