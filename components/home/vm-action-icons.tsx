import type { ReactNode } from 'react'

type IconProps = { className?: string }

function VmIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function VmIconLock({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </VmIcon>
  )
}

export function VmIconUnlock({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.5-2" />
    </VmIcon>
  )
}

export function VmIconGhost({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </VmIcon>
  )
}

export function VmIconReveal({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </VmIcon>
  )
}

export function VmIconClaim({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </VmIcon>
  )
}

export function VmIconDisconnect({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <path d="m14 5 5 5-5 5" />
      <path d="M19 10H9a4 4 0 0 0 0 8h1" />
    </VmIcon>
  )
}

export function VmIconActivity({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </VmIcon>
  )
}

export function VmIconView({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="13" y2="15" />
    </VmIcon>
  )
}

export function VmIconIncrease({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </VmIcon>
  )
}

export function VmIconDecrease({ className }: IconProps) {
  return (
    <VmIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </VmIcon>
  )
}
