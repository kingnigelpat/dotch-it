import { useState } from 'react'
import { BANK_DETAILS, getPaymentWhatsAppUrl } from '../config/bankDetails'
import TermsModal from './TermsModal'

export default function BankTransferCard({
  planName = '1 Month Vendor Plan',
  planAmount = '₦5,000',
  userEmail = '',
  userName = '',
  onRefresh,
  refreshing = false,
  showStatusCheck = true,
}) {
  const [copiedAcc, setCopiedAcc] = useState(false)
  const [copiedNarration, setCopiedNarration] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const narrationText = `DOTCH-${(userEmail || 'VENDOR').split('@')[0].toUpperCase()}`

  const copyToClipboard = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text)
      setter(true)
      setTimeout(() => setter(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setter(true)
      setTimeout(() => setter(false), 2000)
    }
  }

  const whatsappUrl = getPaymentWhatsAppUrl({
    email: userEmail,
    planName,
    planAmount,
    vendorName: userName,
  })

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'left',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      {/* Plan Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Selected Subscription
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {planName}
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Total Due</span>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-primary)' }}>
            {planAmount}
          </span>
        </div>
      </div>

      {/* Official Bank Account Details Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 88, 12, 0.03) 100%)',
          border: '1.5px solid rgba(249, 115, 22, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>🏦</span>
          <div>
            <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)', display: 'block' }}>
              Official Dotch Bank Account
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Transfer directly from your banking app or USSD
            </span>
          </div>
        </div>

        {/* Bank Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px dashed rgba(249, 115, 22, 0.25)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bank Name:</span>
          <strong style={{ fontSize: '15px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            {BANK_DETAILS.bankName}
          </strong>
        </div>

        {/* Account Number Row with Copy Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px dashed rgba(249, 115, 22, 0.25)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Account Number:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                color: 'var(--text-primary)',
              }}
            >
              {BANK_DETAILS.accountNumber}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, setCopiedAcc)}
              style={{
                background: copiedAcc ? '#15803d' : 'var(--brand-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Copy account number"
            >
              {copiedAcc ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>

        {/* Account Name Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px dashed rgba(249, 115, 22, 0.25)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Account Name:</span>
          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', textAlign: 'right' }}>
            {BANK_DETAILS.accountName}
          </strong>
        </div>

        {/* Narration Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Payment Narration:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
              {narrationText}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(narrationText, setCopiedNarration)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: copiedNarration ? '#15803d' : 'var(--text-secondary)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
              title="Copy narration text"
            >
              {copiedNarration ? '✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          3 Simple Activation Steps:
        </h4>
        <ol style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          <li>Transfer <strong>{planAmount}</strong> to the Paga account above.</li>
          <li>Save or take a screenshot of the successful debit transaction receipt.</li>
          <li>Tap the button below to send your receipt to Admin on WhatsApp for instant unlock.</li>
        </ol>
      </div>

      {/* Terms & Policy Agreement Gate */}
      <div
        style={{
          background: acceptedTerms ? 'rgba(21, 128, 61, 0.08)' : 'var(--bg-muted)',
          border: acceptedTerms ? '1.5px solid rgba(21, 128, 61, 0.35)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="checkbox"
          id={`terms-consent-${planName.replace(/\s+/g, '-')}`}
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }}
        />
        <label
          htmlFor={`terms-consent-${planName.replace(/\s+/g, '-')}`}
          style={{ fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.5, margin: 0 }}
        >
          I have read and agree to the{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setShowTermsModal(true)
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--brand-primary)',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '12.5px',
            }}
          >
            Dotch Vendor Terms & Policy
          </button>{' '}
          (1 business per account, genuine photos & contact info, non-refundable upon verification).
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {acceptedTerms ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-lg btn-block"
            style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>💬</span>
            <span>Send Payment Proof to Admin on WhatsApp</span>
          </a>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-lg btn-block"
            onClick={() => setShowTermsModal(true)}
            style={{
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
            title="Click to view and accept Terms & Policy"
          >
            <span>📜</span>
            <span>View Terms & Policy to Unlock Payment</span>
          </button>
        )}

        {showStatusCheck && (
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={onRefresh}
            disabled={refreshing}
            style={{ fontSize: '13.5px', fontWeight: 600 }}
          >
            {refreshing ? 'Checking verification status…' : '🔄 Check Approval Status'}
          </button>
        )}
      </div>

      <div style={{ marginTop: '14px', textAlign: 'center' }}>
        <small style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          🔒 Verified listings are activated within 5–10 minutes after receipt confirmation.
        </small>
      </div>

      {/* Terms & Policy Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setAcceptedTerms(true)}
      />
    </div>
  )
}
