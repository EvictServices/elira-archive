'use client'

import dynamic from 'next/dynamic'

const ScrollRevealInit = dynamic(() => import('@/components/ScrollRevealInit'), { ssr: false })
const CursorEffects = dynamic(() => import('@/components/CursorEffects'), { ssr: false })

export default function ClientEffects() {
  return (
    <>
      <ScrollRevealInit />
      <CursorEffects />
    </>
  )
}
