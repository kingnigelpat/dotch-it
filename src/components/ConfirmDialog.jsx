import { useEffect, useRef } from 'react'

export default function ConfirmDialog({
  isOpen,
  title,
  body,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  isDestructive = true,
}) {
  const dialogRef = useRef(null)
  const cancelBtnRef = useRef(null)
  const previousActiveElementRef = useRef(null)

  // 1. Save and restore focus, lock body scroll safely
  useEffect(() => {
    if (!isOpen) return

    previousActiveElementRef.current = document.activeElement

    // Focus cancel button by default
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus()
    }, 50)

    // iOS Safari-safe scroll lock
    const scrollY = window.scrollY
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = originalStyle.overflow
      document.body.style.position = originalStyle.position
      document.body.style.top = originalStyle.top
      document.body.style.width = originalStyle.width
      window.scrollTo(0, scrollY)

      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus()
      }
    }
  }, [isOpen])

  // 2. Escape key and Focus Trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      // Escape key (blocked during loading)
      if (e.key === 'Escape') {
        if (!isLoading && onCancel) {
          e.preventDefault()
          onCancel()
        }
        return
      }

      // Focus trap
      if (e.key === 'Tab') {
        if (!dialogRef.current) return
        const focusableElements = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onCancel])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading && onCancel) {
      onCancel()
    }
  }

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="confirm-dialog-content" ref={dialogRef}>
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon ${isDestructive ? 'confirm-dialog-icon-danger' : 'confirm-dialog-icon-info'}`}>
            <i className={isDestructive ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question'} />
          </div>
          <div className="confirm-dialog-text">
            <h2 id="confirm-dialog-title" className="confirm-dialog-title">
              {title}
            </h2>
            <p id="confirm-dialog-desc" className="confirm-dialog-desc">
              {body}
            </p>
          </div>
        </div>

        <div className="confirm-dialog-actions">
          <button
            type="button"
            ref={cancelBtnRef}
            className="btn btn-secondary confirm-dialog-btn confirm-dialog-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'} confirm-dialog-btn confirm-dialog-confirm`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Processing…</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
