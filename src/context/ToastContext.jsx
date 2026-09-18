import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
    const newToast = { id, type, message, duration }
    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id
  }, [removeToast])

  const showSuccess = useCallback((message, duration) => {
    return addToast('success', message, duration)
  }, [addToast])

  const showError = useCallback((message, duration) => {
    return addToast('error', message, duration)
  }, [addToast])

  const showInfo = useCallback((message, duration) => {
    return addToast('info', message, duration)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="toast-container"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-item toast-${t.type}`}
          role={t.type === 'error' ? 'alert' : 'status'}
          aria-atomic="true"
        >
          <div className="toast-icon">
            {t.type === 'success' && <i className="fa-solid fa-circle-check" />}
            {t.type === 'error' && <i className="fa-solid fa-circle-exclamation" />}
            {t.type === 'info' && <i className="fa-solid fa-circle-info" />}
          </div>
          <div className="toast-message">{t.message}</div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="Close notification"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      ))}
    </div>
  )
}
