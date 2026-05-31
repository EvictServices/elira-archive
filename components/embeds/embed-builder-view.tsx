'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { defaultEmbed, generateScript } from '@/components/embeds/lib/types'
import type { EmbedData, EmbedAuthor, EmbedFooter, EmbedField, EmbedButton } from '@/components/embeds/lib/types'
import EmbedEditor from '@/components/embeds/embed-editor'
import EmbedPreview from '@/components/embeds/embed-preview'
import VariablesPaginator from '@/components/embeds/variables-paginator'
import Autocomplete from '@/components/embeds/autocomplete'

const containerStyle = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04) inset',
  transition: 'border-color 0.3s, box-shadow 0.3s',
}

const headerStyle = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  padding: '0.85rem 1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const headerTitle = {
  fontWeight: 700,
  fontSize: '0.9rem',
  color: '#fff',
  letterSpacing: '-0.01em',
}

const headerSub = {
  fontSize: '0.7rem',
  color: '#626876',
  fontWeight: 500,
}

export default function EmbedBuilderView() {
  const [data, setData] = useState<EmbedData>(defaultEmbed)
  const [copied, setCopied] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const lastInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
  }, [])

  const handleEditorFocus = useCallback((e: React.FocusEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      lastInputRef.current = target as HTMLInputElement | HTMLTextAreaElement
    }
  }, [])

  const insertVariable = useCallback((variable: string) => {
    const el = lastInputRef.current
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const newValue = el.value.slice(0, start) + variable + el.value.slice(end)
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
    if (setter) {
      setter.call(el, newValue)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    el.focus()
    const cursor = start + variable.length
    el.setSelectionRange(cursor, cursor)
  }, [])

  const update = useCallback(<K extends keyof EmbedData>(key: K, value: EmbedData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateAuthor = useCallback((key: keyof EmbedAuthor, value: string) => {
    setData(prev => ({ ...prev, author: { ...prev.author, [key]: value } }))
  }, [])

  const updateFooter = useCallback((key: keyof EmbedFooter, value: string) => {
    setData(prev => ({ ...prev, footer: { ...prev.footer, [key]: value } }))
  }, [])

  const addField = useCallback(() => {
    setData(prev => ({ ...prev, fields: [...prev.fields, { name: '', value: '', inline: false }] }))
  }, [])

  const updateField = useCallback((index: number, key: keyof EmbedField, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, [key]: value } : f),
    }))
  }, [])

  const removeField = useCallback((index: number) => {
    setData(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }))
  }, [])

  const addButton = useCallback(() => {
    setData(prev => ({ ...prev, buttons: [...prev.buttons, { style: 'link', label: '', url: '', emoji: '', disabled: false }] }))
  }, [])

  const updateButton = useCallback((index: number, key: keyof EmbedButton, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      buttons: prev.buttons.map((b, i) => i === index ? { ...b, [key]: value } : b),
    }))
  }, [])

  const removeButton = useCallback((index: number) => {
    setData(prev => ({ ...prev, buttons: prev.buttons.filter((_, i) => i !== index) }))
  }, [])

  const script = generateScript(data)

  const copyScript = useCallback(() => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [script])

  return (
    <div style={{ minHeight: '100vh', color: '#dbdee1', position: 'relative' }}>
      <Autocomplete inputRef={lastInputRef} onInsert={insertVariable} />
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem', position: 'relative' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }} data-reveal>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)',
            borderRadius: '100px', padding: '0.3rem 0.85rem', marginBottom: '0.85rem',
            fontSize: '0.7rem', fontWeight: 600, color: '#8b9eff', letterSpacing: '0.04em',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />
            </svg>
            VISUAL EDITOR
          </div>
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Embed Builder</h2>
          <p className="section-desc" style={{ margin: 0 }}>
            Build Discord embeds visually and copy the script code
          </p>
        </div>

        <div data-reveal className="embed-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="embed-container" style={containerStyle}>
              <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5865f2', boxShadow: '0 0 8px rgba(88,101,242,0.5)' }} />
                  <span style={headerTitle}>Editor</span>
                </div>
                <span style={headerSub}>Build your embed</span>
              </div>
              <div style={{ padding: '1.5rem', maxHeight: 'calc(100vh - 16rem)', overflowY: 'auto' }} onFocusCapture={handleEditorFocus}>
                <EmbedEditor
                  data={data}
                  update={update}
                  updateAuthor={updateAuthor}
                  updateFooter={updateFooter}
                  addField={addField}
                  updateField={updateField}
                  removeField={removeField}
                  addButton={addButton}
                  updateButton={updateButton}
                  removeButton={removeButton}
                />
              </div>
            </div>

            <div className="embed-container" style={containerStyle}>
              <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#faa61a', boxShadow: '0 0 8px rgba(250,166,26,0.4)' }} />
                  <span style={headerTitle}>Variables</span>
                </div>
                <span style={headerSub}>Click to insert</span>
              </div>
              <div style={{ padding: '1rem' }}>
                <VariablesPaginator onInsert={insertVariable} />
              </div>
            </div>
          </div>

          <div className="embed-grid-right">
            <div className="embed-container" style={{ ...containerStyle, background: '#313338', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ ...headerStyle, background: 'linear-gradient(135deg, rgba(88,101,242,0.08) 0%, rgba(0,0,0,0.15) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#57f287', boxShadow: '0 0 8px rgba(87,242,135,0.5)' }} />
                  <span style={headerTitle}>Preview</span>
                </div>
                <span style={headerSub}>Live embed preview</span>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <img src="/img/evict.webp" alt="" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>evict</span>
                      <span style={{ background: '#5865f2', color: '#fff', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '3px', fontWeight: 600 }}>BOT</span>
                      {timeStr && <span style={{ color: '#a3a6aa', fontSize: '0.7rem' }}>Today at {timeStr}</span>}
                    </div>
                    <EmbedPreview data={data} />
                  </div>
                </div>
              </div>
            </div>

            <div className="embed-container" style={containerStyle}>
              <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ed4245', boxShadow: '0 0 8px rgba(237,66,69,0.4)' }} />
                  <span style={headerTitle}>Script Output</span>
                </div>
                <button
                  onClick={copyScript}
                  className="embed-copy-btn"
                  style={{
                    padding: '0.3rem 0.85rem',
                    background: copied ? 'rgba(87,242,135,0.12)' : 'rgba(88,101,242,0.1)',
                    border: `1px solid ${copied ? 'rgba(87,242,135,0.25)' : 'rgba(88,101,242,0.25)'}`,
                    borderRadius: '100px',
                    color: copied ? '#57f287' : '#8b9eff',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    letterSpacing: '0.02em',
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '1rem' }}>
                <pre style={{
                  background: 'rgba(0,0,0,0.35)', borderRadius: '10px', padding: '0.85rem',
                  color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontFamily: '"SF Mono", "Fira Code", monospace',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0,
                  maxHeight: '200px', overflowY: 'auto', lineHeight: 1.7,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  {script || '// Start building your embed...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
