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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
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
