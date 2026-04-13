'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type ResponseType = 'simple' | 'dropdown' | 'embed'

interface ButtonDef {
  icon: string
  type: ResponseType
  message: string
  dropdown?: { placeholder: string; options: string[] }
}

const buttons: ButtonDef[] = [
  { icon: 'lock', type: 'simple', message: 'Your voice channel has been locked' },
  { icon: 'unlock', type: 'simple', message: 'Your voice channel has been unlocked' },
  { icon: 'ghost', type: 'simple', message: 'Your voice channel has been hidden' },
  { icon: 'reveal', type: 'simple', message: 'Your voice channel has been revealed' },
  { icon: 'claim', type: 'simple', message: 'Your voice channel has been claimed' },
  {
    icon: 'hammer', type: 'dropdown',
    message: 'Select members from the <strong>dropdown</strong> to disconnect.',
    dropdown: { placeholder: 'Choose members...', options: ['accurs (604463848526708757)'] },
  },
  {
    icon: 'activity', type: 'dropdown',
    message: 'Select an activity from the dropdown to start',
    dropdown: { placeholder: 'Choose an activity...', options: ['♠ Poker Night', '🎨 Sketch Heads', '🎥 Watch Together', '🎴 Blazing 8s', '♟ Chess in the Park', '⚪ Checkers in the Park', '🅰 Letter League', '🍬 Word Snacks', '🪄 Spell Cast', '⛳ Putt Party', '👁 Land-io', '⚽ Bobble League'] },
  },
  { icon: 'information', type: 'embed', message: '' },
  { icon: 'increase', type: 'simple', message: "Your voice channel's limit has been updated to <code>1</code>" },
  { icon: 'decrease', type: 'simple', message: "Your voice channel's limit has been updated to <code>0</code>" },
]

function ResponseMeta({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="vm-response-meta">
      <span>Only you can see this</span>
      <span> • </span>
      <span className="vm-response-dismiss" onClick={onDismiss}>Dismiss message</span>
    </div>
  )
}

export default function VoiceMasterButtons({ children }: { children?: React.ReactNode }) {
  const [active, setActive] = useState<ButtonDef | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [panelHidden, setPanelHidden] = useState(false)
  const [panelFading, setPanelFading] = useState(false)
  const [activityFading, setActivityFading] = useState(false)
  const [responseFading, setResponseFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current)
    }
  }, [])

  const selectActivity = (name: string) => {
    setSelectedActivity(name)
    setDropdownOpen(false)
    setPanelFading(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setPanelHidden(true)
      setPanelFading(false)
      timerRef.current = setTimeout(() => {
        setActivityFading(true)
        timerRef.current = setTimeout(() => {
          setSelectedActivity(null)
          setActivityFading(false)
          setPanelHidden(false)
          setActive(null)
        }, 400)
      }, 2000)
    }, 400)
  }

  const handleClick = (btn: ButtonDef) => {
    if (loading) return
    if (active?.icon === btn.icon) {
      setActive(null)
      setDropdownOpen(false)
      return
    }
    setLoading(btn.icon)
    setActive(null)
    setDropdownOpen(false)
    setSelectedActivity(null)
    setResponseFading(false)
    if (responseTimerRef.current) clearTimeout(responseTimerRef.current)
    setTimeout(() => {
      setLoading(null)
      setActive(btn)
      if (btn.type !== 'dropdown') {
        responseTimerRef.current = setTimeout(() => {
          setResponseFading(true)
          responseTimerRef.current = setTimeout(() => {
            setResponseFading(false)
            setActive(null)
          }, 400)
        }, 1500)
      }
    }, 400)
  }

  const dismiss = () => {
    if (selectedActivity) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setActivityFading(true)
      timerRef.current = setTimeout(() => {
        setSelectedActivity(null)
        setActivityFading(false)
        setPanelHidden(false)
        setActive(null)
        setDropdownOpen(false)
      }, 400)
    } else {
      setActive(null)
      setDropdownOpen(false)
    }
  }

  return (
    <>
      <div style={{ opacity: panelFading ? 0 : 1, transition: 'opacity 0.4s ease', display: panelHidden ? 'none' : undefined }}>
        {children}
        <div className="vm-buttons-grid">
        {buttons.map((btn) => (
          <div
            key={btn.icon}
            className={`vm-btn${loading === btn.icon ? ' vm-btn-loading' : ''}`}
            onClick={() => handleClick(btn)}
          >
            {loading === btn.icon ? (
              <div className="vm-spinner" />
            ) : (
              <Image src={`/img/voicemaster/${btn.icon}.webp`} alt={btn.icon} width={20} height={20} className="vm-btn-icon" />
            )}
          </div>
        ))}
      </div>
      </div>

      {active?.type === 'simple' && !selectedActivity && (
        <div className="vm-response" style={{ animation: 'vm-fade-in 0.3s ease', opacity: responseFading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          <div className="vm-response-inner">
            <Image src="/img/context/approved.webp" alt="" width={20} height={20} className="vm-response-check" />
            <span dangerouslySetInnerHTML={{ __html: `<span style="color:#c9cdfb;background:rgba(88,101,242,0.3);border-radius:3px;padding:0 2px">@mercy</span>: ${active.message}` }} />
          </div>
          <ResponseMeta onDismiss={dismiss} />
        </div>
      )}

      {active?.type === 'dropdown' && !selectedActivity && (
        <div className="vm-response" style={{ animation: 'vm-fade-in 0.3s ease', opacity: responseFading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          <div className="vm-response-inner">
            <span dangerouslySetInnerHTML={{ __html: `<span style="color:#c9cdfb;background:rgba(88,101,242,0.3);border-radius:3px;padding:0 2px">@mercy</span>: ${active.message}` }} />
          </div>
          <div className="vm-dropdown-wrap">
            <div className="vm-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span>{active.dropdown!.placeholder}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {dropdownOpen && (
              <div className="vm-dropdown-menu">
                {active.dropdown!.options.map((opt) => {
                  const emoji = opt.match(/^(\S+)\s/)?.[1]
                  const name = opt.replace(/^\S+\s/, '')
                  return (
                    <div key={opt} className="vm-dropdown-item" onClick={() => {
                      if (active.icon === 'activity') {
                        selectActivity(name)
                      }
                    }}>
                      {emoji ? <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{emoji}</span> : <div className="vm-dropdown-avatar" />}
                      <span>{name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <ResponseMeta onDismiss={dismiss} />
        </div>
      )}

      {selectedActivity && (
        <div style={{ marginTop: '0.75rem', opacity: activityFading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          <div className="discord-message">
            <div className="discord-msg-avatar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 33, height: 14, borderLeft: '2px solid #4e5058', borderTop: '2px solid #4e5058', borderTopLeftRadius: '6px', alignSelf: 'flex-end', marginBottom: 2 }} />
              <Image src="/img/evict.webp" alt="evict" width={40} height={40} style={{ borderRadius: '50%' }} />
            </div>
            <div className="discord-msg-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#949ba4', marginBottom: '0.15rem' }}>
                <Image src="/img/evict.webp" alt="" width={16} height={16} style={{ borderRadius: '50%' }} />
                <span style={{ color: '#ffffff', fontWeight: 500, fontSize: '0.75rem' }}>evict</span>
                <span className="discord-msg-bot-tag" style={{ fontSize: '0.55rem', padding: '0 3px', lineHeight: '1.2' }}>APP</span>
                <span style={{ color: '#949ba4', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Click to see attachment 🖼️</span>
              </div>
              <div className="discord-msg-header">
                <span className="discord-msg-username">evict</span>
                <span className="discord-msg-bot-tag">APP</span>
              </div>
              <div style={{ color: '#00a8fc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Click here to join the activity
              </div>
            <div style={{ background: '#2b2d31', borderRadius: '8px', overflow: 'hidden', maxWidth: 350 }}>
              <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg, #3b7d4f 0%, #5ba55e 50%, #4a9e6e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.25rem' }}>
                <svg width="20" height="16" viewBox="0 0 24 24" fill="white" opacity={0.8}><path d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44.07.07 0 0 0-.07.04c-.2.36-.43.83-.58 1.2a16.8 16.8 0 0 0-5.07 0 12.5 12.5 0 0 0-.6-1.2.07.07 0 0 0-.06-.04 18.1 18.1 0 0 0-4.6 1.44.06.06 0 0 0-.03.03C.71 9.53-.07 13.94.35 18.29a.08.08 0 0 0 .03.05 18.3 18.3 0 0 0 5.52 2.8.07.07 0 0 0 .08-.03c.43-.58.81-1.2 1.13-1.84a.07.07 0 0 0-.04-.1 12.1 12.1 0 0 1-1.72-.83.07.07 0 0 1 0-.12c.12-.09.23-.17.34-.27a.07.07 0 0 1 .07-.01c3.6 1.65 7.5 1.65 11.06 0a.07.07 0 0 1 .07.01c.11.09.23.18.34.27a.07.07 0 0 1 0 .12c-.55.32-1.12.6-1.73.83a.07.07 0 0 0-.03.1c.33.64.7 1.26 1.13 1.84a.07.07 0 0 0 .08.03 18.2 18.2 0 0 0 5.53-2.8.07.07 0 0 0 .03-.05c.5-5.18-.84-9.55-3.55-13.39a.06.06 0 0 0-.03-.03Z"/></svg>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.1 }}>{selectedActivity}</span>
              </div>
              <div style={{ padding: '0.75rem' }}>
                <div style={{ color: '#dbdee1', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{selectedActivity}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#5865f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem' }}>♟</span>
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>Activity Invite</div>
                    <div style={{ color: '#949ba4', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#949ba4"><path d="M12 3a1 1 0 0 0-1-1h-1.5C8.12 2 7 3.12 7 4.5V6H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h.5c.28 0 .5.22.5.5v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8c0-.28.22-.5.5-.5H20a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-3V4.5C17 3.12 15.88 2 14.5 2H13a1 1 0 0 0-1 1v3.5a.5.5 0 0 1-1 0V3Z"/></svg>
                      <span style={{ color: '#c9cdfb', backgroundColor: 'rgba(88,101,242,0.3)', borderRadius: '3px', padding: '0 2px' }}>@mercy</span>{"'s channel"} in <strong>evict</strong>
                    </div>
                  </div>
                </div>
                <button style={{ width: '100%', padding: '0.5rem', background: '#248046', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                  Play
                </button>
              </div>
            </div>
            <ResponseMeta onDismiss={dismiss} />
          </div>
        </div>
        </div>
      )}

      {active?.type === 'embed' && (
        <div className="vm-response" style={{ animation: 'vm-fade-in 0.3s ease', borderLeft: 'none', padding: 0, background: 'none', opacity: responseFading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          <div className="discord-embed-card" style={{ maxWidth: '100%' }}>
            <div className="discord-embed-accent" style={{ background: '#5f828d' }} />
            <div className="discord-embed-content" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <div className="discord-embed-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <img src="/img/evict.webp" alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                <span>@mercy</span>
              </div>
              <div className="discord-embed-title" style={{ color: '#ffffff' }}>@mercy{"'s channel"}</div>
              <div className="vm-embed-info">
                <div><strong>Owner:</strong> accurs ( <code>604463848526708757</code> )</div>
                <div><strong>Locked:</strong> <img src="/img/context/denied.webp" alt="no" style={{ width: 18, height: 18, display: 'inline-block', verticalAlign: 'middle' }} /></div>
                <div><strong>Created:</strong> 2 minutes ago</div>
                <div><strong>Bitrate:</strong> 64kbps</div>
                <div><strong>Connected:</strong> 1</div>
              </div>
            </div>
          </div>
          <ResponseMeta onDismiss={dismiss} />
        </div>
      )}
    </>
  )
}
