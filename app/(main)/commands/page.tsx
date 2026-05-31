import type { Metadata } from 'next'
import CommandsView from '@/components/commands/commands-view'

export const metadata: Metadata = {
  title: 'Commands',
}

export default function CommandsPage() {
  return <CommandsView />
}
