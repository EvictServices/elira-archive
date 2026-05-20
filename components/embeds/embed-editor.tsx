'use client'

import { useState } from 'react'
import type { EmbedData, EmbedAuthor, EmbedFooter, EmbedField, EmbedButton } from '@/components/embeds/lib/types'
import { BUTTON_STYLES } from '@/components/embeds/lib/constants'
import { extractEmbedTags, type ParsedEmbedPatch } from '@/components/embeds/lib/parse'

function InputField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const shared = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    placeholder,
    className: 'emb-input',
  }
  return (
    <div className="emb-field">
      <label className="emb-label">{label}</label>
      {multiline ? <textarea rows={3} {...shared} /> : <input type="text" {...shared} />}
    </div>
  )
}

function Section({
  title,
  children,
  defaultOpen,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className={`emb-block${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="emb-block-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span className="emb-block-chevron" aria-hidden>
          ▼
        </span>
      </button>
      {open ? <div className="emb-block-body">{children}</div> : null}
    </div>
  )
}

interface EmbedEditorProps {
  data: EmbedData
  update: <K extends keyof EmbedData>(key: K, value: EmbedData[K]) => void
  updateAuthor: (key: keyof EmbedAuthor, value: string) => void
  updateFooter: (key: keyof EmbedFooter, value: string) => void
  addField: () => void
  updateField: (index: number, key: keyof EmbedField, value: string | boolean) => void
  removeField: (index: number) => void
  addButton: () => void
  updateButton: (index: number, key: keyof EmbedButton, value: string | boolean) => void
  removeButton: (index: number) => void
  applyEmbedPatch?: (patch: ParsedEmbedPatch) => void
}

type AutoParseField = 'content' | 'title' | 'description' | 'thumbnail' | 'image' | 'url'

export default function EmbedEditor({
  data,
  update,
  updateAuthor,
  updateFooter,
  addField,
  updateField,
  removeField,
  addButton,
  updateButton,
  removeButton,
  applyEmbedPatch,
}: EmbedEditorProps) {
  const onTextChange = (fieldKey: AutoParseField) => (newValue: string) => {
    if (!applyEmbedPatch) {
      update(fieldKey, newValue)
      return
    }
    const { cleaned, patch, matched } = extractEmbedTags(newValue)
    if (!matched) {
      update(fieldKey, newValue)
      return
    }
    applyEmbedPatch(patch)
    if (!(fieldKey in patch)) {
      update(fieldKey, cleaned.trim())
    }
  }

  return (
    <div className="emb-editor">
      <InputField
        label="Message content"
        value={data.content}
        onChange={onTextChange('content')}
        placeholder="Text outside the embed"
        multiline
      />

      <Section title="Embed body" defaultOpen>
        <div className="emb-row emb-row--color">
          <div className="emb-row-grow">
            <InputField
              label="Title"
              value={data.title}
              onChange={onTextChange('title')}
              placeholder="Embed title"
            />
          </div>
          <div className="emb-color-wrap">
            <label className="emb-label">Color</label>
            <input
              type="color"
              className="emb-color"
              value={data.color}
              onChange={(e) => update('color', e.target.value)}
            />
          </div>
        </div>
        <InputField label="URL" value={data.url} onChange={onTextChange('url')} placeholder="https://..." />
        <InputField
          label="Description"
          value={data.description}
          onChange={onTextChange('description')}
          placeholder="Embed description"
          multiline
        />
      </Section>

      <Section title="Images">
        <InputField
          label="Thumbnail URL"
          value={data.thumbnail}
          onChange={onTextChange('thumbnail')}
          placeholder="Small image (top right)"
        />
        <InputField
          label="Image URL"
          value={data.image}
          onChange={onTextChange('image')}
          placeholder="Large image (bottom)"
        />
      </Section>

      <Section title="Author">
        <InputField
          label="Name"
          value={data.author.name}
          onChange={(v) => updateAuthor('name', v)}
          placeholder="Author name"
        />
        <InputField
          label="Icon URL"
          value={data.author.icon_url}
          onChange={(v) => updateAuthor('icon_url', v)}
          placeholder="https://..."
        />
        <InputField
          label="URL"
          value={data.author.url}
          onChange={(v) => updateAuthor('url', v)}
          placeholder="https://..."
        />
      </Section>

      <Section title="Footer">
        <InputField
          label="Text"
          value={data.footer.text}
          onChange={(v) => updateFooter('text', v)}
          placeholder="Footer text"
        />
        <InputField
          label="Icon URL"
          value={data.footer.icon_url}
          onChange={(v) => updateFooter('icon_url', v)}
          placeholder="https://..."
        />
        <label className="emb-check">
          <input
            type="checkbox"
            checked={data.timestamp}
            onChange={(e) => update('timestamp', e.target.checked)}
          />
          <span>Show timestamp</span>
        </label>
      </Section>

      <Section title={`Fields (${data.fields.length})`}>
        {data.fields.map((field, i) => (
          <div key={i} className="emb-subblock">
            <div className="emb-subblock-head">
              <span>Field {i + 1}</span>
              <button type="button" className="emb-remove" onClick={() => removeField(i)}>
                Remove
              </button>
            </div>
            <InputField
              label="Name"
              value={field.name}
              onChange={(v) => updateField(i, 'name', v)}
              placeholder="Field name"
            />
            <InputField
              label="Value"
              value={field.value}
              onChange={(v) => updateField(i, 'value', v)}
              placeholder="Field value"
            />
            <label className="emb-check">
              <input
                type="checkbox"
                checked={field.inline}
                onChange={(e) => updateField(i, 'inline', e.target.checked)}
              />
              <span>Inline</span>
            </label>
          </div>
        ))}
        <button type="button" className="emb-add" onClick={addField}>
          + Add field
        </button>
      </Section>

      <Section title={`Buttons (${data.buttons.length})`}>
        {data.buttons.map((btn, i) => (
          <div key={i} className="emb-subblock">
            <div className="emb-subblock-head">
              <span>Button {i + 1}</span>
              <button type="button" className="emb-remove" onClick={() => removeButton(i)}>
                Remove
              </button>
            </div>
            <div className="emb-field">
              <label className="emb-label">Style</label>
              <select
                className="emb-select"
                value={btn.style}
                onChange={(e) => updateButton(i, 'style', e.target.value)}
              >
                {BUTTON_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              label="Label"
              value={btn.label}
              onChange={(v) => updateButton(i, 'label', v)}
              placeholder="Button text"
            />
            <InputField
              label="URL"
              value={btn.url}
              onChange={(v) => updateButton(i, 'url', v)}
              placeholder="https://..."
            />
            <InputField
              label="Emoji"
              value={btn.emoji}
              onChange={(v) => updateButton(i, 'emoji', v)}
              placeholder="Optional emoji"
            />
            <label className="emb-check">
              <input
                type="checkbox"
                checked={btn.disabled}
                onChange={(e) => updateButton(i, 'disabled', e.target.checked)}
              />
              <span>Disabled</span>
            </label>
          </div>
        ))}
        <button type="button" className="emb-add" onClick={addButton}>
          + Add button
        </button>
      </Section>
    </div>
  )
}
