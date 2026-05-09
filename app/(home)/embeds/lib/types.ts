export interface EmbedField {
  name: string
  value: string
  inline: boolean
}

export interface EmbedAuthor {
  name: string
  icon_url: string
  url: string
}

export interface EmbedFooter {
  text: string
  icon_url: string
}

export interface EmbedButton {
  style: string
  label: string
  url: string
  emoji: string
  disabled: boolean
}

export interface EmbedData {
  content: string
  color: string
  title: string
  url: string
  description: string
  thumbnail: string
  image: string
  author: EmbedAuthor
  footer: EmbedFooter
  fields: EmbedField[]
  buttons: EmbedButton[]
  timestamp: boolean
}

export function defaultEmbed(): EmbedData {
  return {
    content: '',
    color: '#2b2d31',
    title: '',
    url: '',
    description: '',
    thumbnail: '',
    image: '',
    author: { name: '', icon_url: '', url: '' },
    footer: { text: '', icon_url: '' },
    fields: [],
    buttons: [],
    timestamp: false,
  }
}

export function generateScript(data: EmbedData): string {
  const lines: string[] = []

  if (data.content) lines.push(`{content: ${data.content}}`)

  const hasEmbed = data.title || data.description || data.color !== '#2b2d31' ||
    data.thumbnail || data.image || data.author.name || data.footer.text ||
    data.fields.length > 0 || data.url || data.timestamp

  if (hasEmbed) {
    lines.push('{embed}')
    if (data.color && data.color !== '#2b2d31') lines.push(`{color: ${data.color}}`)
    if (data.url) lines.push(`{url: ${data.url}}`)
    if (data.title) lines.push(`{title: ${data.title}}`)
    if (data.description) lines.push(`{description: ${data.description}}`)
    if (data.thumbnail) lines.push(`{thumbnail: ${data.thumbnail}}`)
    if (data.image) lines.push(`{image: ${data.image}}`)

    for (const field of data.fields) {
      if (field.name && field.value) {
        const parts = [field.name, field.value]
        if (field.inline) parts.push('inline')
        lines.push(`{field: ${parts.join(' && ')}}`)
      }
    }

    if (data.footer.text) {
      const parts = [data.footer.text]
      if (data.footer.icon_url) parts.push(data.footer.icon_url)
      lines.push(`{footer: ${parts.join(' && ')}}`)
    }

    if (data.author.name) {
      const parts = [data.author.name, data.author.url || 'null']
      if (data.author.icon_url) parts.push(data.author.icon_url)
      lines.push(`{author: ${parts.join(' && ')}}`)
    }

    if (data.timestamp) lines.push('{timestamp}')
  }

  for (const btn of data.buttons) {
    if (btn.label && btn.url) {
      const parts = [btn.style, btn.label, btn.url]
      if (btn.emoji) parts.push(btn.emoji)
      if (btn.disabled) parts.push('disabled')
      lines.push(`{button: ${parts.join(' && ')}}`)
    }
  }

  return lines.join('\n')
}

/** Best-effort inverse of {@link generateScript} for dashboard round-trip (Elara `welcome_message.template`). */
export function parseScriptToEmbed(template: string): EmbedData {
  const data = defaultEmbed()
  const lines = template
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  for (const line of lines) {
    if (line === '{embed}') continue
    if (line === '{timestamp}') {
      data.timestamp = true
      continue
    }

    if (!line.startsWith('{') || !line.endsWith('}')) continue
    const inner = line.slice(1, -1)
    const colon = inner.indexOf(':')
    if (colon === -1) continue
    const tag = inner.slice(0, colon)
    const rest = inner.slice(colon + 1)

    switch (tag) {
      case 'content':
        data.content = rest
        break
      case 'color':
        data.color = rest
        break
      case 'url':
        data.url = rest
        break
      case 'title':
        data.title = rest
        break
      case 'description':
        data.description = rest
        break
      case 'thumbnail':
        data.thumbnail = rest
        break
      case 'image':
        data.image = rest
        break
      case 'field': {
        const parts = rest.split(' && ').map((p) => p.trim())
        if (parts.length < 2) break
        const inline = parts[parts.length - 1] === 'inline'
        const name = parts[0]
        const value = inline ? parts.slice(1, -1).join(' && ') : parts.slice(1).join(' && ')
        if (name && value) data.fields.push({ name, value, inline })
        break
      }
      case 'footer': {
        const parts = rest.split(' && ').map((p) => p.trim())
        data.footer.text = parts[0] ?? ''
        if (parts[1]) data.footer.icon_url = parts[1]
        break
      }
      case 'author': {
        const parts = rest.split(' && ').map((p) => p.trim())
        if (parts[0]) data.author.name = parts[0]
        if (parts[1] && parts[1] !== 'null') data.author.url = parts[1]
        if (parts[2]) data.author.icon_url = parts[2]
        break
      }
      case 'button': {
        const parts = rest.split(' && ').map((p) => p.trim())
        if (parts.length < 3) break
        const style = parts[0] || 'link'
        const label = parts[1] || ''
        const url = parts[2] || ''
        let emoji = ''
        const disabled = parts.includes('disabled')
        for (const p of parts.slice(3)) {
          if (p !== 'disabled' && !emoji) emoji = p
        }
        if (label && url) {
          data.buttons.push({ style, label, url, emoji, disabled })
        }
        break
      }
      default:
        break
    }
  }

  return data
}
