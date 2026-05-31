'use client'

import { Fragment } from 'react'

const mentionStyle = {
  background: 'rgba(88,101,242,0.3)',
  color: '#dee0fc',
  padding: '0 2px',
  borderRadius: '3px',
  fontWeight: 500,
  cursor: 'pointer',
}

const channelStyle = {
  ...mentionStyle,
}

const codeBlockStyle = {
  background: '#2b2d31',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '4px',
  padding: '0.5rem',
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  color: '#dcddde',
  display: 'block' as const,
  whiteSpace: 'pre-wrap' as const,
  margin: '0.25rem 0',
}

const inlineCodeStyle = {
  background: '#2b2d31',
  padding: '0.1rem 0.35rem',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  color: '#dcddde',
}

type TextNode = string | { type: string; content: React.ReactNode; href?: string }

function parseMarkdown(text: string): TextNode[] {
  const nodes: TextNode[] = []
  let remaining = text

  const patterns: [RegExp, (m: RegExpMatchArray) => TextNode][] = [
    [/^```(?:\w*\n)?([\s\S]*?)```/, m => ({ type: 'codeblock', content: m[1] })],
    [/^`([^`]+)`/, m => ({ type: 'code', content: m[1] })],
    [/^\*\*\*(.+?)\*\*\*/, m => ({ type: 'bolditalic', content: m[1] })],
    [/^\*\*(.+?)\*\*/, m => ({ type: 'bold', content: m[1] })],
    [/^\*(.+?)\*/, m => ({ type: 'italic', content: m[1] })],
    [/^__(.+?)__/, m => ({ type: 'underline', content: m[1] })],
    [/^~~(.+?)~~/, m => ({ type: 'strike', content: m[1] })],
    [/^\|\|(.+?)\|\|/, m => ({ type: 'spoiler', content: m[1] })],
    [/^> (.+?)(?:\n|$)/, m => ({ type: 'quote', content: m[1] })],
    [/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/, m => ({ type: 'link', content: m[1], href: m[2] })],
    [/^\{user\.mention\}/, () => ({ type: 'mention', content: '@user' })],
    [/^\{user\.name\}/, () => ({ type: 'text-var', content: 'user' })],
    [/^\{user\.display_name\}/, () => ({ type: 'text-var', content: 'Display Name' })],
    [/^\{user\}/, () => ({ type: 'text-var', content: 'user' })],
    [/^\{moderator\.mention\}/, () => ({ type: 'mention', content: '@moderator' })],
    [/^\{moderator\.name\}/, () => ({ type: 'text-var', content: 'moderator' })],
    [/^\{moderator\.display_name\}/, () => ({ type: 'text-var', content: 'Moderator' })],
    [/^\{moderator\}/, () => ({ type: 'mention', content: '@moderator' })],
    [/^\{channel\.mention\}/, () => ({ type: 'channel', content: '#channel' })],
    [/^\{channel\.name\}/, () => ({ type: 'text-var', content: 'channel' })],
    [/^\{guild\.name\}/, () => ({ type: 'text-var', content: 'Server Name' })],
    [/^\{guild\}/, () => ({ type: 'text-var', content: 'Server Name' })],
    [/^\{reason\}/, () => ({ type: 'text-var', content: 'No reason provided' })],
    [/^\{[a-z._]+\}/, m => ({ type: 'variable', content: m[0] })],
  ]

  while (remaining.length > 0) {
    let matched = false
    for (const [pattern, handler] of patterns) {
      const match = remaining.match(pattern)
      if (match) {
        if (nodes.length > 0 || match.index! > 0) {
          const before = remaining.slice(0, match.index!)
          if (before) nodes.push(before)
        }
        nodes.push(handler(match))
        remaining = remaining.slice(match[0].length)
        matched = true
        break
      }
    }
    if (!matched) {
      const nextSpecial = remaining.slice(1).search(/[`*_~|>\[{]/)
      if (nextSpecial === -1) {
        nodes.push(remaining)
        break
      }
      nodes.push(remaining.slice(0, nextSpecial + 1))
      remaining = remaining.slice(nextSpecial + 1)
    }
  }

  return nodes
}

function RenderNode({ node, index }: { node: TextNode; index: number }) {
  if (typeof node === 'string') return <Fragment key={index}>{node}</Fragment>

  switch (node.type) {
    case 'bold':
      return <strong key={index} style={{ color: '#fff', fontWeight: 700 }}>{renderInline(node.content as string)}</strong>
    case 'italic':
      return <em key={index}>{renderInline(node.content as string)}</em>
    case 'bolditalic':
      return <strong key={index} style={{ color: '#fff', fontWeight: 700 }}><em>{renderInline(node.content as string)}</em></strong>
    case 'underline':
      return <u key={index}>{renderInline(node.content as string)}</u>
    case 'strike':
      return <s key={index} style={{ textDecoration: 'line-through' }}>{renderInline(node.content as string)}</s>
    case 'code':
      return <code key={index} style={inlineCodeStyle}>{node.content}</code>
    case 'codeblock':
      return <code key={index} style={codeBlockStyle}>{node.content}</code>
    case 'spoiler':
      return <span key={index} style={{ background: '#202225', color: '#202225', borderRadius: '3px', padding: '0 2px', cursor: 'pointer' }}>{node.content}</span>
    case 'quote':
      return (
        <div key={index} style={{ borderLeft: '3px solid #4e5058', paddingLeft: '0.5rem', margin: '0.15rem 0' }}>
          {renderInline(node.content as string)}
        </div>
      )
    case 'link':
      return <span key={index} style={{ color: '#00aff4', textDecoration: 'none' }}>{node.content}</span>
    case 'mention':
      return <span key={index} style={mentionStyle}>{node.content}</span>
    case 'channel':
      return <span key={index} style={channelStyle}>{node.content}</span>
    case 'text-var':
      return <span key={index}>{node.content}</span>
    case 'variable':
      return <span key={index} style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.85em' }}>{node.content}</span>
    default:
      return <Fragment key={index}>{node.content}</Fragment>
  }
}

function renderInline(text: string): React.ReactNode {
  const nodes = parseMarkdown(text)
  return nodes.map((n, i) => <RenderNode key={i} node={n} index={i} />)
}

export default function DiscordMarkdown({ text }: { text: string }) {
  if (!text) return null
  const nodes = parseMarkdown(text)
  return (
    <span>
      {nodes.map((n, i) => (
        <RenderNode key={i} node={n} index={i} />
      ))}
    </span>
  )
}
