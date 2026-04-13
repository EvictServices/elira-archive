import type { Metadata } from 'next'
import CommandsView from './CommandsView'

export const metadata: Metadata = {
  title: 'Commands',
}

export default function CommandsPage() {
  return <CommandsView />
}
