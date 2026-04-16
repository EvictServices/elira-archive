import { readFile } from 'fs/promises'
import path from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { parseYAML, type Update } from '@/lib/parseYaml'
import UpdatesView from '../UpdatesView'

async function getUpdates(): Promise<Update[]> {
  try {
    const text = await readFile(path.join(process.cwd(), 'data', 'updates.yaml'), 'utf-8')
    return parseYAML(text).sort(
      (a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime()
    )
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const updates = await getUpdates()
  const entryNum = parseInt(id, 10)
  const idx = updates.length - entryNum
  const entry = idx >= 0 && idx < updates.length ? updates[idx] : null
  return {
    title: entry?.title || 'Updates',
  }
}

export default async function UpdateEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updates = await getUpdates()
  const entryNum = parseInt(id, 10)
  const idx = updates.length - entryNum

  if (isNaN(entryNum) || idx < 0 || idx >= updates.length) {
    notFound()
  }

  return <UpdatesView updates={updates} initialIndex={idx} />
}
