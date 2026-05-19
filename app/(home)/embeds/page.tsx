import type { Metadata } from 'next'
import EmbedBuilderView from '@/components/embeds/embed-builder-view'

export const metadata: Metadata = {
  title: 'Embed Builder',
}

export default function EmbedsPage() {
  return <EmbedBuilderView />
}
