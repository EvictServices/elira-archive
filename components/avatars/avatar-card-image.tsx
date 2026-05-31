'use client'

import { useState } from 'react'
import { avatarThumbUrl } from '@/lib/avatars/image-url'

const EAGER_COUNT = 12

export default function AvatarCardImage({
  url,
  alt,
  index,
}: {
  url: string
  alt: string
  index: number
}) {
  const [loaded, setLoaded] = useState(false)
  const [src, setSrc] = useState(() => avatarThumbUrl(url))
  const eager = index < EAGER_COUNT

  return (
    <>
      <span className="avatar-card-media-placeholder" aria-hidden />
      <img
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
          if (src !== url) {
            setSrc(url)
            return
          }
          setLoaded(true)
        }}
      />
    </>
  )
}
