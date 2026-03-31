'use client'

import { useState } from 'react'

interface Message {
  id: string
  author_id: string
  content: string
  timestamp: string
  edited_timestamp: string | null
  pinned: boolean
}

interface User {
  id: string
  username: string
  global_name: string | null
  discriminator: string
  avatar: string | null
  bot: boolean
}

interface Attachment {
  filename: string
  url: string
  file_size: number
  message_id: string
}

interface TicketData {
  ticket: {
    messages: Message[]
    users: User[]
    attachments: Attachment[]
    channel: {
      name: string
      created_at: string
    }
  }
}

interface Props {
  ticketData: TicketData
  ticketId: string
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString()

  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  if (isToday) return `Today at ${time}`
  if (isYesterday) return `Yesterday at ${time}`

  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ` ${time}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

function getFallbackAvatar(discriminator?: string): string {
  const disc = Number(discriminator || '0')
  const index = Number.isFinite(disc) ? Math.abs(disc) % 5 : 0
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

function getAvatarUrl(user: User): string {
  return user.avatar || getFallbackAvatar(user.discriminator)
}

function parseContent(content: string, userMap: Map<string, User>): React.ReactNode[] {
  const mentionStyle: React.CSSProperties = {
    background: 'rgba(88, 101, 242, 0.3)',
    color: '#dee0fc',
    borderRadius: '3px',
    padding: '0 2px',
    fontWeight: 500,
    cursor: 'default',
  }
  const codeBlockStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '4px',
    padding: '0.5rem',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.875rem',
    display: 'block',
    whiteSpace: 'pre',
    overflowX: 'auto',
    margin: '0.25rem 0',
  }
  const inlineCodeStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '3px',
    padding: '0.1rem 0.3rem',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '0.85em',
  }

  // Split by code blocks first
  const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const processInline = (text: string, keyPrefix: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = []
    // Combined regex for all inline patterns
    const inlineRegex = /(<@!?(\d+)>)|(<#(\d+)>)|(<@&(\d+)>)|(`([^`]+)`)|(\_\_(.+?)\_\_)|(\.{2}(.+?)\.{2})|(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(~~(.+?)~~)|(\|\|(.+?)\|\|)/g
    let inlineLastIndex = 0
    let inlineMatch: RegExpExecArray | null

    while ((inlineMatch = inlineRegex.exec(text)) !== null) {
      // Add text before match
      if (inlineMatch.index > inlineLastIndex) {
        nodes.push(text.slice(inlineLastIndex, inlineMatch.index))
      }

      const key = `${keyPrefix}-${inlineMatch.index}`

      if (inlineMatch[1]) {
        // User mention <@id> or <@!id>
        const userId = inlineMatch[2]
        const user = userMap.get(userId)
        const name = user ? (user.global_name || user.username) : `Unknown User`
        nodes.push(<span key={key} style={mentionStyle}>@{name}</span>)
      } else if (inlineMatch[3]) {
        // Channel mention <#id>
        nodes.push(<span key={key} style={mentionStyle}>#channel</span>)
      } else if (inlineMatch[5]) {
        // Role mention <@&id>
        nodes.push(<span key={key} style={mentionStyle}>@role</span>)
      } else if (inlineMatch[7]) {
        // Inline code `code`
        nodes.push(<code key={key} style={inlineCodeStyle}>{inlineMatch[8]}</code>)
      } else if (inlineMatch[9]) {
        // Underline __text__
        nodes.push(<u key={key}>{inlineMatch[10]}</u>)
      } else if (inlineMatch[13]) {
        // Bold italic ***text***
        nodes.push(<strong key={key}><em>{inlineMatch[14]}</em></strong>)
      } else if (inlineMatch[15]) {
        // Bold **text**
        nodes.push(<strong key={key}>{inlineMatch[16]}</strong>)
      } else if (inlineMatch[17]) {
        // Italic *text*
        nodes.push(<em key={key}>{inlineMatch[18]}</em>)
      } else if (inlineMatch[19]) {
        // Strikethrough ~~text~~
        nodes.push(<s key={key}>{inlineMatch[20]}</s>)
      } else if (inlineMatch[21]) {
        // Spoiler ||text||
        nodes.push(
          <span
            key={key}
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              padding: '0 2px',
              cursor: 'pointer',
            }}
          >
            {inlineMatch[22]}
          </span>
        )
      }

      inlineLastIndex = inlineMatch.index + inlineMatch[0].length
    }

    if (inlineLastIndex < text.length) {
      nodes.push(text.slice(inlineLastIndex))
    }

    return nodes.length > 0 ? nodes : [text]
  }

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...processInline(content.slice(lastIndex, match.index), `pre-${lastIndex}`))
    }
    parts.push(
      <code key={`cb-${match.index}`} style={codeBlockStyle}>
        {match[1]}
      </code>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(...processInline(content.slice(lastIndex), `post-${lastIndex}`))
  }

  return parts
}

export default function TicketView({ ticketData, ticketId }: Props) {
  const { messages, users, attachments, channel } = ticketData.ticket
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Create user lookup map
  const userMap = new Map(users.map((u) => [u.id, u]))

  // Group attachments by message_id
  const attachmentMap = new Map<string, Attachment[]>()
  attachments.forEach((att) => {
    const existing = attachmentMap.get(att.message_id) || []
    existing.push(att)
    attachmentMap.set(att.message_id, existing)
  })

  return (
    <>
      <div style={{ background: '#1a1a1a', minHeight: '100vh', color: '#dbdee1' }}>
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
          {/* Channel Header */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#80848e">
              <path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{channel.name}</span>
          </div>

          {/* Messages Container */}
          <div style={{ padding: '1rem 0' }}>
            {messages.map((msg) => {
              const author = userMap.get(msg.author_id)
              if (!author) return null

              const msgAttachments = attachmentMap.get(msg.id) || []

              return (
                <div
                  key={msg.id}
                  style={{
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    gap: '1rem',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Avatar */}
                  <img
                    src={getAvatarUrl(author)}
                    alt={author.username}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      const img = e.currentTarget
                      const fallback = getFallbackAvatar(author.discriminator)
                      if (img.src !== fallback) img.src = fallback
                    }}
                  />

                  {/* Message Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: author.bot ? '#5865f2' : '#f2f3f5', fontSize: '1rem' }}>
                        {author.global_name || author.username}
                      </span>
                      {author.bot && (
                        <span
                          style={{
                            background: '#5865f2',
                            color: '#fff',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            padding: '0.125rem 0.275rem',
                            borderRadius: '3px',
                            textTransform: 'uppercase',
                          }}
                        >
                          BOT
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#949ba4' }}>{formatTimestamp(msg.timestamp)}</span>
                      {msg.edited_timestamp && (
                        <span
                          style={{ fontSize: '0.625rem', color: '#949ba4' }}
                          title={`Edited at ${formatTimestamp(msg.edited_timestamp)}`}
                        >
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    {msg.content && (
                      <div
                        style={{
                          color: '#dbdee1',
                          fontSize: '1rem',
                          lineHeight: '1.375',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {parseContent(msg.content, userMap)}
                      </div>
                    )}

                    {/* Attachments */}
                    {msgAttachments.length > 0 && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {msgAttachments.map((att, idx) => {
                          const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(att.filename)
                          if (isImage) {
                            return (
                              <div
                                key={idx}
                                style={{
                                  maxWidth: '400px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  background: 'rgba(0,0,0,0.2)',
                                }}
                                onClick={() => setImagePreview(att.url)}
                              >
                                <img
                                  src={att.url}
                                  alt={att.filename}
                                  style={{
                                    width: '100%',
                                    display: 'block',
                                    borderRadius: '8px',
                                    objectFit: 'contain',
                                    maxHeight: '400px',
                                  }}
                                  loading="lazy"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            )
                          } else {
                            return (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '8px',
                                  padding: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  textDecoration: 'none',
                                  color: '#00a8fc',
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#80848e">
                                  <path d="M6 2C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2H6ZM13 9V3.5L18.5 9H13Z" />
                                </svg>
                                <div>
                                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{att.filename}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#949ba4' }}>
                                    {formatFileSize(att.file_size)}
                                  </div>
                                </div>
                              </a>
                            )
                          }
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}      {imagePreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
          }}
          onClick={() => setImagePreview(null)}
        >
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
