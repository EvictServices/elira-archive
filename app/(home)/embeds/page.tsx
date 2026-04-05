import type { Metadata } from 'next'
import EmbedBuilderView from './EmbedBuilderView'

export const metadata: Metadata = {
  title: 'Embed Builder',
}

export default function EmbedsPage() {
  return <EmbedBuilderView />
}
