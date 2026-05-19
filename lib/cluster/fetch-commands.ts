import http from 'http'
import type { Command } from '@/lib/commands/types'
import { parseCommandsCatalog } from '@/lib/commands/catalog'
import { clusterUrl } from '@/lib/cluster/config'

export async function fetchCommands(): Promise<Command[]> {
  return new Promise((resolve) => {
    http
      .get(clusterUrl('/commands'), { headers: { Accept: 'application/json' } }, (upstream) => {
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
