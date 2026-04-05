'use client'

import { useState, useCallback } from 'react'
import { defaultEmbed, generateScript } from './types'
import type { EmbedData, EmbedAuthor, EmbedFooter, EmbedField, EmbedButton } from './types'
import EmbedEditor from './EmbedEditor'
import EmbedPreview from './EmbedPreview'
import VariablesPaginator from './VariablesPaginator'

const containerStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  overflow: 'hidden' as const,
}

const headerStyle = {
  background: 'rgba(255,255,255,0.03)',
  padding: '1rem 1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const headerTitle = {
  fontWeight: 600,
  fontSize: '1rem',
  color: '#fff',
}

const headerSub = {
  fontSize: '0.75rem',
  color: '#949ba4',
}

export default function EmbedBuilderView() {
  const [data, setData] = useState<EmbedData>(defaultEmbed)
  const [copied, setCopied] = useState(false)

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
    <div style={{ background: '#1a1a1a', minHeight: '100vh', color: '#dbdee1' }}>
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }} data-reveal>
          <h2 className="section-title">Embed Builder</h2>
          <p className="section-desc" style={{ margin: 0 }}>
            Build Discord embeds visually and copy the script code
          </p>
        </div>

        <div data-reveal style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Editor Container */}
            <div style={containerStyle}>
              <div style={headerStyle}>
                <span style={headerTitle}>Editor</span>
                <span style={headerSub}>Build your embed</span>
              </div>
              <div style={{ padding: '1.5rem', maxHeight: 'calc(100vh - 16rem)', overflowY: 'auto' }}>
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

            {/* Variables Container */}
            <div style={containerStyle}>
              <div style={headerStyle}>
                <span style={headerTitle}>Variables</span>
                <span style={headerSub}>Click to copy</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <VariablesPaginator />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ position: 'sticky', top: '6rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Preview Container */}
            <div style={{ ...containerStyle, background: '#313338' }}>
              <div style={{ ...headerStyle, background: 'rgba(0,0,0,0.15)' }}>
                <span style={headerTitle}>Preview</span>
                <span style={headerSub}>Live embed preview</span>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <img src="/img/evict.webp" alt="" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>evict</span>
                      <span style={{ background: '#5865f2', color: '#fff', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '3px', fontWeight: 600 }}>BOT</span>
                      <span style={{ color: '#a3a6aa', fontSize: '0.7rem' }}>Today at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <EmbedPreview data={data} />
                  </div>
                </div>
              </div>
            </div>

            {/* Script Output Container */}
            <div style={containerStyle}>
              <div style={headerStyle}>
                <span style={headerTitle}>Script Output</span>
                <button
                  onClick={copyScript}
                  style={{
                    padding: '0.3rem 0.75rem',
                    background: copied ? 'rgba(87,242,135,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${copied ? 'rgba(87,242,135,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '6px',
                    color: copied ? '#57f287' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '1rem' }}>
                <pre style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem',
                  color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0,
                  maxHeight: '200px', overflowY: 'auto', lineHeight: 1.6,
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
