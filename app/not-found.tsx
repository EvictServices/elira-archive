import type { Metadata } from 'next'
import NotFoundView from '@/components/shared/not-found-view'

export const metadata: Metadata = { title: '404 — Not Found' }

export default function NotFound() {
  return <NotFoundView />
}
