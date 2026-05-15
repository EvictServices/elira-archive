import http from 'http'
import type { Command } from '@/app/(home)/commands/CommandsView'
import { parseCommandsCatalog } from '@/lib/commands/catalog'

export async function fetchCommands(): Promise<Command[]> {
  return new Promise((resolve) => {
    http
      .get('http://127.0.0.1:8000/commands', { headers: { Accept: 'application/json' } }, (upstream) => {
        let data = ''
        upstream.on('data', (chunk: Buffer) => { data += chunk })
        upstream.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            const catalog = parseCommandsCatalog(parsed)
            resolve(
              catalog.map((c) => ({
                name: c.name,
                description: c.description,
                category: c.category,
                aliases: [],
                signature: '',
                permissions: [],
                example: '',
              }))
            )
          } catch {
            resolve([])
          }
        })
      })
      .on('error', () => resolve([]))
  })
}
