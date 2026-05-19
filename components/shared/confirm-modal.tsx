'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type ResolveFn = (value: boolean) => void

interface ActiveConfirm extends ConfirmOptions {
  resolve: ResolveFn
}

export function useConfirm() {
  const [active, setActive] = useState<ActiveConfirm | null>(null)
  const resolveRef = useRef<ResolveFn | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setActive({ ...options, resolve })
    })
  }, [])

  const finish = useCallback((value: boolean) => {
    setActive((current) => {
      if (current) current.resolve(value)
      return null
    })
  }, [])

  const modal = active ? (
    <ConfirmModal
      title={active.title}
      description={active.description}
      confirmLabel={active.confirmLabel}
      cancelLabel={active.cancelLabel}
      destructive={active.destructive}
      onCancel={() => finish(false)}
      onConfirm={() => finish(true)}
    />
  ) : null

  return { confirm, modal }
}

interface ConfirmModalProps {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onCancel, onConfirm])

  if (!mounted) return null

  const content = (
    <div
      className="confirm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="confirm-card">
        <h3 id="confirm-title" className="confirm-title">
          {title}
        </h3>
        {description && <p className="confirm-desc">{description}</p>}
        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn-ghost"
            onClick={onCancel}
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-btn ${
              destructive ? 'confirm-btn-danger' : 'confirm-btn-primary'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
