import type { Metadata } from 'next'
import { fetchCommands } from '@/lib/cluster/fetch-commands'
import CommandsView from '@/components/commands/commands-view'

export const metadata: Metadata = {
  title: 'Commands',
}

export default async function CommandsPage() {
  const commands = await fetchCommands()
  return <CommandsView commands={commands} />
}
