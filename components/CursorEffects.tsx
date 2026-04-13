'use client'

import { useEffect, useRef } from 'react'

export default function CursorEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<{ x: number; y: number; opacity: number }[]>([])
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let resizeTimer: ReturnType<typeof setTimeout>
    const resize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }, 150)
    }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.addEventListener('resize', resize)

    let lastMoveTime = 0
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMoveTime < 32) return
      lastMoveTime = now
      trailRef.current.push({ x: e.clientX, y: e.clientY, opacity: 0.6 })
      if (trailRef.current.length > 15) trailRef.current.shift()
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    let running = true
    const handleVisibility = () => {
      if (document.hidden) {
        running = false
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
      } else {
        running = true
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const animate = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      trailRef.current.forEach((point, i) => {
        point.opacity *= 0.92
        if (point.opacity < 0.01) return

        const size = 4 - i * 0.15
        ctx.beginPath()
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity * 0.3})`
        ctx.fill()
      })
      trailRef.current = trailRef.current.filter(p => p.opacity > 0.01)

      frameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      running = false
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999,
        opacity: 1,
        mixBlendMode: 'screen',
      }}
    />
  )
}
