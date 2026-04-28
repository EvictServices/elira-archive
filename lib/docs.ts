import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const docsDir = path.join(process.cwd(), 'docs')

export interface DocFrontmatter {
  title: string
  description?: string
}

export interface DocHeading {
  level: number
  text: string
  id: string
}

export interface DocData {
  frontmatter: DocFrontmatter
  content: string
  lastUpdated: Date
}

export function getDocBySlug(slug: string[]): DocData | null {
  const mdxPath = path.join(docsDir, ...slug) + '.mdx'
  const mdPath = path.join(docsDir, ...slug) + '.md'

  let filePath: string | null = null
  if (fs.existsSync(mdxPath)) filePath = mdxPath
  else if (fs.existsSync(mdPath)) filePath = mdPath

  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const { mtime } = fs.statSync(filePath)

  return {
    frontmatter: data as DocFrontmatter,
    content,
    lastUpdated: mtime,
  }
}

export function extractTOC(content: string): DocHeading[] {
  const headings: DocHeading[] = []

  for (const line of content.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[`*_[\]]/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      headings.push({ level, text, id })
    }
  }

  return headings
}
