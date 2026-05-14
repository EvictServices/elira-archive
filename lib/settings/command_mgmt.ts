export const CMD_MAX = 96
export const CMD_RE = /^[a-z0-9][a-z0-9 _-]*$/i

export function normalizeCommand(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim().replace(/\s+/g, ' ')
  if (s.length < 1 || s.length > CMD_MAX) return null
  if (!CMD_RE.test(s)) return null
  if (/^command(\s|$)/i.test(s)) return null
  return s
}

export function normalizeSnowflakeList(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null
  const out: string[] = []
  for (const x of raw) {
    if (typeof x !== 'string' && typeof x !== 'number') return null
    const id = String(x).trim()
    if (!/^\d{17,20}$/.test(id)) return null
    out.push(id)
  }
  return [...new Set(out)]
}

export function normalizeSnowflake(raw: unknown): string | null {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null
  const id = String(raw).trim()
  if (!/^\d{17,20}$/.test(id)) return null
  return id
}
