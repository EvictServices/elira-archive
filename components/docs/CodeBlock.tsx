'use client'

import { useRef, useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

export default function CodeBlock(props: ComponentPropsWithoutRef<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  function copy() {
    const text = ref.current?.innerText ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="docs-code-wrap">
      <button className={`docs-copy-btn${copied ? ' copied' : ''}`} onClick={copy} aria-label="Copy">
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
      <pre ref={ref} {...props} className={`docs-codeblock${props.className ? ` ${props.className}` : ''}`} style={{ ...props.style, WebkitTextSizeAdjust: 'none' }} />
    </div>
  )
}
