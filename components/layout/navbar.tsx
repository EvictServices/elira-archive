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
  const [menuOpen, setMenuOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY
      if (sy > lastScrollY.current && sy > 96 && !menuOpen) {
        setNavHidden(true)
      } else if (sy < lastScrollY.current) {
        setNavHidden(false)
      }
      lastScrollY.current = sy
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    document.body.classList.remove('nav-open')
  }

  const toggleMenu = () => {
    const next = !menuOpen
    setMenuOpen(next)
    document.body.classList.toggle('nav-open', next)
  }

  const isActive = (page: string) =>
    page === 'home' ? pathname === '/' : pathname.startsWith('/' + page)

  return (
    <header
      className={[
        'site-nav',
        'site-nav--float',
        navHidden ? 'site-nav--hidden' : '',
        menuOpen ? 'site-nav--menu-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="banner"
    >
      <div className="site-nav__float">
        <div className="site-nav__dock">
          <BrandMark onNavigate={closeMenu} />

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
              <UserMenu variant="marketing" onNavigate={closeMenu} />
            </div>
            <button
              type="button"
              className={`site-nav__menu-btn${menuOpen ? ' is-open' : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="site-nav-mobile-menu"
              onClick={toggleMenu}
            >
              <span className="site-nav__menu-bars" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        <div
          id="site-nav-mobile-menu"
          className={`site-nav__mobile-menu${menuOpen ? ' is-open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <nav className="site-nav__mobile-links" aria-label="Mobile navigation">
            {PAGES.map(({ href, page, label }) => (
              <Link
                key={page}
                href={href}
                className={`site-nav__mobile-link${isActive(page) ? ' is-active' : ''}`}
                onClick={closeMenu}
                aria-current={isActive(page) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="site-nav__mobile-actions">
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav__btn site-nav__btn--outline"
              onClick={closeMenu}
            >
              Documentation
            </a>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav__btn site-nav__btn--outline"
              onClick={closeMenu}
            >
              Support
            </a>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav__btn site-nav__btn--primary"
              onClick={closeMenu}
            >
              Add to Server
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
