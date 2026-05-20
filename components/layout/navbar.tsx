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
  const guildMobileScrollLastY = useRef(0)
  const { mobileNavOpen: guildDrawerOpen } = useGuildSettingsMobileNav()
  const { guildName: dashboardGuildName } = useDashboardGuildBreadcrumb()

  const isDashboard = pathname.startsWith('/dashboard')

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
      if (sy > lastScrollY.current && sy > 96 && !panelOpen) {
        setNavHidden(true)
      } else if (sy < lastScrollY.current) {
        setNavHidden(false)
      }
      lastScrollY.current = sy
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [panelOpen, isDashboard])

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

  const openPanel = () => {
    setPanelOpen(true)
    document.body.classList.add('nav-open')
  }

  const togglePanel = () => {
    if (panelOpen) closePanel()
    else openPanel()
  }

  const isActive = (page: string) =>
    page === 'home' ? pathname === '/' : pathname.startsWith('/' + page)

  if (isDashboard) {
    const isOnGuildPage = /^\/dashboard\/\d+/.test(pathname)
    return (
      <header className="site-nav site-nav--dashboard" role="banner">
        <div className="site-nav__bar">
          <div className="site-nav__bar-inner">
            <div className="site-nav__dash-left">
              <Link href={routes.home} className="site-nav__brand site-nav__brand--icon" title="Home">
                <img src="/img/evict.webp" alt="" className="site-nav__logo" width={22} height={22} />
              </Link>
              <nav className="site-nav__path" aria-label="Breadcrumb">
                <span className="site-nav__path-seg site-nav__path-seg--muted">evict</span>
                <span className="site-nav__path-sep" aria-hidden>
                  ›
                </span>
                <Link
                  href={routes.dashboard}
                  className={`site-nav__path-seg${pathname === '/dashboard' ? ' is-current' : ''}`}
                >
                  dashboard
                </Link>
                {isOnGuildPage && (
                  <>
                    <span className="site-nav__path-sep" aria-hidden>
                      ›
                    </span>
                    <span className="site-nav__path-guild">
                      <span
                        className="site-nav__path-seg is-current site-nav__path-seg--guild"
                        title={dashboardGuildName ?? undefined}
                      >
                        {dashboardGuildName ?? 'server'}
                      </span>
                      <DashboardGuildSwitcher />
                    </span>
                  </>
                )}
              </nav>
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
        </div>
      </header>
    )
  }

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
