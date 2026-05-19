'use client'

import { useEffect, useRef, useState } from 'react'
import { animateCounter, animateCounterFrom, COUNTER_ANIM_MS } from '@/lib/marketing/animate-counter'

type Props = {
  value: number | null
  duration?: number
  className?: string
}

export default function AnimatedCounter({ value, duration = COUNTER_ANIM_MS, className }: Props) {
  const [display, setDisplay] = useState('—')
  const prev = useRef<number | null>(null)

  useEffect(() => {
    if (value == null) {
      setDisplay('—')
      prev.current = null
      return
    }

    if (prev.current === value) return

    if (prev.current != null) {
      animateCounterFrom(setDisplay, prev.current, value, duration)
    } else {
      animateCounter(setDisplay, value, duration)
    }

    prev.current = value
  }, [value, duration])

  return (
    <span className={className ? `animated-counter ${className}` : 'animated-counter'}>
      {display}
    </span>
  )
}
