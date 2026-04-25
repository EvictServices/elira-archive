'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { docsNav } from '@/lib/docs-nav'

export default function DocsSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        className="docs-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Navigation
      </button>

      {mobileOpen && (
        <div className="docs-sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`docs-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="docs-sidebar-header">
          <Link href="/docs" className="docs-sidebar-brand" onClick={() => setMobileOpen(false)}>
            <Image src="/img/evict.webp" alt="evict" width={22} height={22} className="docs-sidebar-avatar" />
            <span>Evict Documentation</span>
          </Link>
        </div>

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
      </aside>
    </>
  )
}
