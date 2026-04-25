'use client'

import { useEffect, useState } from 'react'
import type { DocHeading } from '@/lib/docs'

interface Props {
  items: DocHeading[]
}

export default function DocsTOC({ items }: Props) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-64px 0px -60% 0px', threshold: 0 },
    )

    const els = document.querySelectorAll<HTMLElement>('h2[id], h3[id]')
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <aside className="docs-toc">
      <span className="docs-toc-title">On this page</span>
      <ul className="docs-toc-list">
        {items.map((item) => (
          <li key={item.id} className={`docs-toc-item docs-toc-h${item.level}`}>
            <a href={`#${item.id}`} className={active === item.id ? 'active' : ''}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
