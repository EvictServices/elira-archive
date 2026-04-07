'use client'

import type { PurgeData } from './types'
import { getFallbackAvatar, getAvatarUrl } from '../../tickets/[id]/helpers'
import TranscriptView from '@/components/TranscriptView'

interface Props {
  purgeData: PurgeData
  purgeId: string
}

export default function PurgeView({ purgeData, purgeId }: Props) {
  const { messages, users, attachments, embeds, channel, moderator_id, message_count } = purgeData.purge

  const messageAuthorIds = new Set(messages.map((m) => m.author_id))
  const involvedIds = new Set<string>(messageAuthorIds)
  if (moderator_id) involvedIds.add(String(moderator_id))
  const people = [...involvedIds]
  const userMap = new Map(users.map((u) => [u.id, u]))

  return (
    <TranscriptView
      messages={messages}
      users={users}
      attachments={attachments}
      embeds={embeds}
      channelName={channel.name}
      headerRight={
        <span style={{ fontSize: '0.75rem', color: '#949ba4' }}>{message_count} messages purged</span>
      }
      footer={
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginTop: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f2f3f5', margin: '0 0 1rem 0' }}>Purge Information</h3>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#949ba4', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Users Involved</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {people.filter((pid) => userMap.has(pid)).map((pid) => {
                const user = userMap.get(pid)!
                return (
                  <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={getAvatarUrl(user)}
                      alt=""
                      referrerPolicy="no-referrer"
                      style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }}
                      onError={(e) => {
                        const img = e.currentTarget
                        const fallback = getFallbackAvatar(user.discriminator)
                        if (img.src !== fallback) img.src = fallback
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f2f3f5' }}>
                        {user.global_name || user.username}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#949ba4', marginLeft: '0.5rem' }}>{pid}</span>
                      {pid === String(moderator_id) && (
                        <span
                          style={{
                            background: 'rgba(237, 66, 69, 0.2)',
                            color: '#ed4245',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            padding: '0.125rem 0.375rem',
                            borderRadius: '3px',
                            marginLeft: '0.5rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          Purged By
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      }
    />
  )
}
