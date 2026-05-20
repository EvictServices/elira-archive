'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  phase: number
}

const LINK_DIST = 95

function dotCountForViewport(width: number, height: number) {
  if (width < 768) {
    return Math.min(50, Math.max(32, Math.floor((width * height) / 24_000)))
  }
  return Math.min(120, Math.max(55, Math.floor((width * height) / 14_000)))
}

function seedDots(width: number, height: number, slow: boolean): Dot[] {
  const count = dotCountForViewport(width, height)
  const speed = slow ? 0.14 : 0.38
  const dots: Dot[] = []
  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: 1.2 + Math.random() * 2.4,
      opacity: 0.28 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return dots
}

export default function SiteDots() {
  const pathname = usePathname()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const pointerFineRef = useRef(false)
  const lastTouchAtRef = useRef(0)
  const frameRef = useRef<number | undefined>(undefined)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const drawLinksRef = useRef(true)

  drawLinksRef.current = pathname !== '/'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const slowMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointerFineMq = window.matchMedia('(pointer: fine)')
    pointerFineRef.current = pointerFineMq.matches

    const onPointerFineChange = (e: MediaQueryListEvent) => {
      pointerFineRef.current = e.matches
      if (!e.matches) mouseRef.current = { x: -9999, y: -9999 }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight
      sizeRef.current = { width, height, dpr }

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      dotsRef.current = seedDots(width, height, slowMotion)
    }

    resize()
    window.addEventListener('resize', resize)

    const markTouch = () => {
      lastTouchAtRef.current = Date.now()
      mouseRef.current = { x: -9999, y: -9999 }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!pointerFineRef.current) return
      if (Date.now() - lastTouchAtRef.current < 500) return
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    pointerFineMq.addEventListener('change', onPointerFineChange)
    window.addEventListener('touchstart', markTouch, { passive: true })
    window.addEventListener('touchmove', markTouch, { passive: true })
    if (pointerFineRef.current) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    const animate = (time: number) => {
      const { width, height } = sizeRef.current
      if (!width || !height) {
        frameRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, width, height)

      const dots = dotsRef.current
      const t = time * 0.001

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        dot.x += dot.vx
        dot.y += dot.vy

        if (dot.x < 0 || dot.x > width) dot.vx *= -1
        if (dot.y < 0 || dot.y > height) dot.vy *= -1

        if (!slowMotion && pointerFineRef.current) {
          const dx = dot.x - mouseRef.current.x
          const dy = dot.y - mouseRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150 && dist > 0) {
            const force = (150 - dist) / 150
            dot.x += (dx / dist) * force * 1.1
            dot.y += (dy / dist) * force * 1.1
          }
        }

        const pulse = 0.78 + Math.sin(t * 1.6 + dot.phase) * 0.22
        const alpha = dot.opacity * pulse

        if (drawLinksRef.current) {
          for (let j = i + 1; j < dots.length; j++) {
            const other = dots[j]
            const lx = dot.x - other.x
            const ly = dot.y - other.y
            const ld = Math.sqrt(lx * lx + ly * ly)
            if (ld > LINK_DIST) continue
            const lineAlpha = (1 - ld / LINK_DIST) * 0.14 * pulse
            ctx.beginPath()
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', markTouch)
      window.removeEventListener('touchmove', markTouch)
      pointerFineMq.removeEventListener('change', onPointerFineChange)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div className="site-atmosphere" aria-hidden>
      <canvas ref={canvasRef} className="site-dots" />
    </div>
  )
}
