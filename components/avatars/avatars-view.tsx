'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

const PAGE_SIZE = 20

interface Avatar {
  id: number
  url: string
  created_at: number
}

interface AvatarsViewProps {
  avatars: Avatar[]
  userId: string
  username: string | null
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
  avatar: Avatar
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
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e1e1e',
          borderRadius: '13px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          maxWidth: '480px',
          width: '90vw',
          overflow: 'hidden',
          animation: 'popIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <img
            src={avatar.url}
            alt={`Avatar #${avatarId}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            ✕
          </button>
          <a
            href={avatar.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
            title="Open avatar image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </a>
        </div>
        <div style={{ padding: '1.05rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Avatar ID
            </span>
          </div>
          <span
            style={{
              display: 'block',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            #{avatarId}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Captured
            </span>
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.9rem',
            }}
          >
            {formatFullDate(avatar.created_at)} ({formatRelativeTime(avatar.created_at)})
          </span>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function AvatarsView({ avatars, userId, username }: AvatarsViewProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleAvatars = useMemo(() => avatars.slice(0, visibleCount), [avatars, visibleCount])
  const hasMore = visibleCount < avatars.length

  return (
    <div className="avatars-page doc-page">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }} data-reveal>
          <h2 className="section-title">
            {username ? `${username}'s Avatar History` : 'Avatar History'}
          </h2>
          <p className="section-desc" style={{ margin: 0 }}>
            {avatars.length} avatar{avatars.length !== 1 ? 's' : ''} • User ID: {userId}
            {hasMore && ` • Showing ${visibleCount} of ${avatars.length}`}
          </p>
        </div>

        <div className="avatars-grid" data-reveal>
          {visibleAvatars.map((avatar, idx) => {
            return (
              <div
                key={`${avatar.url}-${idx}`}
                className="avatar-card"
                onClick={() => setSelectedAvatar(avatar)}
                title={formatFullDate(avatar.created_at)}
              >
                <div className="avatar-card-media">
                  <img
                    src={avatar.url}
                    alt={`Avatar from ${formatFullDate(avatar.created_at)}`}
                    loading="lazy"
                  />
                </div>
                <div className="avatar-card-foot">
                  <span className="avatar-card-id">#{avatar.id}</span>
                  <span className="avatar-card-date">{formatFullDate(avatar.created_at)}</span>
                </div>
              </div>
            )
          })}
        </div>
        {hasMore && (
          <div className="avatars-load-more">
            <button
              type="button"
              className="avatars-load-more-btn"
              onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, avatars.length))}
            >
              Load More ({Math.min(PAGE_SIZE, avatars.length - visibleCount)} remaining)
            </button>
          </div>
        )}      </div>

      {selectedAvatar && (
        <AvatarPopout
          avatar={selectedAvatar}
          avatarId={selectedAvatar.id}
          onClose={() => setSelectedAvatar(null)}
        />
      )}
    </div>
  )
}
