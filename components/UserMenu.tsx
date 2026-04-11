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

export default function UserMenu() {
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

  if (loading) return null

  if (!user) {
    return (
      <a href="/api/auth/login" className="nav-btn nav-btn-ghost">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Login
      </a>
    )
  }

  return (
    <div className="nav-user-wrapper" ref={ref}>
      <button className="nav-user-trigger" onClick={() => setOpen((v) => !v)}>
        <img src={avatarUrl(user)} alt={user.username} className="nav-user-avatar" />
      </button>
      {open && (
        <div className="nav-user-dropdown">
          <div className="nav-user-dropdown-header">
            <img src={avatarUrl(user)} alt={user.username} className="nav-user-dropdown-avatar" />
            <span className="nav-user-dropdown-name">{user.username}</span>
          </div>
          <div className="nav-user-dropdown-divider" />
          <Link href="/dashboard" className="nav-user-dropdown-item" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          <a href="/api/auth/logout" className="nav-user-dropdown-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </a>
        </div>
      )}
    </div>
  )
}
