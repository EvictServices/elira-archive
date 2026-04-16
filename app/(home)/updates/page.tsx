import { readFile } from 'fs/promises'
import path from 'path'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { parseYAML } from '@/lib/parseYaml'

export const metadata: Metadata = {
  title: 'Updates',
}

export default async function UpdatesPage() {
  let count = 1
  try {
    const text = await readFile(path.join(process.cwd(), 'data', 'updates.yaml'), 'utf-8')
    count = parseYAML(text).length || 1
  } catch {}

  redirect(`/updates/${count}`)
}
