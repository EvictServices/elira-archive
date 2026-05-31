'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AvatarCardImage from '@/components/avatars/avatar-card-image'
import type { AvatarRecord } from '@/lib/avatars/types'
import { userAvatarUrl } from '@/lib/discord/cdn'

const PAGE_SIZE = 24

interface AvatarsViewProps {
  avatars: AvatarRecord[]
  userId: string
  username: string | null
  avatarHash?: string | null
}

function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`
  return `${Math.floor(diff / 31536000)}y ago`
}

function AvatarPopout({
  avatar,
  avatarId,
  onClose,
}: {
  avatar: AvatarRecord
  avatarId: number
  onClose: () => void
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div
      className="av-modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="av-modal">
        <div className="av-modal-head">
          <span className="av-modal-head-label">Avatar #{avatarId}</span>
          <div className="av-modal-head-actions">
            <a
              href={avatar.url}
              target="_blank"
              rel="noopener noreferrer"
              className="av-modal-icon-btn"
              title="Open image"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <button
              type="button"
              className="av-modal-icon-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="av-modal-media">
          <img src={avatar.url} alt={`Avatar #${avatarId}`} />
        </div>
        <div className="av-modal-body">
          <div className="cmd-row">
            <span className="cmd-label">Captured</span>
            <span className="cmd-mono">{formatFullDate(avatar.created_at)}</span>
          </div>
          <div className="cmd-row">
            <span className="cmd-label">Relative</span>
            <span className="cmd-mono">{formatRelativeTime(avatar.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AvatarsView({ avatars, userId, username, avatarHash }: AvatarsViewProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarRecord | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleAvatars = useMemo(() => avatars.slice(0, visibleCount), [avatars, visibleCount])
  const hasMore = visibleCount < avatars.length
  const latestAvatar = avatars[0]
  const profileUrl = userAvatarUrl(userId, avatarHash ?? null, 128)
  const title = username ? `${username}'s Avatars` : 'Avatar History'

  return (
    <>
      <div className="avatars-wrap st-wrap">
        <div className="container">
          <div className="st-header" data-reveal>
            <div className="st-header-top">
              <div className="st-header-left">
                <img
                  src={profileUrl}
                  alt=""
                  className="av-user-icon"
                  width={44}
                  height={44}
                  decoding="async"
                  fetchPriority="high"
                />
                <h1 className="st-title">{title}</h1>
              </div>
              <p className="st-subtitle">
                Past profile pictures captured and archived by Evict.
              </p>
            </div>

            <div className="st-header-stats">
              <div className="st-hstat-col">
                <div className="st-hstat">
                  <span className="st-hstat-num">{avatars.length.toLocaleString()}</span>
                  <span className="st-hstat-key">Total</span>
                </div>
                <div className="st-hstat">
                  <span className="st-hstat-num">
                    {hasMore ? visibleCount.toLocaleString() : avatars.length.toLocaleString()}
                  </span>
                  <span className="st-hstat-key">Showing</span>
                </div>
              </div>
              <div className="st-hstat-col">
                <div className="st-hstat">
                  <span className="st-hstat-num mono av-user-id">{userId}</span>
                  <span className="st-hstat-key">User ID</span>
                </div>
                <div className="st-hstat">
                  <span className="st-hstat-num">
                    {latestAvatar ? formatRelativeTime(latestAvatar.created_at) : '—'}
                  </span>
                  <span className="st-hstat-key">Latest</span>
                </div>
              </div>
            </div>
          </div>

          <div className="avatars-grid" data-reveal>
            {visibleAvatars.map((avatar, idx) => (
              <button
                key={`${avatar.url}-${idx}`}
                type="button"
                className="avatar-card"
                onClick={() => setSelectedAvatar(avatar)}
                title={formatFullDate(avatar.created_at)}
              >
                <div className="avatar-card-media">
                  <AvatarCardImage
                    url={avatar.url}
                    alt={`Avatar from ${formatFullDate(avatar.created_at)}`}
                    index={idx}
                  />
                </div>
                <div className="avatar-card-foot">
                  <span className="avatar-card-date">{formatRelativeTime(avatar.created_at)}</span>
                  <span className="avatar-card-meta">#{avatar.id}</span>
                </div>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="avatars-load-more" data-reveal>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, avatars.length))}
              >
                Load more ({Math.min(PAGE_SIZE, avatars.length - visibleCount)} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedAvatar && (
        <AvatarPopout
          avatar={selectedAvatar}
          avatarId={selectedAvatar.id}
          onClose={() => setSelectedAvatar(null)}
        />
      )}
    </>
  )
}
