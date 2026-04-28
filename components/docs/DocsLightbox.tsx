'use client'

import { useEffect, useRef, useState } from 'react'

export default function DocsLightbox() {
  const [src, setSrc] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.docs-prose')) {
        const img = target as HTMLImageElement
        setSrc(img.src)
        setAlt(img.alt)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSrc(null)
    }
    if (src) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [src])

  if (!src) return null

  return (
    <div
      ref={overlayRef}
      className="lightbox-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) setSrc(null) }}
    >
      <div className="lightbox-frame">
        <button className="lightbox-close" onClick={() => setSrc(null)} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <img src={src} alt={alt} className="lightbox-img" />
      </div>
    </div>
  )
}
