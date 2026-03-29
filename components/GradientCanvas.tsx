'use client'

import { useEffect } from 'react'

type GradientWindow = Window & { Gradient?: new () => { initGradient: (s: string) => void } }

export default function GradientCanvas() {
  useEffect(() => {
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
  }, [])

  return <canvas id="gradient-canvas" data-transition-in="" />
}
