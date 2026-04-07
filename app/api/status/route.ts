import { proxyGet } from '@/lib/proxyGet'

export function GET() {
  return proxyGet('http://127.0.0.1:8000/health', (json) => (json as { system?: unknown }).system || {})
}
