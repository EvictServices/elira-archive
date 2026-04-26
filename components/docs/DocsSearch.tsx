'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

interface SectionResult {
  title: string
  href: string
  snippet?: string
}

interface GroupedResult {
  group: string
  pageTitle: string
  pageHref: string
  sections: SectionResult[]
}

interface FlatItem {
  type: 'page' | 'section'
  title: string
  href: string
  snippet?: string
  groupIndex: number
}

function buildFlat(groups: GroupedResult[]): FlatItem[] {
  const flat: FlatItem[] = []
  groups.forEach((g, gi) => {
    g.sections.forEach((s) =>
      flat.push({ type: 'section', title: s.title, href: s.href, snippet: s.snippet, groupIndex: gi }),
    )
  })
  return flat
}

export default function DocsSearch({ onNavigate, mobileOnly, desktopOnly }: { onNavigate?: () => void; mobileOnly?: boolean; desktopOnly?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<GroupedResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRefs = useRef<(HTMLElement | null)[]>([])
  const router = useRouter()

  const flat = buildFlat(groups)

  const openModal = useCallback(() => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 30)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
    setQuery('')
    setGroups([])
    setSelected(0)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? closeModal() : openModal()
      }
      if (e.key === 'Escape' && open) closeModal()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, openModal, closeModal])

  useEffect(() => {
    if (query.trim().length < 2) {
      setGroups([])
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/docs/search?q=${encodeURIComponent(query)}`)
        const data: GroupedResult[] = await res.json()
        setGroups(data)
        setSelected(0)
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    resultRefs.current[selected]?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  const navigate = useCallback(
    (href: string) => {
      inputRef.current?.blur()
      closeModal()
      onNavigate?.()
      router.push(href)
    },
    [router, closeModal, onNavigate],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flat.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flat[selected]) navigate(flat[selected].href)
    }
  }

  let flatIdx = -1

  const modal = open ? createPortal(
    <div className="docs-search-overlay" onMouseDown={closeModal}>
      <div
        className="docs-search-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
      >
        <div className="docs-search-modal-header">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="docs-search-modal-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="docs-search-modal-input"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
          />
          {loading && <span className="docs-search-spinner" />}
          <button className="docs-search-esc" onClick={closeModal}>
            Esc
          </button>
        </div>

        {groups.length > 0 && (
          <div className="docs-search-modal-results">
            {groups.map((group) => (
              <div key={group.pageHref} className="docs-search-group">
                <div className="docs-search-group-label">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {group.pageTitle}
                </div>
                {group.sections.map((section) => {
                  flatIdx++
                  const idx = flatIdx
                  const isSelected = selected === idx
                  return (
                    <div
                      key={section.href}
                      ref={(el) => { resultRefs.current[idx] = el }}
                      className={`docs-search-section-item${isSelected ? ' selected' : ''}`}
                      onMouseEnter={() => setSelected(idx)}
                      onClick={() => navigate(section.href)}
                    >
                      <div className="docs-search-section-body">
                        <span className="docs-search-section-title">{section.title}</span>
                        {section.snippet && (
                          <span className="docs-search-section-snippet">{section.snippet}</span>
                        )}
                      </div>
                      {isSelected ? (
                        <span className="docs-search-enter-hint">↵</span>
                      ) : (
                        <svg
                          className="docs-search-chevron"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && groups.length === 0 && (
          <div className="docs-search-no-results">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {query.length < 2 && (
          <div className="docs-search-hint">Type to search across all docs...</div>
        )}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      {mobileOnly ? (
        <button className="docs-mobile-search" onClick={openModal} aria-label="Search documentation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      ) : (
        <div className={`docs-search-trigger-wrap${desktopOnly ? ' desktop-only' : ''}`} onClick={openModal}>
          <svg
            className="docs-search-trigger-icon"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="docs-search-trigger-label">Search docs...</span>
          <kbd className="docs-search-kbd">⌘K</kbd>
        </div>
      )}

      {modal}
    </>
  )
}
