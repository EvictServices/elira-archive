'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { docsNav } from '@/lib/docs-nav'
import DocsSearch from '@/components/docs/DocsSearch'

export default function DocsSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="docs-mobile-bar">
        <button
          className="docs-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <DocsSearch onNavigate={() => setMobileOpen(false)} mobileOnly />
      </div>

      {mobileOpen && (
        <div className="docs-sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`docs-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="docs-sidebar-top">
          <div className="docs-sidebar-header">
            <Link href="/docs" className="docs-sidebar-brand" onClick={() => setMobileOpen(false)}>
              <Image src="/img/evict.webp" alt="evict" width={22} height={22} className="docs-sidebar-avatar" />
              <span>Evict Documentation</span>
            </Link>
          </div>

          <DocsSearch onNavigate={() => setMobileOpen(false)} desktopOnly />
        </div>

        <div className="docs-sidebar-scroll">
          <nav className="docs-nav">
            {docsNav.map((group) => (
              <div key={group.title} className="docs-nav-group">
                <span className="docs-nav-group-title">{group.title}</span>
                <ul className="docs-nav-items">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`docs-nav-item${pathname === item.href ? ' active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="docs-sidebar-footer">
          <Link href="/" className="docs-home-btn" onClick={() => setMobileOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </Link>
        </div>
      </aside>
    </>
  )
}
