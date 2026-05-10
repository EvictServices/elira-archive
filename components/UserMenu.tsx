'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  username: string
  avatar: string | null
}

function avatarUrl(user: User) {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`
  }
  const index = (Number(user.id) >> 22) % 6
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export default function UserMenu({
  variant = 'marketing',
  onNavigate,
}: {
  variant?: 'marketing' | 'dashboard'
  onNavigate?: () => void
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const loginClass =
    variant === 'dashboard'
      ? 'site-nav__btn site-nav__btn--ghost site-nav__btn--sm'
      : 'site-nav__btn site-nav__btn--ghost site-nav__btn--compact'

  if (loading) {
    return <div className="site-nav__user-skeleton" aria-hidden />
  }

  if (!user) {
    return (
      <a href="/api/auth/login" className={loginClass}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Login
      </a>
    )
  }

  return (
    <div className="site-nav__account" ref={ref}>
      <button
        type="button"
        className={`site-nav__account-trigger${variant === 'dashboard' ? ' site-nav__account-trigger--minimal' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.username}`}
      >
        <img src={avatarUrl(user)} alt="" className="site-nav__account-avatar" width={32} height={32} />
        {variant === 'marketing' && (
          <span className="site-nav__account-chevron" aria-hidden>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        )}
      </button>
      {open && (
        <div className="site-nav__account-menu" role="menu">
          <div className="site-nav__account-head">
            <img src={avatarUrl(user)} alt="" className="site-nav__account-head-avatar" width={36} height={36} />
            <div className="site-nav__account-head-text">
              <span className="site-nav__account-name">{user.username}</span>
              <span className="site-nav__account-hint">Signed in with Discord</span>
            </div>
          </div>
          <div className="site-nav__account-sep" />
          <Link
            href="/dashboard"
            className="site-nav__account-item"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          <a href="/api/auth/logout" className="site-nav__account-item" role="menuitem">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </a>
        </div>
      )}
    </div>
  )
}
