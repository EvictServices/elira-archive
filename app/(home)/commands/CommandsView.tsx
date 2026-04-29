'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animateCounter } from '@/lib/animateCounter'

export interface Command {
  name: string
  description: string
  category: string
  aliases: string[]
  signature: string
  permissions: unknown
  example: string
}

function fmtPermissions(permissions: unknown): string {
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) return 'none'
  return permissions
    .flatMap((p) => (typeof p === 'string' ? [p] : typeof p === 'object' && p ? Object.keys(p) : []))
    .map((s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(', ')
}

export default function CommandsView() {
  const [allCommands, setAllCommands] = useState<Command[]>([])
  const [filtered, setFiltered] = useState<Command[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [gridKey, setGridKey] = useState(0)
  const [modalCmd, setModalCmd] = useState<Command | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [displayCounts, setDisplayCounts] = useState<Record<string, string>>({})
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/commands')
      .then(r => r.ok ? r.json() : { data: { commands: {} } })
      .then(parsed => {
        const payload: unknown = parsed?.data?.commands ?? parsed?.commands ?? parsed ?? []
        const rawCmds: Command[] = []

        // New layout: [{ category: string, commands: Command[] }]
        if (Array.isArray(payload)) {
          payload.forEach((group: unknown) => {
            if (!group || typeof group !== 'object') return
            const category = typeof (group as { category?: unknown }).category === 'string'
              ? (group as { category: string }).category
              : 'Uncategorized'
            const cmds = (group as { commands?: unknown }).commands
            if (!Array.isArray(cmds)) return
            cmds.forEach((cmd: unknown) => {
              rawCmds.push({ ...(cmd as object), category } as Command)
            })
          })
        }

        // Legacy layout: { [category]: Command[] }
        if (typeof payload === 'object' && payload && !Array.isArray(payload)) {
          Object.entries(payload as Record<string, unknown[]>).forEach(([category, cmds]) => {
            if (!Array.isArray(cmds)) return
            cmds.forEach((cmd: unknown) => {
              rawCmds.push({ ...(cmd as object), category } as Command)
            })
          })
        }
        const seen = new Set<string>()
        const cmds = rawCmds
          .filter((c) => !(c as { hidden?: boolean }).hidden && (c.category || '').toLowerCase() !== 'jishaku' && c.name !== 'help')
          .map((c, i) => ({
            name: (c as { qualified_name?: string }).qualified_name || c.name || `cmd${i}`,
            description: c.description || (c as { help?: string }).help || '',
            category: c.category || 'Uncategorized',
            aliases: c.aliases || [],
            signature: c.signature || '',
            permissions: c.permissions || [],
            example: c.example || '',
          } as Command))
          .filter((c) => { if (seen.has(c.name)) return false; seen.add(c.name); return true })

        const cats = [...new Set(cmds.map((c) => c.category))].sort()
        const counts: Record<string, number> = {}
        cmds.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1 })

        setAllCommands(cmds)
        setFiltered(cmds)
        setCategories(cats)
        setLoading(false)
        setGridKey((k) => k + 1)

        const dur = 900
        animateCounter((v) => setDisplayCounts((prev) => ({ ...prev, all: v })), cmds.length, dur)
        cats.forEach((cat) => {
          animateCounter((v) => setDisplayCounts((prev) => ({ ...prev, [cat]: v })), counts[cat] ?? 0, dur)
        })
      })
      .catch(() => setLoading(false))
  }, [])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allCommands.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1 })
    return counts
  }, [allCommands])

  const applyFilter = useCallback(
    (q: string, cat: string, cmds: Command[]) => {
      const ql = q.toLowerCase()
      return cmds.filter((c) => {
        const matchQ = c.name.toLowerCase().includes(ql) || c.description.toLowerCase().includes(ql)
        const matchCat = cat === 'all' || c.category === cat
        return matchQ && matchCat
      })
    },
    []
  )

  useEffect(() => {
    setFiltered(applyFilter(search, activeCategory, allCommands))
  }, [search, activeCategory, allCommands, applyFilter])

  function switchCategory(cat: string) {
    if (cat === activeCategory) return
    setActiveCategory(cat)
    setFiltered(applyFilter(search, cat, allCommands))
    setGridKey((k) => k + 1)
  }

  async function copyCmd(name: string) {
    try {
      await navigator.clipboard.writeText(name)
      setCopied(name)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  function openModal(c: Command) { setModalCmd(c) }
  function closeModal() { setModalCmd(null) }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = modalCmd ? 'hidden' : ''
    document.body.style.overflow = modalCmd ? 'hidden' : ''
  }, [modalCmd])

  const perms = modalCmd ? fmtPermissions(modalCmd.permissions) : 'none'
  const permsList =
    perms !== 'none'
      ? perms.split(',').map((p) => (
          <span key={p} className="cmd-perm-pill">{p.trim()}</span>
        ))
      : <span className="cmd-perm-none">none</span>

  return (
    <>
      <div className="commands-wrap" style={{ background: '#1a1a1a', minHeight: '100vh' }}>
        <div className="container">
          <div className="commands-page-header" data-reveal>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
              <h2 className="section-title">Commands</h2>
              <p className="section-desc" style={{ margin: 0 }}>
                Browse all available commands. Click on a command for detailed usage.
              </p>
            </div>
          </div>

          <div className="commands-toolbar" data-reveal>
            <div className="commands-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="commands-search"
                ref={searchRef}
                type="text"
                placeholder="Search commands…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="commands-filters" id="commands-filters">
              <button
                className={`filter-btn${activeCategory === 'all' ? ' active' : ''}`}
                onClick={() => switchCategory('all')}
              >
                All <span className="filter-count">({displayCounts['all'] ?? allCommands.length})</span>
              </button>
              {categories.map((cat) => {
                return (
                  <button
                    key={cat}
                    className={`filter-btn${activeCategory === cat ? ' active' : ''}`}
                    onClick={() => switchCategory(cat)}
                  >
                    {cat[0].toUpperCase() + cat.slice(1)} <span className="filter-count">({displayCounts[cat] ?? categoryCounts[cat] ?? 0})</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div key={gridKey} className="commands-grid" id="commands-grid" data-reveal>
            {loading ? (
              Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="command-card-skeleton">
                  <div className="skeleton-line" style={{ height: '14px', width: `${45 + (i * 37) % 35}%` }} />
                  <div className="skeleton-line" style={{ height: '12px', width: `${60 + (i * 23) % 30}%`, opacity: 0.5 }} />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="commands-empty">No commands found.</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.name}
                  className="command-card"
                  onClick={() => openModal(c)}
                >
                  <div className="command-top">
                    <span className="command-name">{c.name}</span>
                    <button
                      className={`cmd-copy${copied === c.name ? ' copied' : ''}`}
                      title="Copy command"
                      aria-label="Copy command"
                      onClick={(e) => { e.stopPropagation(); copyCmd(c.name) }}
                    >
                      <svg className="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <svg className="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="command-desc">{c.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalCmd && (
        <div
          className="cmd-modal-overlay open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="cmd-modal">
            <div className="cmd-modal-head">
              <span className="cmd-modal-title">{modalCmd.category || 'General'}</span>
              <span className="cmd-modal-x" role="button" tabIndex={0} onClick={closeModal}>&times;</span>
            </div>
            <div className="cmd-modal-body">
              <div className="cmd-hero">
                <span className="cmd-name">{modalCmd.name}</span>
              </div>
              <p className="cmd-desc">{modalCmd.description}</p>
              <div className="cmd-details">
                <div className="cmd-row">
                  <span className="cmd-label">Usage</span>
                  <span className="cmd-mono">{modalCmd.signature || modalCmd.name}</span>
                </div>
                {modalCmd.aliases?.length > 0 && (
                  <div className="cmd-row">
                    <span className="cmd-label">Aliases</span>
                    <span className="cmd-mono">{modalCmd.aliases.join(', ')}</span>
                  </div>
                )}
                <div className="cmd-row">
                  <span className="cmd-label">Permissions</span>
                  <div className="cmd-perms">{permsList}</div>
                </div>
                {modalCmd.example && (
                  <div className="cmd-row">
                    <span className="cmd-label">Example</span>
                    <span className="cmd-mono">{modalCmd.example}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
