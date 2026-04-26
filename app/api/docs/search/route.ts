import { NextRequest, NextResponse } from 'next/server'
import { getDocBySlug, extractTOC } from '@/lib/docs'
import { docsNav } from '@/lib/docs-nav'

function stripMarkdown(content: string): string {
  return content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_[\]()>|\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const results = []

  for (const group of docsNav) {
    for (const item of group.items) {
      const slug = item.href.replace('/docs/', '').split('/')
      const doc = getDocBySlug(slug)
      if (!doc) continue

      const { title, description } = doc.frontmatter
      const headings = extractTOC(doc.content)
      const plain = stripMarkdown(doc.content)

      const titleHit = title.toLowerCase().includes(q)
      const descHit = description?.toLowerCase().includes(q)
      const contentHit = plain.toLowerCase().includes(q)
      const headingHit = headings.some((h) => h.text.toLowerCase().includes(q))

      if (!titleHit && !descHit && !contentHit && !headingHit) continue

      let snippet = ''
      if (contentHit) {
        const idx = plain.toLowerCase().indexOf(q)
        const start = Math.max(0, idx - 55)
        const end = Math.min(plain.length, idx + q.length + 55)
        snippet =
          (start > 0 ? '…' : '') +
          plain.slice(start, end) +
          (end < plain.length ? '…' : '')
      } else if (descHit && description) {
        snippet = description
      }

      results.push({ title, href: item.href, snippet })
    }
  }

  return NextResponse.json(results)
}
