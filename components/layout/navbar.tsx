'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { INVITE_URL, SUPPORT_URL, DOCS_URL } from '@/lib/discord/urls'
import UserMenu from '@/components/shared/user-menu'
import { routes } from '@/lib/routes'

const PAGES: { href: string; page: string; label: string }[] = [
  { href: routes.home, page: 'home', label: 'Home' },
  { href: routes.commands, page: 'commands', label: 'Commands' },
  { href: routes.embeds, page: 'embeds', label: 'Embeds' },
  { href: routes.updates, page: 'updates', label: 'Updates' },
  { href: routes.status, page: 'status', label: 'Status' },
]

function BrandMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href={routes.home} className="site-nav__brand" onClick={onNavigate}>
      <img src="/img/evict.webp" alt="" className="site-nav__logo" width={26} height={26} />
      <span className="site-nav__wordmark">
        evict<span className="site-nav__wordmark-dot">.</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [panelOpen, setPanelOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY
      if (sy > lastScrollY.current && sy > 96 && !panelOpen) {
        setNavHidden(true)
      } else if (sy < lastScrollY.current) {
        setNavHidden(false)
      }
      lastScrollY.current = sy
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [panelOpen])

  useEffect(() => {
    if (!panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen])

  const closePanel = () => {
    setPanelOpen(false)
    document.body.classList.remove('nav-open')
  }

  const togglePanel = () => {
    if (panelOpen) closePanel()
    else {
      setPanelOpen(true)
      document.body.classList.add('nav-open')
    }
  }

  const isActive = (page: string) =>
    page === 'home' ? pathname === '/' : pathname.startsWith('/' + page)

  return (
    <header
      className={[
        'site-nav',
        'site-nav--float',
        navHidden ? 'site-nav--hidden' : '',
        panelOpen ? 'site-nav--panel-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="banner"
    >
      <div className="site-nav__float">
        <div className="site-nav__dock">
          <BrandMark onNavigate={closePanel} />

          <nav className="site-nav__pages" aria-label="Main navigation">
            {PAGES.map(({ href, page, label }) => (
              <Link
                key={page}
                href={href}
                className={`site-nav__page${isActive(page) ? ' is-active' : ''}`}
                aria-current={isActive(page) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="site-nav__dock-end">
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="site-nav__dock-link">
              Docs
            </a>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav__dock-link site-nav__dock-link--hide-sm"
            >
              Support
            </a>
            <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="site-nav__cta">
              Invite
            </a>
            <div className="site-nav__dock-user">
              <UserMenu variant="marketing" onNavigate={closePanel} />
            </div>
            <button
              type="button"
              className={`site-nav__menu-btn${panelOpen ? ' is-open' : ''}`}
              aria-label={panelOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={panelOpen}
              aria-controls="site-nav-panel"
              onClick={togglePanel}
            >
              <span className="site-nav__menu-icon" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`site-nav__scrim${panelOpen ? ' is-visible' : ''}`}
        aria-label="Close menu"
        tabIndex={panelOpen ? 0 : -1}
        onClick={closePanel}
      />

      <aside
        id="site-nav-panel"
        className={`site-nav__panel${panelOpen ? ' is-open' : ''}`}
        aria-hidden={!panelOpen}
        aria-label="Mobile navigation"
      >
        <div className="site-nav__panel-top">
          <BrandMark onNavigate={closePanel} />
          <button type="button" className="site-nav__panel-close" aria-label="Close menu" onClick={closePanel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="site-nav__panel-nav">
          {PAGES.map(({ href, page, label }) => (
            <Link
              key={page}
              href={href}
              className={`site-nav__panel-link${isActive(page) ? ' is-active' : ''}`}
              onClick={closePanel}
              aria-current={isActive(page) ? 'page' : undefined}
            >
              <span className="site-nav__panel-link-label">{label}</span>
              {isActive(page) && <span className="site-nav__panel-link-dot" aria-hidden />}
            </Link>
          ))}
        </nav>

        <div className="site-nav__panel-foot">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-nav__panel-meta"
            onClick={closePanel}
          >
            Documentation
          </a>
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-nav__btn site-nav__btn--outline"
            onClick={closePanel}
          >
            Support
          </a>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-nav__btn site-nav__btn--primary"
            onClick={closePanel}
          >
            Add to Server
          </a>
        </div>
      </aside>
    </header>
  )
}
