'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  phase: number
}

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

function scaleDots(dots: Dot[], fromW: number, fromH: number, toW: number, toH: number) {
  if (!fromW || !fromH) return
  const sx = toW / fromW
  const sy = toH / fromH
  for (const dot of dots) {
    dot.x *= sx
    dot.y *= sy
    dot.x = Math.min(Math.max(dot.x, 0), toW)
    dot.y = Math.min(Math.max(dot.y, 0), toH)
  }
}

export default function SiteDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const pointerFineRef = useRef(false)
  const coarsePointerRef = useRef(false)
  const frameRef = useRef<number | undefined>(undefined)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const slowMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointerFineMq = window.matchMedia('(pointer: fine)')
    const coarseMq = window.matchMedia('(pointer: coarse)')
    pointerFineRef.current = pointerFineMq.matches
    coarsePointerRef.current = coarseMq.matches

    const syncPointerMode = () => {
      pointerFineRef.current = pointerFineMq.matches
      coarsePointerRef.current = coarseMq.matches
      if (!pointerFineMq.matches) mouseRef.current = { x: -9999, y: -9999 }
    }

    const applyResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight
      const prev = sizeRef.current
      const widthDelta = prev.width ? Math.abs(width - prev.width) : Infinity
      const heightDelta = prev.height ? Math.abs(height - prev.height) : Infinity
      const widthChanged = !prev.width || widthDelta > 48
      const shouldScale =
        prev.width &&
        prev.height &&
        !widthChanged &&
        (widthDelta > 0 || heightDelta > 100)

      if (!dotsRef.current.length || widthChanged) {
        dotsRef.current = seedDots(width, height, slowMotion)
      } else if (shouldScale) {
        scaleDots(dotsRef.current, prev.width, prev.height, width, height)
      } else if (!prev.width || !prev.height) {
        dotsRef.current = seedDots(width, height, slowMotion)
      }

      sizeRef.current = { width, height, dpr }
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const scheduleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(applyResize, 180)
    }

    applyResize()
    window.addEventListener('resize', scheduleResize)
    if (!coarsePointerRef.current) {
      window.visualViewport?.addEventListener('resize', scheduleResize)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!pointerFineRef.current || coarsePointerRef.current) return
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    pointerFineMq.addEventListener('change', syncPointerMode)
    coarseMq.addEventListener('change', syncPointerMode)
    if (pointerFineRef.current && !coarsePointerRef.current) {
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
      const drift = !slowMotion && !coarsePointerRef.current

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]

        if (drift) {
          dot.x += dot.vx
          dot.y += dot.vy
          if (dot.x < 0 || dot.x > width) dot.vx *= -1
          if (dot.y < 0 || dot.y > height) dot.vy *= -1
        }

        if (drift && pointerFineRef.current) {
          const dx = dot.x - mouseRef.current.x
          const dy = dot.y - mouseRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150 && dist > 0) {
            const force = (150 - dist) / 150
            dot.x += (dx / dist) * force * 1.1
            dot.y += (dy / dist) * force * 1.1
          }
        }

        const pulse = drift ? 0.78 + Math.sin(t * 1.6 + dot.phase) * 0.22 : 0.82
        const alpha = dot.opacity * pulse

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', scheduleResize)
      if (!coarseMq.matches) {
        window.visualViewport?.removeEventListener('resize', scheduleResize)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      pointerFineMq.removeEventListener('change', syncPointerMode)
      coarseMq.removeEventListener('change', syncPointerMode)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div className="site-atmosphere" aria-hidden>
      <canvas ref={canvasRef} className="site-dots" />
    </div>
  )
}
