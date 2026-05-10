'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface AnGuildChannel {
  id: string
  name: string
  parent_id?: string | null
}

function categoryLookupLabel(
  parentId: string | null | undefined,
  categoryById: Map<string, string>
): string {
  if (parentId == null || parentId === '') return 'Uncategorized'
  return categoryById.get(parentId) ?? 'Uncategorized'
}

export interface AnGuildRole {
  id: string
  name: string
  color: number
}

function colorHex(color: number): string | null {
  if (!color) return null
  return `#${color.toString(16).padStart(6, '0')}`
}

export function Dropdown({
  value,
  options,
  onChange,
  saving,
  placeholder = 'Select...',
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  saving?: boolean
  placeholder?: string
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
        <span>{saving ? 'Saving...' : selected?.label ?? placeholder}</span>
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
      {open && (
        <div className="an-dropdown-menu" style={{ maxHeight: 240, overflowY: 'auto' }}>
          {options.map((opt) => (
            <button
              key={opt.value || '__empty'}
              className={`an-dropdown-item${opt.value === value ? ' active' : ''}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              type="button"
            >
              {opt.label}
              {opt.value === value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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

export function ChannelDropdown({
  channels,
  categories,
  value,
  onChange,
  placeholder = 'Select a channel',
  prefix = '#',
  saving,
  emptyOption,
}: {
  channels: AnGuildChannel[]
  /** Category channels (type 4) for resolving \`parent_id\` labels on the right. */
  categories?: AnGuildChannel[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  prefix?: string
  saving?: boolean
  /** When set, value \`""\` selects this row (e.g. transcript disabled). */
  emptyOption?: { label: string }
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = channels.find((c) => c.id === value)

  const categoryById = useMemo(() => {
    const m = new Map<string, string>()
    if (!categories?.length) return m
    for (const c of categories) {
      m.set(c.id, c.name)
    }
    return m
  }, [categories])

  const showCategoryColumn = categoryById.size > 0

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const triggerLabel = () => {
    if (saving) return <span>Saving...</span>
    if (emptyOption && value === '') {
      return <span className="an-dropdown-channel-placeholder">{emptyOption.label}</span>
    }
    if (!selected) {
      return <span className="an-dropdown-channel-placeholder">{placeholder}</span>
    }
    if (showCategoryColumn) {
      return (
        <span className="an-dropdown-channel-row an-dropdown-channel-row--trigger">
          <span className="an-dropdown-channel-name">
            {prefix}
            {selected.name}
          </span>
          <span className="an-dropdown-channel-category">
            {categoryLookupLabel(selected.parent_id, categoryById)}
          </span>
        </span>
      )
    }
    return (
      <span>
        {prefix}
        {selected.name}
      </span>
    )
  }

  return (
    <div className={`an-dropdown${open ? ' open' : ''}${saving ? ' saving' : ''}`} ref={ref}>
      <button
        className="an-dropdown-trigger an-dropdown-trigger--channel"
        onClick={() => !saving && setOpen(!open)}
        type="button"
        disabled={saving}
      >
        <span className="an-dropdown-trigger-channel-inner">{triggerLabel()}</span>
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
      {open && (
        <div className="an-dropdown-menu an-dropdown-menu--channels" style={{ maxHeight: 280, overflowY: 'auto' }}>
          {emptyOption && (
            <button
              type="button"
              className={`an-dropdown-item an-dropdown-item--channel${value === '' ? ' active' : ''}`}
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              <span className="an-dropdown-channel-name">{emptyOption.label}</span>
              {value === '' && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="an-dropdown-channel-check"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          )}
          {channels.length === 0 && (
            <div className="an-dropdown-item" style={{ opacity: 0.4, cursor: 'default' }}>
              None available
            </div>
          )}
          {channels.map((c) => (
            <button
              key={c.id}
              className={`an-dropdown-item an-dropdown-item--channel${c.id === value ? ' active' : ''}`}
              onClick={() => {
                onChange(c.id)
                setOpen(false)
              }}
              type="button"
            >
              {showCategoryColumn ? (
                <>
                  <span className="an-dropdown-channel-row an-dropdown-channel-row--menu">
                    <span className="an-dropdown-channel-name">
                      {prefix}
                      {c.name}
                    </span>
                    <span className="an-dropdown-channel-category">
                      {categoryLookupLabel(c.parent_id, categoryById)}
                    </span>
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
                      className="an-dropdown-channel-check"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </>
              ) : (
                <>
                  <span>
                    {prefix}
                    {c.name}
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
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function RoleDropdown({
  roles,
  entries,
  value,
  onChange,
  placeholder,
  saving,
}: {
  roles: AnGuildRole[]
  entries?: { role: AnGuildRole; disabled: boolean; reason?: string }[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  saving?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const items = entries ?? roles.map((role) => ({ role, disabled: false, reason: undefined }))
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
      {open && (
        <div className="an-dropdown-menu" style={{ maxHeight: 240, overflowY: 'auto' }}>
          {items.length === 0 && (
            <div className="an-dropdown-item" style={{ opacity: 0.4, cursor: 'default' }}>
              No assignable roles
            </div>
          )}
          {items.map(({ role, disabled, reason }) => {
            const hex = colorHex(role.color)
            return (
              <button
                key={role.id}
                className={`an-dropdown-item${role.id === value ? ' active' : ''}${disabled ? ' disabled' : ''}`}
                onClick={() => {
                  if (disabled) return
                  onChange(role.id)
                  setOpen(false)
                }}
                title={disabled ? reason : undefined}
                disabled={disabled}
                type="button"
              >
                <span className="autorole-role">
                  <span
                    className="autorole-role-dot"
                    style={hex ? { background: hex } : undefined}
                  />
                  {role.name}
                </span>
                {disabled && reason ? (
                  <span className="autorole-disabled-reason">{reason}</span>
                ) : role.id === value ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
