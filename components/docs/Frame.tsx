import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Frame({ children }: Props) {
  return <div className="docs-frame">{children}</div>
}
