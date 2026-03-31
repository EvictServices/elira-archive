import type { User } from './types'

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString()
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  if (isToday) return `Today at ${time}`
  if (isYesterday) return `Yesterday at ${time}`
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ` ${time}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

export function getFallbackAvatar(discriminator?: string): string {
  const disc = Number(discriminator || '0')
  const index = Number.isFinite(disc) ? Math.abs(disc) % 5 : 0
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

export function getAvatarUrl(user: User): string {
  return user.avatar || getFallbackAvatar(user.discriminator)
}

export function parseContent(content: string, userMap: Map<string, User>): React.ReactNode[] {
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

  const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const processInline = (text: string, keyPrefix: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = []
    const inlineRegex = /(<@!?(\d+)>)|(<#(\d+)>)|(<@&(\d+)>)|(`([^`]+)`)|(\_\_(.+?)\_\_)|(\.{2}(.+?)\.{2})|(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(~~(.+?)~~)|(\|\|(.+?)\|\|)/g
    let inlineLastIndex = 0
    let inlineMatch: RegExpExecArray | null

    while ((inlineMatch = inlineRegex.exec(text)) !== null) {
      if (inlineMatch.index > inlineLastIndex) {
        nodes.push(text.slice(inlineLastIndex, inlineMatch.index))
      }

      const key = `${keyPrefix}-${inlineMatch.index}`

      if (inlineMatch[1]) {
        const userId = inlineMatch[2]
        const user = userMap.get(userId)
        const name = user ? (user.global_name || user.username) : 'Unknown User'
        nodes.push(<span key={key} style={mentionStyle}>@{name}</span>)
      } else if (inlineMatch[3]) {
        nodes.push(<span key={key} style={mentionStyle}>#channel</span>)
      } else if (inlineMatch[5]) {
        nodes.push(<span key={key} style={mentionStyle}>@role</span>)
      } else if (inlineMatch[7]) {
        nodes.push(<code key={key} style={inlineCodeStyle}>{inlineMatch[8]}</code>)
      } else if (inlineMatch[9]) {
        nodes.push(<u key={key}>{inlineMatch[10]}</u>)
      } else if (inlineMatch[13]) {
        nodes.push(<strong key={key}><em>{inlineMatch[14]}</em></strong>)
      } else if (inlineMatch[15]) {
        nodes.push(<strong key={key}>{inlineMatch[16]}</strong>)
      } else if (inlineMatch[17]) {
        nodes.push(<em key={key}>{inlineMatch[18]}</em>)
      } else if (inlineMatch[19]) {
        nodes.push(<s key={key}>{inlineMatch[20]}</s>)
      } else if (inlineMatch[21]) {
        nodes.push(
          <span key={key} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '3px', padding: '0 2px', cursor: 'pointer' }}>
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
