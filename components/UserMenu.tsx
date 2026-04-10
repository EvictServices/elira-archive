'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

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
    <Link href="/dashboard" className="nav-user">
      <img src={avatarUrl(user)} alt={user.username} className="nav-user-avatar" />
      <span className="nav-user-name">{user.username}</span>
    </Link>
  )
}
