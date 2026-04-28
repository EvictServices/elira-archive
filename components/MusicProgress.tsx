'use client'

import { useState, useEffect, useRef } from 'react'

const TOTAL_SECONDS = 197

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MusicProgress() {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Date.now() - startRef.current) / 1000
      setElapsed(delta % TOTAL_SECONDS)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pct = (elapsed / TOTAL_SECONDS) * 100

  return (
    <div className="discord-embed-progress">
      <div className="discord-embed-progress-bar">
        <div className="discord-embed-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="discord-embed-progress-times">
        <span>{formatTime(elapsed)}</span>
        <span>3:17</span>
      </div>
    </div>
  )
}
