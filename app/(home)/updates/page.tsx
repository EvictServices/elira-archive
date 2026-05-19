import type { Metadata } from 'next'
import { loadUpdates } from '@/lib/marketing/load-updates'
import UpdatesView from '@/components/updates/updates-view'

export const metadata: Metadata = { title: 'Updates' }

export default async function UpdatesPage() {
  const updates = await loadUpdates()
  return <UpdatesView updates={updates} />
}
