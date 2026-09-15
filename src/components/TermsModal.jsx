import { useEffect } from 'react'
import { TERMS_AND_POLICY } from '../data/termsAndPolicy'

export default function TermsModal({ isOpen, onClose, onAccept }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '14px',
            marginBottom: '16px',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
              Dotch Vendor Agreement
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
              📜 Terms & Policy
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              lineHeight: 1,
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div
          style={{
            overflowY: 'auto',
            paddingRight: '8px',
            fontSize: '13.5px',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            flex: 1,
          }}
        >
          <div
            style={{
              background: 'rgba(249, 115, 22, 0.06)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
            }}
          >
            ℹ️ <strong>Summary:</strong> By paying and listing your business on Dotch, you agree to post honest information, transfer fees only to our verified Paga account, and follow platform rules. Dotch takes 0% commission on your sales.
          </div>

          {TERMS_AND_POLICY.sections.map((sec) => (
            <div key={sec.id} style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {sec.title}
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {sec.content.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '20px' }}>
            Last updated: {TERMS_AND_POLICY.lastUpdated}. For inquiries or assistance, reach us on WhatsApp at +2347073544811.
          </p>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
            marginTop: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onAccept()
                onClose()
              }}
              style={{ fontWeight: 700 }}
            >
              ✓ I Understand & Accept Terms
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
