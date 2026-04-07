'use client'

import type { TicketData } from './types'
import { formatTimestamp, getFallbackAvatar, getAvatarUrl } from './helpers'
import TranscriptView from '@/components/TranscriptView'

interface Props {
  ticketData: TicketData
  ticketId: string
}

export default function TicketView({ ticketData, ticketId }: Props) {
  const { messages, users, attachments, embeds, channel, ticket: ticketMeta } = ticketData.ticket

  const messageAuthorIds = new Set(messages.map((m) => m.author_id))
  const involvedIds = new Set<string>(messageAuthorIds)
  if (ticketMeta?.opened_by_id) involvedIds.add(ticketMeta.opened_by_id)
  if (ticketMeta?.closed_by_id) involvedIds.add(ticketMeta.closed_by_id)
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
        <>
          <span style={{ fontSize: '0.75rem', color: '#949ba4' }}>{messages.length} messages</span>
          <span style={{ fontSize: '0.75rem', color: '#949ba4' }}>{formatTimestamp(channel.created_at)}</span>
        </>
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
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f2f3f5', margin: '0 0 1rem 0' }}>Ticket Information</h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#949ba4', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Close Reason</div>
            <div style={{ fontSize: '0.875rem', color: '#dbdee1' }}>{ticketMeta?.reason || 'No reason provided.'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#949ba4', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Users Involved</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {people.map((pid) => {
                const user = userMap.get(pid)
                return (
                  <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={user ? getAvatarUrl(user) : getFallbackAvatar('0')}
                      alt=""
                      referrerPolicy="no-referrer"
                      style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }}
                      onError={(e) => {
                        const img = e.currentTarget
                        const fallback = getFallbackAvatar('0')
                        if (img.src !== fallback) img.src = fallback
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f2f3f5' }}>
                        {user ? (user.global_name || user.username) : 'Unknown User'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#949ba4', marginLeft: '0.5rem' }}>{pid}</span>
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
