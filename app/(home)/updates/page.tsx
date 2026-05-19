import { readFile } from 'fs/promises'
import path from 'path'
import type { Metadata } from 'next'
import { parseYAML, type Update } from '@/lib/marketing/parse-yaml'
import UpdatesView from '@/components/updates/updates-view'

export const metadata: Metadata = { title: 'Updates' }

export default async function UpdatesPage() {
  let updates: Update[] = []
  try {
    const text = await readFile(path.join(process.cwd(), 'data', 'updates.yaml'), 'utf-8')
    updates = parseYAML(text).sort(
      (a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime()
    )
  } catch {}

  return <UpdatesView updates={updates} />
}
