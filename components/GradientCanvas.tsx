'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

type GradientWindow = Window & { Gradient?: new () => { initGradient: (s: string) => void } }

export default function GradientCanvas() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return

    const w = window as GradientWindow

    const init = () => {
      if (w.Gradient) {
        try { new w.Gradient().initGradient('#gradient-canvas') } catch { /* ignore */ }
      }
    }

    if (w.Gradient) {
      init()
    } else {
      const timer = setInterval(() => {
        if (w.Gradient) { clearInterval(timer); init() }
      }, 50)
      return () => clearInterval(timer)
    }
  }, [pathname])

  if (pathname !== '/') return null

  return <canvas id="gradient-canvas" data-transition-in="" />
}
