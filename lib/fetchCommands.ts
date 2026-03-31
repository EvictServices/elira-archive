import https from 'https'
import type { Command } from '@/app/(home)/commands/CommandsView'

export async function fetchCommands(): Promise<Command[]> {
  return new Promise((resolve) => {
    https
      .get('https://api.evict.bot/commands', { headers: { Accept: 'application/json' } }, (upstream) => {
        let data = ''
        upstream.on('data', (chunk: Buffer) => { data += chunk })
        upstream.on('end', () => {
          try {
            const parsed = JSON.parse(data)
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

            resolve(cmds)
          } catch {
            resolve([])
          }
        })
      })
      .on('error', () => resolve([]))
  })
}
