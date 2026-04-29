'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { INVITE_URL, SUPPORT_URL, DOCS_URL } from '@/lib/constants'

const LINKS = [
  { label: 'Home', href: '/', key: 'home' },
  { label: 'Commands', href: '/commands', key: 'commands' },
  { label: 'Embeds', href: '/embeds', key: 'embeds' },
  { label: 'Docs', href: DOCS_URL, key: 'docs' },
  { label: 'Updates', href: '/updates', key: 'updates' },
  { label: 'Status', href: '/status', key: 'status' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY
      if (sy > lastScrollY.current && sy > 80 && !menuOpen) setNavHidden(true)
      else if (sy < lastScrollY.current) setNavHidden(false)
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

  const isActive = (key: string) =>
    key === 'home' ? pathname === '/' : pathname.startsWith('/' + key)

  if (pathname.startsWith('/docs')) return null

  return (
    <nav className={`navbar${navHidden ? ' nav-hidden' : ''}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand" onClick={closeMenu}>
          <Image src="/img/evict.webp" alt="evict" width={26} height={26} className="nav-avatar" />
          <span>evict</span>
        </Link>

        <div className="nav-links">
          {LINKS.map(({ label, href, key }) => (
            <Link
              key={key}
              href={href}
              className={`nav-link${isActive(key) ? ' active' : ''}`}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="nav-cta nav-cta-ghost">
            Support
          </a>
          <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="nav-cta">
            Add to Server
          </a>
        </div>

        <button
          className={`nav-hamburger${menuOpen ? ' active' : ''}`}
          aria-label="Toggle menu"
          onClick={toggleMenu}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="nav-mobile-links">
          {LINKS.map(({ label, href, key }) => (
            <Link
              key={key}
              href={href}
              className={`nav-mobile-link${isActive(key) ? ' active' : ''}`}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-mobile-actions">
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="nav-btn nav-btn-ghost" onClick={closeMenu}>
            Support Server
          </a>
          <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="nav-btn nav-btn-solid" onClick={closeMenu}>
            Add to Server
          </a>
        </div>
      </div>
    </nav>
  )
}
