'use client'

import { useState } from 'react'

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
    dropdown: { placeholder: 'Choose an activity...', options: ['Poker Night', 'Sketch Heads', 'Watch Together', 'Blazing 8s', 'Chess in the Park'] },
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

export default function VoiceMasterButtons() {
  const [active, setActive] = useState<ButtonDef | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
    setTimeout(() => {
      setLoading(null)
      setActive(btn)
    }, 400)
  }

  const dismiss = () => { setActive(null); setDropdownOpen(false) }

  return (
    <>
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
              <img src={`/img/voicemaster/${btn.icon}.webp`} alt={btn.icon} className="vm-btn-icon" />
            )}
          </div>
        ))}
      </div>

      {active?.type === 'simple' && (
        <div className="vm-response">
          <div className="vm-response-inner">
            <img src="/context/approved.webp" alt="" className="vm-response-check" />
            <span dangerouslySetInnerHTML={{ __html: `@.: ${active.message}` }} />
          </div>
          <ResponseMeta onDismiss={dismiss} />
        </div>
      )}

      {active?.type === 'dropdown' && (
        <div className="vm-response">
          <div className="vm-response-inner">
            <span dangerouslySetInnerHTML={{ __html: `@.: ${active.message}` }} />
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
                {active.dropdown!.options.map((opt) => (
                  <div key={opt} className="vm-dropdown-item">
                    <div className="vm-dropdown-avatar" />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ResponseMeta onDismiss={dismiss} />
        </div>
      )}

      {active?.type === 'embed' && (
        <div className="vm-response">
          <div className="discord-embed-card" style={{ maxWidth: '100%' }}>
            <div className="discord-embed-accent" />
            <div className="discord-embed-content" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <div className="discord-embed-author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <img src="/img/evict.webp" alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                <span>.</span>
              </div>
              <div className="discord-embed-title" style={{ color: '#ffffff' }}>{".'s channel"}</div>
              <div className="vm-embed-info">
                <div><strong>Owner:</strong> accurs ( <code>604463848526708757</code> )</div>
                <div><strong>Locked:</strong> <img src="/context/denied.webp" alt="no" style={{ width: 18, height: 18, display: 'inline-block', verticalAlign: 'middle' }} /></div>
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
