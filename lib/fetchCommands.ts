import type { Command } from '@/app/(home)/commands/CommandsView'

export async function fetchCommands(): Promise<Command[]> {
  try {
    const res = await fetch('http://127.0.0.1:8000/commands', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const parsed = await res.json()
    const cmdMap: Record<string, unknown[]> = parsed?.data?.commands ?? parsed?.commands ?? parsed ?? {}

    const rawCmds: Command[] = []
    if (typeof cmdMap === 'object' && !Array.isArray(cmdMap)) {
      Object.entries(cmdMap).forEach(([category, cmds]) => {
        if (!Array.isArray(cmds)) return
        cmds.forEach((cmd: unknown) => {
          rawCmds.push({ ...(cmd as object), category } as Command)
        })
      })
    }

    const seen = new Set<string>()
    const cmds = rawCmds
      .filter((c) => !(c as { hidden?: boolean }).hidden && (c.category || '').toLowerCase() !== 'jishaku')
      .map((c, i) => ({
        name: (c as { qualified_name?: string }).qualified_name || c.name || `cmd${i}`,
        description: c.description || (c as { help?: string }).help || '',
        category: c.category || 'Uncategorized',
        aliases: c.aliases || [],
        signature: c.signature || '',
        permissions: c.permissions || [],
        example: c.example || '',
      } as Command))
      .filter((c) => { if (seen.has(c.name)) return false; seen.add(c.name); return true })

    return cmds
  } catch {
    return []
  }
}
