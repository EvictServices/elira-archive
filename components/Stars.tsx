'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
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

    const dotCount = 35
    for (let i = 0; i < dotCount; i++) {
      dotsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 2.5,
        opacity: 0.15 + Math.random() * 0.25,
      })
    }

    let lastMouseTime = 0
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMouseTime < 50) return
      lastMouseTime = now
      mouseRef.current = { x: e.clientX, y: e.clientY }
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

      dotsRef.current.forEach((dot) => {
        dot.x += dot.vx
        dot.y += dot.vy

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1

        const dx = dot.x - mouseRef.current.x
        const dy = dot.y - mouseRef.current.y
        const distSq = dx * dx + dy * dy
        if (distSq < 22500) {
          const dist = Math.sqrt(distSq)
          const force = (150 - dist) / 150
          dot.x += (dx / dist) * force * 0.8
          dot.y += (dy / dist) * force * 0.8
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`
        ctx.fill()
      })

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
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.8,
      }}
    />
  )
}
