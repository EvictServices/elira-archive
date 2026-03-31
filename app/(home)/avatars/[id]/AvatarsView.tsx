'use client'

interface Avatar {
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

export default function AvatarsView({ avatars, userId, username }: AvatarsViewProps) {
  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }} data-reveal>
          <h2 className="section-title">
            {username ? `${username}'s Avatar History` : 'Avatar History'}
          </h2>
          <p className="section-desc" style={{ margin: 0 }}>
            {avatars.length} avatar{avatars.length !== 1 ? 's' : ''} • User ID: {userId}
          </p>
        </div>

        <div
          className="avatar-grid"
          data-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          {avatars.map((avatar, idx) => (
            <div
              key={`${avatar.url}-${idx}`}
              className="avatar-card"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onClick={() => window.open(avatar.url, '_blank')}
              title={formatFullDate(avatar.created_at)}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '100%',
                  background: 'rgba(0,0,0,0.2)',
                }}
              >
                <img
                  src={avatar.url}
                  alt={`Avatar from ${formatFullDate(avatar.created_at)}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
              </div>
              <div
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <span
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {formatFullDate(avatar.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
