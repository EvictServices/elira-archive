'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { defaultEmbed, generateScript } from '@/components/embeds/lib/types'
import type { EmbedData, EmbedAuthor, EmbedFooter, EmbedField, EmbedButton } from '@/components/embeds/lib/types'
import EmbedEditor from '@/components/embeds/embed-editor'
import EmbedPreview from '@/components/embeds/embed-preview'
import VariablesPaginator from '@/components/embeds/variables-paginator'
import Autocomplete from '@/components/embeds/autocomplete'

export default function EmbedBuilderView() {
  const [data, setData] = useState<EmbedData>(defaultEmbed)
  const [copied, setCopied] = useState(false)
  const [timeStr, setTimeStr] = useState('')
  const [pageReady, setPageReady] = useState(false)
  const lastInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    const id = requestAnimationFrame(() => setPageReady(true))
    return () => cancelAnimationFrame(id)
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
    setData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateAuthor = useCallback((key: keyof EmbedAuthor, value: string) => {
    setData((prev) => ({ ...prev, author: { ...prev.author, [key]: value } }))
  }, [])

  const updateFooter = useCallback((key: keyof EmbedFooter, value: string) => {
    setData((prev) => ({ ...prev, footer: { ...prev.footer, [key]: value } }))
  }, [])

  const addField = useCallback(() => {
    setData((prev) => ({
      ...prev,
      fields: [...prev.fields, { name: '', value: '', inline: false }],
    }))
  }, [])

  const updateField = useCallback(
    (index: number, key: keyof EmbedField, value: string | boolean) => {
      setData((prev) => ({
        ...prev,
        fields: prev.fields.map((f, i) => (i === index ? { ...f, [key]: value } : f)),
      }))
    },
    []
  )

  const removeField = useCallback((index: number) => {
    setData((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }))
  }, [])

  const addButton = useCallback(() => {
    setData((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        { style: 'link', label: '', url: '', emoji: '', disabled: false },
      ],
    }))
  }, [])

  const updateButton = useCallback(
    (index: number, key: keyof EmbedButton, value: string | boolean) => {
      setData((prev) => ({
        ...prev,
        buttons: prev.buttons.map((b, i) => (i === index ? { ...b, [key]: value } : b)),
      }))
    },
    []
  )

  const removeButton = useCallback((index: number) => {
    setData((prev) => ({ ...prev, buttons: prev.buttons.filter((_, i) => i !== index) }))
  }, [])

  const script = generateScript(data)

  const copyScript = useCallback(() => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [script])

  return (
    <div className={`emb-page cmds-ease${pageReady ? ' is-ready' : ''}`}>
      <Autocomplete inputRef={lastInputRef} onInsert={insertVariable} />

      <div className="container">
        <header className="emb-header">
          <h1>Embeds</h1>
          <p>Build Discord embeds visually and copy the script for your server.</p>
        </header>

        <div className="emb-toolbar">
          <span className="emb-toolbar-label">Variables</span>
          <VariablesPaginator onInsert={insertVariable} />
        </div>

        <div className="emb-workspace">
          <div className="emb-workspace-grid">
            <div className="emb-pane emb-pane--editor" onFocusCapture={handleEditorFocus}>
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

            <aside className="emb-pane emb-pane--aside">
              <div className="emb-preview">
                <div className="emb-discord-msg">
                  <img
                    src="/img/evict.webp"
                    alt=""
                    className="emb-discord-avatar"
                    width={40}
                    height={40}
                  />
                  <div className="emb-discord-content">
                    <div className="emb-discord-meta">
                      <span className="emb-discord-name">evict</span>
                      <span className="emb-discord-bot">BOT</span>
                      {timeStr ? (
                        <span className="emb-discord-time">Today at {timeStr}</span>
                      ) : null}
                    </div>
                    <EmbedPreview data={data} />
                  </div>
                </div>
              </div>

              <div className="emb-output">
                <div className="emb-output-head">
                  <span>Script output</span>
                  <button
                    type="button"
                    className={`emb-copy${copied ? ' is-copied' : ''}`}
                    onClick={copyScript}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="emb-script">{script || '// Start building your embed…'}</pre>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
