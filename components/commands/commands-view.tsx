'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import AnimatedCounter from '@/components/shared/animated-counter'
import {
  filterCommandsCatalog,
  type CatalogCommand,
} from '@/lib/commands/catalog'
import type { Command } from '@/lib/commands/types'

function formatCategory(cat: string) {
  if (!cat) return 'Uncategorized'
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function CopyButton({
  text,
  className,
  showOnHover,
}: {
  text: string
  className?: string
  showOnHover?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {
        /* ignore */
      }
    },
    [text]
  )

  return (
    <button
      type="button"
      className={`cmd-copy${copied ? ' copied' : ''}${showOnHover ? ' cmd-copy--hover' : ''}${className ? ` ${className}` : ''}`}
      title="Copy command"
      aria-label="Copy command"
      onClick={copy}
    >
      <svg
        className="copy-icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <svg
        className="check-icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  )
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
  const hasDetails = aliases.length > 0 || perms.length > 0 || Boolean(example)

  return (
    <div
      className="cmd-pop-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmd-pop-name"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <article className="cmd-pop" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-pop-top">
          <span className="cmd-pop-cat">{formatCategory(command.category)}</span>
          <button type="button" className="cmd-pop-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <h2 id="cmd-pop-name" className="cmd-pop-name">
          {command.name}
        </h2>

        {command.description ? <p className="cmd-pop-desc">{command.description}</p> : null}

        <div className="cmd-pop-usage">
          <code className="cmd-pop-signature">{signature}</code>
          <CopyButton text={signature} className="cmd-pop-copy" />
        </div>

        {hasDetails ? (
          <div className="cmd-pop-details">
            {aliases.length > 0 ? (
              <div className="cmd-pop-detail">
                <span className="cmd-pop-detail-label">Aliases</span>
                <span className="cmd-pop-detail-value">{aliases.join(', ')}</span>
              </div>
            ) : null}
            <div className="cmd-pop-detail">
              <span className="cmd-pop-detail-label">Permissions</span>
              <span className="cmd-pop-detail-value">
                {perms.length > 0 ? perms.map((p) => p.trim()).join(', ') : 'None'}
              </span>
            </div>
            {example ? (
              <div className="cmd-pop-detail">
                <span className="cmd-pop-detail-label">Example</span>
                <span className="cmd-pop-detail-value">
                  <code>{example}</code>
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

      </article>
    </div>
  )
}

interface Props {
  commands: Command[]
}

export default function CommandsView({ commands }: Props) {
  const catalog = commands as CatalogCommand[]
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [gridKey, setGridKey] = useState(0)
  const [gridEntering, setGridEntering] = useState(true)
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
    if (activeCategory !== 'all') {
      list = list.filter((c) => c.category === activeCategory)
    }
    return list
  }, [catalog, search, activeCategory])

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

  useEffect(() => {
    setGridEntering(true)
    const t = window.setTimeout(() => setGridEntering(false), 500)
    return () => window.clearTimeout(t)
  }, [gridKey, search])

  function switchCategory(cat: string) {
    if (cat === activeCategory) return
    setActiveCategory(cat)
    setGridKey((k) => k + 1)
  }

  return (
    <div className="cmd-page">
      <div className="container">
        <header className="cmd-page-head" data-reveal>
          <div className="cmd-page-intro">
            <p className="cmd-page-eyebrow">Reference</p>
            <h1 className="cmd-page-title">
              Every <span className="cmd-page-accent">command</span>, one place
            </h1>
            <p className="cmd-page-lead">
              Browse by module, search by name, and open any command for usage, aliases, and
              permissions.
            </p>
          </div>
          <p className="cmd-page-meta" aria-label="Command totals">
            <span>
              <AnimatedCounter value={catalog.length} className="cmd-page-meta-num" /> commands
            </span>
            <span className="cmd-page-meta-sep" aria-hidden>
              ·
            </span>
            <span>
              <AnimatedCounter value={categories.length} className="cmd-page-meta-num" /> categories
            </span>
          </p>
        </header>

        <div className="cmd-toolbar" data-reveal>
          <label className="cmd-search">
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
            <input
              type="search"
              placeholder="Search commands…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search commands"
            />
          </label>

          <nav className="cmd-filters" aria-label="Categories">
            <button
              type="button"
              className={`cmd-filter${activeCategory === 'all' ? ' is-active' : ''}`}
              onClick={() => switchCategory('all')}
            >
              All
              <span className="cmd-filter-count">{catalog.length}</span>
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                type="button"
                className={`cmd-filter${activeCategory === cat ? ' is-active' : ''}`}
                onClick={() => switchCategory(cat)}
              >
                {formatCategory(cat)}
                <span className="cmd-filter-count">{count}</span>
              </button>
            ))}
          </nav>
        </div>

        <div
          key={gridKey}
          className={`cmd-grid${gridEntering ? ' is-entering' : ''}`}
          role="list"
          aria-label={
            activeCategory === 'all'
              ? 'All commands'
              : `${formatCategory(activeCategory)} commands`
          }
        >
          {filtered.length === 0 ? (
            <p className="cmd-empty">No commands match your search.</p>
          ) : (
            filtered.map((c, i) => (
              <article
                key={c.name}
                role="listitem"
                className="cmd-card"
                style={
                  gridEntering && i < 18
                    ? { animationDelay: `${i * 0.035}s` }
                    : undefined
                }
                onClick={() => setModalCmd(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setModalCmd(c)
                  }
                }}
                tabIndex={0}
              >
                <div className="cmd-card-top">
                  <span className="cmd-card-cat">{formatCategory(c.category)}</span>
                  <CopyButton text={c.name} showOnHover />
                </div>
                <h3 className="cmd-card-name">{c.name}</h3>
                {c.description ? <p className="cmd-card-desc">{c.description}</p> : null}
              </article>
            ))
          )}
        </div>
      </div>

      {modalCmd ? <CommandModal command={modalCmd} onClose={() => setModalCmd(null)} /> : null}
    </div>
  )
}
