import { readFile } from 'fs/promises'
import path from 'path'
import { parseYAML, type Update } from '@/lib/marketing/parse-yaml'

const UPDATES_PATH = path.join(process.cwd(), 'lib', 'marketing', 'updates.yaml')

export async function loadUpdates(): Promise<Update[]> {
  try {
    const text = await readFile(UPDATES_PATH, 'utf-8')
    return parseYAML(text).sort(
      (a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime()
    )
  } catch {
    return []
  }
}
