'use client'

import { useState } from 'react'
import { VARIABLES } from '@/components/embeds/lib/constants'

const PER_PAGE = 10

export default function VariablesPaginator({ onInsert }: { onInsert?: (variable: string) => void }) {
  const [tab, setTab] = useState(0)
  const [varPage, setVarPage] = useState(0)
  const current = VARIABLES[tab]
  const totalPages = Math.ceil(current.vars.length / PER_PAGE)
  const visible = current.vars.slice(varPage * PER_PAGE, (varPage + 1) * PER_PAGE)

  const switchTab = (i: number) => {
    setTab(i)
    setVarPage(0)
  }

  return (
    <div className="emb-vars">
      <div className="emb-vars-pills" role="tablist">
        {VARIABLES.map((cat, i) => (
          <button
            key={cat.category}
            type="button"
            role="tab"
            aria-selected={i === tab}
            className={`emb-pill${i === tab ? ' is-active' : ''}`}
            onClick={() => switchTab(i)}
          >
            {cat.category}
          </button>
        ))}
      </div>

      <div className="emb-vars-chips">
        {visible.map((v) => (
          <button
            key={v.name}
            type="button"
            className="emb-chip"
            title={v.desc}
            onClick={() => onInsert?.(v.name)}
          >
            <code>{v.name}</code>
          </button>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="emb-vars-pager">
          <button
            type="button"
            className="emb-vars-pager-btn"
            disabled={varPage === 0}
            onClick={() => setVarPage((p) => p - 1)}
            aria-label="Previous page"
          >
            ←
          </button>
          <span>
            {varPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="emb-vars-pager-btn"
            disabled={varPage >= totalPages - 1}
            onClick={() => setVarPage((p) => p + 1)}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  )
}
