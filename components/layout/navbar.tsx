'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { INVITE_URL, SUPPORT_URL, DOCS_URL } from '@/lib/discord/urls'
import { useDashboardGuildBreadcrumb } from '@/components/dashboard/breadcrumb-context'
import DashboardGuildSwitcher from '@/components/dashboard/guild-switcher'
import { useGuildSettingsMobileNav } from '@/components/dashboard/mobile-nav-context'
import UserMenu from '@/components/shared/user-menu'
import { routes } from '@/lib/routes'

const GUILD_SETTINGS_SCROLL_CLASS = 'guild-settings-mobile-scroll-away'

const MAIN_LINKS: { href: string; page: string; label: string; external?: boolean }[] = [
  { href: routes.home, page: 'home', label: 'Home' },
  { href: routes.commands, page: 'commands', label: 'Commands' },
  { href: routes.embeds, page: 'embeds', label: 'Embeds' },
  { href: routes.updates, page: 'updates', label: 'Updates' },
  { href: routes.status, page: 'status', label: 'Status' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  const guildMobileScrollLastY = useRef(0)
  const { mobileNavOpen: guildDrawerOpen } = useGuildSettingsMobileNav()
  const { guildName: dashboardGuildName } = useDashboardGuildBreadcrumb()

  const isDashboard = pathname.startsWith('/dashboard')

  /** Guild server settings (mobile): hide top bars on scroll down, show on scroll up / top */
  useEffect(() => {
    const isGuildSettings = /^\/dashboard\/\d+/.test(pathname)
    if (!isGuildSettings) {
      document.body.classList.remove(GUILD_SETTINGS_SCROLL_CLASS)
      return
    }

    const mq = window.matchMedia('(max-width: 1024px)')
    let raf = 0
    let ticking = false

    const apply = () => {
      ticking = false
      if (!mq.matches || guildDrawerOpen) {
        document.body.classList.remove(GUILD_SETTINGS_SCROLL_CLASS)
        guildMobileScrollLastY.current = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0)
        return
      }
      const y = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0)
      const prev = guildMobileScrollLastY.current
      const delta = y - prev

      if (y < 12) {
        document.body.classList.remove(GUILD_SETTINGS_SCROLL_CLASS)
      } else if (delta > 10 && y > 88) {
        document.body.classList.add(GUILD_SETTINGS_SCROLL_CLASS)
      } else if (delta < -10) {
        document.body.classList.remove(GUILD_SETTINGS_SCROLL_CLASS)
      }
      guildMobileScrollLastY.current = y
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = window.requestAnimationFrame(apply)
    }

    guildMobileScrollLastY.current = Math.max(
      0,
      window.scrollY || document.documentElement.scrollTop || 0
    )
    window.addEventListener('scroll', onScroll, { passive: true })
    mq.addEventListener('change', apply)
    apply()

    return () => {
      window.cancelAnimationFrame(raf)
      ticking = false
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', apply)
      document.body.classList.remove(GUILD_SETTINGS_SCROLL_CLASS)
    }
  }, [pathname, guildDrawerOpen])

  useEffect(() => {
    if (isDashboard) {
      setNavHidden(false)
      return
    }
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
  }, [menuOpen, isDashboard])

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

  if (isDashboard) {
    const isOnGuildPage = /^\/dashboard\/\d+/.test(pathname)
    return (
      <header
        className="site-nav site-nav--dashboard"
        role="banner"
      >
        <div className="site-nav__shell site-nav__shell--dashboard">
          <div className="site-nav__dash-left">
            <Link href={routes.home} className="site-nav__brand">
              <img src="/img/evict.webp" alt="" className="site-nav__logo" width={28} height={28} />
              <span className="site-nav__wordmark">evict</span>
            </Link>
            <span className="site-nav__dash-rule" aria-hidden />
            <Link
              href={routes.dashboard}
              className={`site-nav__crumb${pathname === '/dashboard' ? ' is-active' : ''}`}
            >
              Dashboard
            </Link>
            {isOnGuildPage && (
              <>
                <span className="site-nav__crumb-sep" aria-hidden>
                  /
                </span>
                <span className="site-nav__guild-crumb-row">
                  <span
                    className="site-nav__crumb site-nav__crumb--guild is-active"
                    title={dashboardGuildName ?? undefined}
                  >
                    {dashboardGuildName ?? 'Server'}
                  </span>
                  <DashboardGuildSwitcher />
                </span>
              </>
            )}
          </div>
          <div className="site-nav__dash-right">
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="site-nav__dash-link">
              Docs
            </a>
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="site-nav__dash-link">
              Support
            </a>
            <UserMenu variant="dashboard" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={`site-nav${navHidden ? ' site-nav--hidden' : ''}${menuOpen ? ' site-nav--drawer-open' : ''}`}
      role="banner"
    >
      <div className="site-nav__bar">
        <div className="site-nav__shell">
          <Link href="/" className="site-nav__brand" onClick={closeMenu}>
            <img src="/img/evict.webp" alt="" className="site-nav__logo" width={28} height={28} />
            <span className="site-nav__wordmark">evict</span>
          </Link>

          <nav
            className={`site-nav__drawer${menuOpen ? ' is-open' : ''}`}
            aria-label="Main navigation"
            id="site-nav-drawer"
          >
            <ul className="site-nav__list">
              {MAIN_LINKS.map(({ href, page, label }) => (
                <li key={page}>
                  <Link
                    href={href}
                    className={`site-nav__link${isActive(page) ? ' is-active' : ''}`}
                    onClick={closeMenu}
                    aria-current={isActive(page) ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="site-nav__item--mobile-only">
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-nav__link site-nav__link--external"
                  onClick={closeMenu}
                >
                  Docs
                </a>
              </li>
            </ul>

            <div className="site-nav__drawer-footer">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="site-nav__btn site-nav__btn--outline"
                onClick={closeMenu}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                </svg>
                Support Server
              </a>
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="site-nav__btn site-nav__btn--primary"
                onClick={closeMenu}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add to Server
              </a>
              <div className="site-nav__drawer-account">
                <UserMenu variant="marketing" onNavigate={closeMenu} />
              </div>
            </div>
          </nav>

          <div className="site-nav__desktop-cta">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav__btn site-nav__btn--outline site-nav__btn--compact"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
              </svg>
              Support
            </a>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav__btn site-nav__btn--primary site-nav__btn--compact"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add to Server
            </a>
            <UserMenu variant="marketing" />
          </div>

          <button
            type="button"
            className={`site-nav__burger${menuOpen ? ' is-active' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-nav-drawer"
            onClick={toggleMenu}
          >
            <span className="site-nav__burger-line" />
            <span className="site-nav__burger-line" />
            <span className="site-nav__burger-line" />
          </button>
        </div>
      </div>
    </header>
  )
}
