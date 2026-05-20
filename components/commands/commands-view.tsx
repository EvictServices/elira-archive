'use client'

import { useEffect, useMemo, useState } from 'react'
import { filterCommandsCatalog, type CatalogCommand } from '@/lib/commands/catalog'
import type { Command } from '@/lib/commands/types'

function formatCategory(cat: string) {
  if (!cat) return 'Uncategorized'
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function SearchIcon() {
  return (
    <svg
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function formatUsage(signature: string, commandName: string): string {
  const sig = signature.trim()
  const name = commandName.trim()
  if (!sig || sig === name) return '—'
  if (sig.toLowerCase().startsWith(name.toLowerCase())) {
    const rest = sig.slice(name.length).trim()
    return rest || sig
  }
  return sig
}

function formatPermissions(perms: string[]): string {
  if (perms.length === 0) return 'none'
  return perms.map((p) => p.trim()).join(', ')
}

function CommandModal({
  command,
  onClose,
}: {
  command: CatalogCommand
  onClose: () => void
}) {
  const full = command as Command
  const perms = Array.isArray(full.permissions) ? (full.permissions as string[]) : []
  const aliases = full.aliases?.length ? full.aliases : []
  const signature = full.signature?.trim() || command.name
  const example = full.example?.trim()

  return (
    <div
      className="cmds-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmds-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <article className="cmds-modal" onClick={(e) => e.stopPropagation()}>
        <header className="cmds-modal-head">
          <span className="cmds-modal-cat">{(command.category || 'uncategorized').toUpperCase()}</span>
          <button type="button" className="cmds-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="cmds-modal-intro">
          <h2 id="cmds-modal-title" className="cmds-modal-name">
            {command.name}
          </h2>
          {command.description ? <p className="cmds-modal-desc">{command.description}</p> : null}
        </div>

        <div className="cmds-modal-rows">
          <div className="cmds-modal-row">
            <span className="cmds-modal-row-label">Usage</span>
            <code className="cmds-modal-row-value">{formatUsage(signature, command.name)}</code>
          </div>
          <div className="cmds-modal-row">
            <span className="cmds-modal-row-label">Permissions</span>
            <span className="cmds-modal-row-value">{formatPermissions(perms)}</span>
          </div>
          {aliases.length > 0 ? (
            <div className="cmds-modal-row">
              <span className="cmds-modal-row-label">Aliases</span>
              <span className="cmds-modal-row-value">{aliases.join(', ')}</span>
            </div>
          ) : null}
          {example ? (
            <div className="cmds-modal-row">
              <span className="cmds-modal-row-label">Example</span>
              <code className="cmds-modal-row-value">{example}</code>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  )
}

interface Props {
  commands: Command[]
}

export default function CommandsView({ commands }: Props) {
  const catalog = commands as CatalogCommand[]
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [modalCmd, setModalCmd] = useState<CatalogCommand | null>(null)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of catalog) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [catalog])

  const filtered = useMemo(() => {
    let list = filterCommandsCatalog(catalog, search)
    if (category !== 'all') {
      list = list.filter((c) => c.category === category)
    }
    return list
  }, [catalog, search, category])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalCmd(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = modalCmd ? 'hidden' : ''
    document.body.style.overflow = modalCmd ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [modalCmd])

  return (
    <div className="cmds-page">
      <div className="container">
        <header className="cmds-header">
          <h1>Commands</h1>
          <p>Browse all available commands. Click on a command for detailed usage.</p>
        </header>

        <div className="cmds-toolbar">
          <label className="cmds-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search commands"
            />
          </label>

          <nav className="cmds-pills" aria-label="Categories">
            <button
              type="button"
              className={`cmds-pill${category === 'all' ? ' is-active' : ''}`}
              onClick={() => setCategory('all')}
            >
              All ({catalog.length})
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                type="button"
                className={`cmds-pill${category === cat ? ' is-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {formatCategory(cat)} ({count})
              </button>
            ))}
          </nav>
        </div>

        {filtered.length === 0 ? (
          <p className="cmds-empty">No commands match your search.</p>
        ) : (
          <div className="cmds-grid" role="list">
            {filtered.map((c) => (
              <article
                key={c.name}
                role="listitem"
                className="cmds-card"
                tabIndex={0}
                onClick={() => setModalCmd(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setModalCmd(c)
                  }
                }}
              >
                <h3 className="cmds-card-name">{c.name}</h3>
                {c.description ? <p className="cmds-card-desc">{c.description}</p> : null}
              </article>
            ))}
          </div>
        )}
      </div>

      {modalCmd ? <CommandModal command={modalCmd} onClose={() => setModalCmd(null)} /> : null}
    </div>
  )
}
