'use client'

import { useState } from 'react'
import { VARIABLES } from './constants'

export default function VariablesPaginator() {
  const [page, setPage] = useState(0)
  const current = VARIABLES[page]

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', marginBottom: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem',
      }}>
        {VARIABLES.map((cat, i) => (
          <button
            key={cat.category}
            onClick={() => setPage(i)}
            style={{
              padding: '0.4rem 0.85rem',
              background: i === page ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: i === page ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Variables Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {current.vars.map(v => (
          <span
            key={v}
            onClick={() => navigator.clipboard.writeText(v)}
            style={{
              padding: '0.25rem 0.6rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.3)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
            }}
            title="Click to copy"
          >
            {v}
          </span>
        ))}
      </div>

      {/* Page indicator */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '0.75rem', paddingTop: '0.5rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px',
            color: page === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem', cursor: page === 0 ? 'default' : 'pointer',
          }}
        >
          ← Prev
        </button>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
          {page + 1} / {VARIABLES.length}
        </span>
        <button
          onClick={() => setPage(p => Math.min(VARIABLES.length - 1, p + 1))}
          disabled={page === VARIABLES.length - 1}
          style={{
            padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px',
            color: page === VARIABLES.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem', cursor: page === VARIABLES.length - 1 ? 'default' : 'pointer',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
