'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  title: string
  href: string
  snippet: string
}

export default function DocsSearch({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/docs/search?q=${encodeURIComponent(query)}`)
        const data: SearchResult[] = await res.json()
        setResults(data)
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery('')
      onNavigate?.()
      router.push(href)
    },
    [router, onNavigate],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && selected >= 0) {
      navigate(results[selected].href)
    }
  }

  const noResults = open && query.length >= 2 && !loading && results.length === 0

  return (
    <div className="docs-search" ref={containerRef}>
      <div className="docs-search-input-wrap">
        <svg
          className="docs-search-icon"
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
        <input
          ref={inputRef}
          type="text"
          className="docs-search-input"
          placeholder="Search docs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(-1)
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search documentation"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <kbd className="docs-search-kbd">⌘K</kbd>
      </div>

      {open && results.length > 0 && (
        <ul className="docs-search-results" role="listbox">
          {results.map((result, i) => (
            <li
              key={result.href}
              className={`docs-search-result${selected === i ? ' selected' : ''}`}
              role="option"
              aria-selected={selected === i}
              onMouseEnter={() => setSelected(i)}
              onClick={() => navigate(result.href)}
            >
              <span className="docs-search-result-title">{result.title}</span>
              {result.snippet && (
                <span className="docs-search-result-snippet">{result.snippet}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {noResults && (
        <div className="docs-search-empty">No results for &ldquo;{query}&rdquo;</div>
      )}
    </div>
  )
}
