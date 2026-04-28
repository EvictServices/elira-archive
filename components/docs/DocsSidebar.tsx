'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { docsNav, NavItem } from '@/lib/docs-nav'
import DocsSearch from '@/components/docs/DocsSearch'

const icons: Record<string, React.ReactNode> = {
  book: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  shield: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}

function NavItemLink({ item, pathname, depth = 0, onNavigate }: {
  item: NavItem
  pathname: string
  depth?: number
  onNavigate: () => void
}) {
  const isActive = pathname === item.href
  const hasChildren = item.items && item.items.length > 0
  const isChildActive = hasChildren && item.items!.some(child => pathname === child.href)

  return (
    <li>
      <Link
        href={item.href}
        className={`docs-nav-item${depth > 0 ? ' docs-nav-subitem' : ''}${isActive ? ' active' : ''}`}
        onClick={onNavigate}
      >
        {item.title}
      </Link>
      {hasChildren && (isActive || isChildActive) && (
        <ul className="docs-nav-subitems">
          {item.items!.map((child) => (
            <NavItemLink key={child.href} item={child} pathname={pathname} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  )
}

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
                <span className="docs-nav-group-title">
                  {group.icon && icons[group.icon] && (
                    <span className="docs-nav-group-icon">{icons[group.icon]}</span>
                  )}
                  {group.title}
                </span>
                <ul className="docs-nav-items">
                  {group.items.map((item) => (
                    <NavItemLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onNavigate={() => setMobileOpen(false)}
                    />
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
            Home
          </Link>
          <a href="https://discord.gg/evict" target="_blank" rel="noopener noreferrer" className="docs-home-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="12" r="1" />
              <circle cx="15" cy="12" r="1" />
              <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
              <path d="M7 16.5c3.5 1 6.5 1 10 0" />
              <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5" />
              <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.476-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5" />
            </svg>
            Discord
          </a>
        </div>
      </aside>
    </>
  )
}
