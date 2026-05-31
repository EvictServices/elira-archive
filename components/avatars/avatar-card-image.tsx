'use client'

import { useEffect, useRef, useState } from 'react'
import { avatarThumbUrl } from '@/lib/avatars/image-url'

const EAGER_COUNT = 12

function imageReady(img: HTMLImageElement | null): boolean {
  return Boolean(img?.complete && img.naturalWidth > 0)
}

export default function AvatarCardImage({
  url,
  alt,
  index,
}: {
  url: string
  alt: string
  index: number
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const thumbSrc = avatarThumbUrl(url)
  const [src, setSrc] = useState(thumbSrc)
  const [loaded, setLoaded] = useState(false)
  const eager = index < EAGER_COUNT

  useEffect(() => {
    setSrc(thumbSrc)
    setLoaded(false)
  }, [thumbSrc])

  useEffect(() => {
    if (imageReady(imgRef.current)) setLoaded(true)
  }, [src])

  return (
    <>
      <span className="avatar-card-media-placeholder" aria-hidden />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={loaded ? 'is-loaded' : ''}
        width={160}
        height={160}
        decoding="async"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={index < 6 ? 'high' : index < EAGER_COUNT ? 'low' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (src !== url) setSrc(url)
        }}
      />
    </>
  )
}
