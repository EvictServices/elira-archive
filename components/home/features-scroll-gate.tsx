'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const MIN_SCROLL_PX = 120

export default function FeaturesScrollGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [peekMaskPx, setPeekMaskPx] = useState(0)
  const unlockedRef = useRef(false)

  useEffect(() => {
    const root = document.querySelector('.home-page')
    const scrollToFeatures = () => {
      requestAnimationFrame(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    const tryUnlock = (scroll = false) => {
      if (unlockedRef.current) return
      unlockedRef.current = true
      setUnlocked(true)
      root?.classList.add('home-page--features-unlocked')
      if (scroll) scrollToFeatures()
    }

    if (window.location.hash === '#features') {
      tryUnlock(true)
      return
    }

    let raf = 0
    const checkUnlock = () => {
      if (unlockedRef.current) return
      if (window.scrollY < MIN_SCROLL_PX) return

      const hero = document.querySelector('.hero')
      if (!hero) return

      const { bottom } = hero.getBoundingClientRect()
      if (bottom <= window.innerHeight * 0.72) {
        tryUnlock()
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(checkUnlock)
    }

    const onHash = () => {
      if (window.location.hash === '#features') tryUnlock(true)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('hashchange', onHash)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  /* Cover only the slice of features that peeks above the viewport bottom at scroll top */
  useEffect(() => {
    if (!unlocked) return

    let raf = 0
    const syncMask = () => {
      const features = document.getElementById('features')
      if (!features) {
        setPeekMaskPx(0)
        return
      }

      const atTop = window.scrollY < 160
      if (!atTop) {
        setPeekMaskPx(0)
        return
      }

      const featTop = features.getBoundingClientRect().top
      const overlap = Math.ceil(window.innerHeight - featTop)
      setPeekMaskPx(overlap > 8 ? overlap + 24 : 0)
    }

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(syncMask)
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    syncMask()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      setPeekMaskPx(0)
    }
  }, [unlocked])

  if (!unlocked) {
    return <div id="features" className="feat-placeholder" aria-hidden="true" />
  }

  return (
    <>
      {peekMaskPx > 0 && (
        <div
          className="home-peek-mask"
          style={{ height: peekMaskPx }}
          aria-hidden
        />
      )}
      {children}
    </>
  )
}
