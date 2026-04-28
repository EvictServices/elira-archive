import { NextRequest, NextResponse } from 'next/server'
import { getDocBySlug } from '@/lib/docs'
import { docsNav, NavItem } from '@/lib/docs-nav'

function stripMarkdown(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_[\]()>|\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSections(content: string) {
  const lines = content.replace(/^---[\s\S]*?---/, '').split('\n')
  const sections: Array<{ heading: string; id: string; textLines: string[] }> = []
  let intro: string[] = []
  let current: { heading: string; id: string; textLines: string[] } | null = null

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      if (current) sections.push(current)
      const text = match[2].replace(/[`*_[\]]/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      current = { heading: text, id, textLines: [] }
    } else if (current) {
      current.textLines.push(line)
    } else {
      intro.push(line)
    }
  }
  if (current) sections.push(current)

  return {
    intro: stripMarkdown(intro.join(' ')),
    sections: sections.map((s) => ({
      heading: s.heading,
      id: s.id,
      text: stripMarkdown(s.textLines.join(' ')),
    })),
  }
}

function getSnippet(text: string, q: string, radius = 80): string {
  const lower = text.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx === -1) return text.slice(0, radius * 2) + (text.length > radius * 2 ? '…' : '')
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + q.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

export interface SectionResult {
  title: string
  href: string
  snippet?: string
}

export interface GroupedResult {
  group: string
  pageTitle: string
  pageHref: string
  sections: SectionResult[]
}

function flattenItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...flattenItems(item.items ?? [])])
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const grouped: GroupedResult[] = []

  for (const navGroup of docsNav) {
    for (const item of flattenItems(navGroup.items)) {
      const slug = item.href.replace('/docs/', '').split('/')
      const doc = getDocBySlug(slug)
      if (!doc) continue

      const { title, description } = doc.frontmatter
      const { intro, sections } = extractSections(doc.content)

      const matchedSections: SectionResult[] = []

      const introText = [description, intro].filter(Boolean).join(' ')
      if (
        title.toLowerCase().includes(q) ||
        introText.toLowerCase().includes(q)
      ) {
        matchedSections.push({
          title,
          href: item.href,
          snippet: introText ? getSnippet(introText, q) : description,
        })
      }

      for (const section of sections) {
        const headingMatch = section.heading.toLowerCase().includes(q)
        const bodyMatch = section.text.toLowerCase().includes(q)
        if (headingMatch || bodyMatch) {
          matchedSections.push({
            title: section.heading,
            href: `${item.href}#${section.id}`,
            snippet: section.text ? getSnippet(section.text, q) : undefined,
          })
        }
      }

      if (matchedSections.length > 0) {
        grouped.push({
          group: navGroup.title,
          pageTitle: title,
          pageHref: item.href,
          sections: matchedSections,
        })
      }
    }
  }

  return NextResponse.json(grouped)
}
