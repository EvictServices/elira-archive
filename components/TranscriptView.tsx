'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { Attachment, Embed, User } from '@/app/(home)/tickets/[id]/types'
import { formatTimestamp, formatFileSize, getFallbackAvatar, getAvatarUrl, parseContent } from '@/app/(home)/tickets/[id]/helpers'

const INITIAL_BATCH = 50
const LOAD_MORE_BATCH = 100

interface Message {
  id: string
  author_id: string
  content: string
  timestamp: string
  edited_timestamp: string | null
}

interface Props {
  messages: Message[]
  users: User[]
  attachments: Attachment[]
  embeds: Embed[]
  channelName: string
  headerRight: React.ReactNode
  footer: React.ReactNode
}

export default function TranscriptView({ messages, users, attachments, embeds, channelName, headerRight, footer }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const onScroll = () => setShowScrollTop(container.scrollTop > 400)
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (visibleCount >= messages.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_BATCH, messages.length))
        }
      },
      { root: scrollContainerRef.current, rootMargin: '600px' }
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [visibleCount, messages.length])

  const visibleMessages = useMemo(() => messages.slice(0, visibleCount), [messages, visibleCount])

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const attachmentMap = useMemo(() => {
    const map = new Map<string, Attachment[]>()
    attachments.forEach((att) => {
      const existing = map.get(att.message_id) || []
      existing.push(att)
      map.set(att.message_id, existing)
    })
    return map
  }, [attachments])

  const embedMap = useMemo(() => {
    const map = new Map<string, Embed[]>()
    ;(embeds || []).forEach((emb) => {
      const existing = map.get(emb.message_id) || []
      existing.push(emb)
      map.set(emb.message_id, existing)
    })
    return map
  }, [embeds])

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
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>{channelName}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {headerRight}
              </div>
            </div>

            <div ref={scrollContainerRef} style={{ padding: '1rem 0', maxHeight: 'calc(100vh - 14rem)', overflowY: 'auto', position: 'relative' }}>
              <div ref={topRef} />
              {visibleMessages.map((msg, msgIndex) => {
                const author = userMap.get(msg.author_id)
                if (!author) return null

                const msgAttachments = attachmentMap.get(msg.id) || []
                const msgEmbeds = embedMap.get(msg.id) || []
                const prevMsg = msgIndex > 0 ? visibleMessages[msgIndex - 1] : null
                const isGrouped = prevMsg && prevMsg.author_id === msg.author_id && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) < 420000

                return (
                  <div
                    key={msg.id}
                    style={{
                      padding: isGrouped ? '0.125rem 1rem 0.125rem 4.5rem' : '0.5rem 1rem',
                      paddingTop: isGrouped ? '0.125rem' : (msgIndex === 0 ? '0.5rem' : '1rem'),
                      display: 'flex',
                      gap: '1rem',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {!isGrouped && (
                      <img
                        src={getAvatarUrl(author)}
                        alt={author.username}
                        referrerPolicy="no-referrer"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}
                        onError={(e) => {
                          const img = e.currentTarget
                          const fallback = getFallbackAvatar(author.discriminator)
                          if (img.src !== fallback) img.src = fallback
                        }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {!isGrouped && (
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
                      )}

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

                      {msgEmbeds.length > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {msgEmbeds.map((emb, idx) => {
                            const borderColor = emb.color ? `#${parseInt(emb.color).toString(16).padStart(6, '0')}` : '#202225'
                            return (
                              <div key={idx} style={{ display: 'flex', maxWidth: '520px' }}>
                                <div style={{ width: '4px', borderRadius: '4px 0 0 4px', background: borderColor, flexShrink: 0 }} />
                                <div
                                  style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderLeft: 'none',
                                    borderRadius: '0 4px 4px 0',
                                    padding: '0.75rem 1rem',
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  {emb.author?.name && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                      {emb.author.icon_url && (
                                        <img
                                          src={emb.author.icon_url}
                                          alt=""
                                          referrerPolicy="no-referrer"
                                          style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                                        />
                                      )}
                                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f2f3f5' }}>
                                        {emb.author.name}
                                      </span>
                                    </div>
                                  )}

                                  {emb.title && (
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: emb.url ? '#00a8fc' : '#f2f3f5', marginBottom: '0.25rem' }}>
                                      {emb.title}
                                    </div>
                                  )}

                                  {emb.description && (
                                    <div style={{ fontSize: '0.875rem', color: '#dbdee1', lineHeight: '1.375', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                      {parseContent(emb.description, userMap)}
                                    </div>
                                  )}

                                  {emb.fields.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                                      {emb.fields.map((field, fi) => (
                                        <div key={fi} style={{ gridColumn: field.inline ? 'span 1' : '1 / -1' }}>
                                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f2f3f5', marginBottom: '0.125rem' }}>{field.name}</div>
                                          <div style={{ fontSize: '0.875rem', color: '#dbdee1', whiteSpace: 'pre-wrap' }}>{parseContent(field.value, userMap)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {emb.image?.url && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                      <img
                                        src={emb.image.url}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        style={{ maxWidth: '100%', borderRadius: '4px', maxHeight: '300px', objectFit: 'contain' }}
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                      />
                                    </div>
                                  )}

                                  {emb.thumbnail?.url && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                      <img
                                        src={emb.thumbnail.url}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '4px', objectFit: 'cover' }}
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                      />
                                    </div>
                                  )}

                                  {(emb.footer?.text || emb.timestamp) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                      {emb.footer?.icon_url && (
                                        <img
                                          src={emb.footer.icon_url}
                                          alt=""
                                          referrerPolicy="no-referrer"
                                          style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                                        />
                                      )}
                                      <span style={{ fontSize: '0.75rem', color: '#949ba4' }}>
                                        {emb.footer?.text}
                                        {emb.footer?.text && emb.timestamp && ' \u2022 '}
                                        {emb.timestamp && formatTimestamp(emb.timestamp)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

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
                                    style={{ width: '100%', display: 'block', borderRadius: '8px', objectFit: 'contain', maxHeight: '400px' }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                </div>
                              )
                            }
                            return (
                              <div
                                key={idx}
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '8px',
                                  padding: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  color: '#dbdee1',
                                }}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#80848e">
                                  <path d="M6 2C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2H6ZM13 9V3.5L18.5 9H13Z" />
                                </svg>
                                <div>
                                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{att.filename}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#949ba4' }}>{formatFileSize(att.file_size)}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {visibleCount < messages.length && (
                <div ref={sentinelRef} style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#949ba4' }}>Loading more messages…</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {footer}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(88, 101, 242, 0.9)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            zIndex: 100,
            transition: 'opacity 0.2s',
          }}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5l-7 7h4v4h6v-4h4l-7-7z" />
          </svg>
        </button>
      )}

      {imagePreview && (
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
