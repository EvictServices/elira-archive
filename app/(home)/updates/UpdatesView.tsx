'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { timeAgo, type Update } from '@/lib/parseYaml'

interface Props {
  updates: Update[]
  initialIndex?: number
}

export default function UpdatesView({ updates, initialIndex = 0 }: Props) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [switching, setSwitching] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  function switchTo(index: number) {
    if (index === activeIndex) return
    setSwitching(true)
    const entryNum = updates.length - index
    router.replace(`/updates/${entryNum}`, { scroll: false })
    setTimeout(() => {
      setActiveIndex(index)
      setSwitching(false)
    }, 150)
  }

  const u = updates[activeIndex]

  return (
    <div className="upd-wrap" style={{ background: '#1a1a1a', minHeight: '100vh' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }} data-reveal>
          <h2 className="section-title">Updates</h2>
          <p className="section-desc" style={{ margin: 0 }}>
            Latest changelog entries and release notes for Evict.
          </p>
        </div>

        <div className="upd-layout" data-reveal>
          <div className="upd-sidebar">
            <div className="upd-sidebar-label">Releases</div>
            <div id="updates-timeline">
              {updates.length === 0 ? (
                <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                  No updates yet.
                </div>
              ) : (
                updates.map((entry, i) => (
                  <div
                    key={i}
                    className={`timeline-entry${i === activeIndex ? ' active' : ''}`}
                    onClick={() => switchTo(i)}
                  >
                    <div className="timeline-info">
                      <span className="timeline-version">Entry {updates.length - i}</span>
                      <div className="timeline-title">{entry.title || ''}</div>
                      <div className="timeline-meta">
                        <span>{entry.date || ''}</span>
                        <span className="timeline-meta-sep">&middot;</span>
                        <span>{timeAgo(entry.date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            ref={panelRef}
            className={`upd-panel${switching ? ' switching' : ''}`}
            id="update-detail"
          >
            {!u ? (
              <div className="update-detail-empty">Select an update to view details</div>
            ) : (
              <>
                <div className="update-detail-header">
                  <span className="update-detail-version">Entry {updates.length - activeIndex}</span>
                  <h2 className="update-detail-title">{u.title || ''}</h2>
                  <p className="update-detail-date">
                    {u.date || ''}{timeAgo(u.date) ? ` — ${timeAgo(u.date)}` : ''}
                  </p>
                </div>
                <div className="update-detail-body">
                  {u.description && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.65 }}>
                      {u.description}
                    </p>
                  )}
                  {(u.sections || []).map((s, si: number) => (
                    <div key={si}>
                      <h4>{s.heading}</h4>
                      <ul>
                        {s.items.map((item, ii) => (
                          <li key={ii}>
                            <span className={`update-tag ${item.tag}`}>{item.tag}</span>
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
