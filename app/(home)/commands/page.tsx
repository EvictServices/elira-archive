import type { Metadata } from 'next'
import { fetchCommands } from '@/lib/fetchCommands'
import CommandsView from './CommandsView'

export const metadata: Metadata = {
  title: 'Commands',
}

export default async function CommandsPage() {
  const commands = await fetchCommands()
  return <CommandsView commands={commands} />
}
