'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { INVITE_URL, SUPPORT_URL } from '@/lib/constants'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY
      if (sy > lastScrollY.current && sy > 80 && !menuOpen) {
        setNavHidden(true)
      } else if (sy < lastScrollY.current) {
        setNavHidden(false)
      }
      lastScrollY.current = sy
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
    <nav className={`navbar${navHidden ? ' nav-hidden' : ''}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand" onClick={closeMenu}>
          <img src="/img/evict.webp" alt="evict" className="nav-avatar" />
          <span>evict</span>
        </Link>

        <div className={`nav-menu${menuOpen ? ' open' : ''}`}>
          <div className="nav-menu-section">
            <span className="nav-menu-label">Pages</span>
            <div className="nav-pill">
              <Link href="/" className={isActive('home') ? 'active' : ''} onClick={closeMenu}>Home</Link>
              <Link href="/commands" className={isActive('commands') ? 'active' : ''} onClick={closeMenu}>Commands</Link>
              <Link href="/updates" className={isActive('updates') ? 'active' : ''} onClick={closeMenu}>Updates</Link>
              <Link href="/status" className={isActive('status') ? 'active' : ''} onClick={closeMenu}>Status</Link>
            </div>
          </div>

          <div className="nav-menu-section">
            <span className="nav-menu-label">Quick Links</span>
            <div className="nav-right">
              <a href={SUPPORT_URL} target="_blank" rel="noopener" className="nav-btn nav-btn-ghost" onClick={closeMenu}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Support Server
              </a>
              <a href={INVITE_URL} target="_blank" rel="noopener" className="nav-btn nav-btn-solid" onClick={closeMenu}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add to Server
              </a>
            </div>
          </div>
        </div>

        <button
          className={`nav-hamburger${menuOpen ? ' active' : ''}`}
          aria-label="Toggle menu"
          onClick={toggleMenu}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
