import { readFile } from 'fs/promises'
import path from 'path'
import { parseYAML, type Update } from '@/lib/parseYaml'
import UpdatesView from './UpdatesView'

export const metadata = { title: 'Updates' }

export default async function UpdatesPage() {
  let updates: Update[] = []
  try {
    const text = await readFile(path.join(process.cwd(), 'data', 'updates.yaml'), 'utf-8')
    updates = parseYAML(text).sort(
      (a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime()
    )
  } catch { /* no file or parse error — show empty state */ }

  return <UpdatesView updates={updates} />
}
