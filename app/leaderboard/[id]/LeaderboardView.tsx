'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LeaderboardMember {
  user_id: string
  xp: number
  level: number
  total_xp: number
  username: string | null
  avatar: string | null
}

function getDefaultAvatar(userId: string) {
  const index = (BigInt(userId) >> BigInt(22)) % BigInt(6)
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

function getAvatarUrl(userId: string, avatar: string | null) {
  if (!avatar) return getDefaultAvatar(userId)
  const ext = avatar.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${ext}?size=64`
}

export default function LeaderboardView({
  members,
  guildId,
}: {
  members: LeaderboardMember[]
  guildId: string
}) {
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set())

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff' }}>
      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '6rem 1rem 2rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Leaderboard
        </h1>
        <p
          style={{
            color: '#888',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          Guild {guildId}
        </p>

        {members.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#666',
              padding: '4rem 0',
              fontSize: '0.95rem',
            }}
          >
            No leveling data found for this server.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {members.map((m, i) => {
              const rank = i + 1
              const avatarSrc = failedAvatars.has(m.user_id)
                ? getDefaultAvatar(m.user_id)
                : getAvatarUrl(m.user_id, m.avatar)

              return (
                <div
                  key={m.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background:
                      rank === 1
                        ? 'rgba(255,215,0,0.08)'
                        : rank === 2
                          ? 'rgba(192,192,192,0.06)'
                          : rank === 3
                            ? 'rgba(205,127,50,0.06)'
                            : 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    border:
                      rank <= 3
                        ? `1px solid ${rank === 1 ? 'rgba(255,215,0,0.2)' : rank === 2 ? 'rgba(192,192,192,0.15)' : 'rgba(205,127,50,0.15)'}`
                        : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color:
                        rank === 1
                          ? '#FFD700'
                          : rank === 2
                            ? '#C0C0C0'
                            : rank === 3
                              ? '#CD7F32'
                              : '#555',
                    }}
                  >
                    #{rank}
                  </span>

                  <Link href={`/avatars/${m.user_id}`}>
                    <img
                      src={avatarSrc}
                      alt=""
                      width={36}
                      height={36}
                      style={{ borderRadius: '50%' }}
                      onError={() => {
                        setFailedAvatars((prev) => new Set(prev).add(m.user_id))
                      }}
                    />
                  </Link>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/avatars/${m.user_id}`}
                      style={{
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {m.username || m.user_id}
                    </Link>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        LVL {m.level}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#888',
                        }}
                      >
                        {m.total_xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
