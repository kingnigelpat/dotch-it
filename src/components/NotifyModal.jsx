import { useState } from 'react'

/**
 * Modal to collect buyer contact when no sellers currently match their search
 */
export default function NotifyModal({ isOpen, onClose, query = '' }) {
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!contact.trim()) return

    setLoading(true)
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('dotch_notify_requests')
        const list = raw ? JSON.parse(raw) : []
        list.push({
          contact: contact.trim(),
          query: query.trim(),
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem('dotch_notify_requests', JSON.stringify(list))
      } catch (err) {
        console.warn('LocalStorage error:', err)
      }
      setLoading(false)
      setSubmitted(true)
    }, 400)
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setContact('')
    onClose()
  }

  return (
    <div className="notify-modal-overlay" onClick={handleResetAndClose}>
      <div className="notify-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="notify-modal-close"
          onClick={handleResetAndClose}
          aria-label="Close"
        >
          ✕
        </button>

        {!submitted ? (
          <>
            <div className="notify-modal-icon">
              <i className="fa-solid fa-bell-ring" />
            </div>
            <h3 className="notify-modal-title">Get Notified When a Seller Joins</h3>
            <p className="notify-modal-desc">
              We couldn’t find an exact match for <strong>&ldquo;{query}&rdquo;</strong> right now. Leave your WhatsApp phone or email and we’ll alert you the moment a verified seller joins!
            </p>

            <form onSubmit={handleSubmit} className="notify-modal-form">
              <input
                type="text"
                placeholder="WhatsApp number or Email (e.g. 08012345678)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="notify-modal-input"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !contact.trim()}
                className="btn btn-primary notify-modal-submit"
              >
                {loading ? 'Submitting…' : 'Notify Me'}
              </button>
            </form>
          </>
        ) : (
          <div className="notify-modal-success">
            <div className="notify-success-icon">✓</div>
            <h3 className="notify-modal-title">You’re on the VIP Alert List!</h3>
            <p className="notify-modal-desc">
              We’ve recorded your request for <strong>&ldquo;{query}&rdquo;</strong>. You will be the very first to know when a verified seller joins.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleResetAndClose}
              style={{ marginTop: '16px', borderRadius: 'var(--radius-pill)', padding: '8px 24px' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
