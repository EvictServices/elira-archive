'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to `matchMedia` with correct initial value on the client (no one-frame false).
 * Server snapshot is always false; suppress hydration warnings on elements that depend on this if needed.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', onStoreChange)
      return () => m.removeEventListener('change', onStoreChange)
    },
    [query]
  )

  const getSnapshot = () => window.matchMedia(query).matches

  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
