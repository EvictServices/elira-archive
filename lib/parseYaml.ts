export interface UpdateChange {
  tag: string
  text: string
}

export interface UpdateSection {
  heading: string
  items: UpdateChange[]
}

export interface Update {
  title?: string
  date?: string
  description?: string
  changes: UpdateChange[]
  sections: UpdateSection[]
}

const TAG_HEADINGS: Record<string, string> = {
  new: 'New Features',
  improved: 'Improvements',
  fixed: 'Bug Fixes',
  removed: 'Removed',
  changed: 'Changes',
}

export function parseYAML(text: string): Update[] {
  const entries: Update[] = []
  let cur: Update | null = null
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trimEnd()
    if (trimmed === '' || trimmed.startsWith('#')) continue
    const indent = raw.length - raw.trimStart().length
    const line = trimmed.trim()

    if (indent === 0 && line.startsWith('- ')) {
      cur = { changes: [], sections: [] }
      entries.push(cur)
      const kv = line.slice(2)
      const [k, ...rest] = kv.split(':')
      if (k && rest.length) (cur as unknown as Record<string, unknown>)[k.trim()] = rest.join(':').trim()
      continue
    }
    if (!cur) continue
    if (indent === 2 && !line.startsWith('- ')) {
      const [k, ...rest] = line.split(':')
      const key = k.trim()
      const val = rest.join(':').trim()
      if (key === 'changes') continue
      ;(cur as unknown as Record<string, unknown>)[key] = val
      continue
    }
    if (indent === 4 && line.startsWith('- ')) {
      const kv = line.slice(2)
      const [tag, ...rest] = kv.split(':')
      if (tag && rest.length) {
        cur.changes.push({ tag: tag.trim(), text: rest.join(':').trim() })
      }
      continue
    }
  }

  const order = ['new', 'improved', 'changed', 'fixed', 'removed']
  for (const entry of entries) {
    const grouped: Record<string, UpdateChange[]> = {}
    for (const c of entry.changes) {
      if (!grouped[c.tag]) grouped[c.tag] = []
      grouped[c.tag].push(c)
    }
    entry.sections = []
    for (const tag of order) {
      if (grouped[tag]) {
        entry.sections.push({ heading: TAG_HEADINGS[tag] ?? tag, items: grouped[tag] })
        delete grouped[tag]
      }
    }
    for (const [tag, items] of Object.entries(grouped)) {
      entry.sections.push({ heading: TAG_HEADINGS[tag] ?? tag, items })
    }
  }

  return entries
}

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return ''
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const days = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (days < 0) return 'today'
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`
  const years = Math.floor(months / 12)
  return years === 1 ? '1 year ago' : `${years} years ago`
}
