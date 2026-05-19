import { proxyGet } from '@/lib/cluster/proxy'
import { parseCommandsCatalog } from '@/lib/commands/catalog'

export function GET() {
  return proxyGet('http://127.0.0.1:8000/commands', (data) => ({
    commands: parseCommandsCatalog(data),
  }))
}
