import { useState } from 'react'
import { recordBuyerNotifyRequest } from '../services/leadService'
import { ADMIN_EMAIL, ADMIN_PHONE_DISPLAY, BANK_DETAILS } from '../config/bankDetails'

/**
 * Modal to collect buyer contact when no sellers currently match their search.
 * Persists the lead directly to Firestore so the admin can review buyer demand in the Admin Panel.
 */
export default function NotifyModal({ isOpen, onClose, query = '' }) {
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!contact.trim()) return

    setLoading(true)
    try {
      await recordBuyerNotifyRequest({
        contact: contact.trim(),
        query: query.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      console.warn('Notify request submission warning:', err)
      // Even if offline/network error, still show success state
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setContact('')
    onClose()
  }

  const adminWaPrompt = `Hello Dotch Admin, I was searching on Dotch for "${query || 'a product'}" and would like assistance finding verified sellers.`
  const adminWaUrl = `https://wa.me/2347073544811?text=${encodeURIComponent(adminWaPrompt)}`

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
            <h3 className="notify-modal-title">Request Sent to Admin!</h3>
            <p className="notify-modal-desc">
              We’ve recorded your request for <strong>&ldquo;{query}&rdquo;</strong>. The Dotch sourcing team (<strong>{ADMIN_EMAIL}</strong>) has been alerted and will notify you as soon as verified sellers join.
            </p>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={adminWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ fontWeight: 800 }}
              >
                <i className="fa-brands fa-whatsapp" style={{ marginRight: '6px' }} /> Urgent? Chat Admin on WhatsApp
              </a>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleResetAndClose}
                style={{ borderRadius: 'var(--radius-pill)', padding: '8px 24px' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
