import { useState } from 'react'
import { BANK_DETAILS, getPaymentWhatsAppUrl } from '../config/bankDetails'
import TermsModal from './TermsModal'

export default function BankTransferCard({
  planName = 'Flash Micro-Campaign',
  planAmount = '₦250',
  userEmail = '',
  userName = '',
  onRefresh,
  refreshing = false,
  showStatusCheck = true,
}) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const whatsappUrl = getPaymentWhatsAppUrl({
    email: userEmail,
    planName,
    planAmount,
    vendorName: userName,
  })

  return (
    <div className="bank-transfer-card-clean">
      {/* Plan Header */}
      <div className="plan-header-clean">
        <div>
          <span className="plan-tag-clean">
            Selected Campaign Package
          </span>
          <h3 className="plan-title-clean">
            {planName}
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Total Due</span>
          <span className="plan-amount-clean">
            {planAmount}
          </span>
        </div>
      </div>

      {/* Admin WhatsApp Payment Notice (No typed account number) */}
      <div className="admin-wa-notice-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div className="wa-icon-bubble">
            <i className="fa-brands fa-whatsapp" />
          </div>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block' }}>
              Message Admin on WhatsApp for Account Number
            </strong>
            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Official Admin Line: <strong>{BANK_DETAILS.formattedAdminWhatsApp}</strong>
            </span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0' }}>
          To keep payments secure, we provide our official account number directly on WhatsApp. Once payment is made, send your transaction receipt to the same chat for instant campaign banner activation.
        </p>
      </div>

      {/* Instructions */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          3 Simple Activation Steps:
        </h4>
        <ol style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          <li>Tap the button below to message Admin on WhatsApp for the account number.</li>
          <li>Transfer <strong>{planAmount}</strong> and take a screenshot of your payment receipt.</li>
          <li>Reply with your receipt to have your campaign banner approved and live within minutes!</li>
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
            Dotch Campaign Advertising Terms
          </button>{' '}
          (Genuine business info, verified payment receipt required for launch).
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
            style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800 }}
          >
            <i className="fa-brands fa-whatsapp" style={{ fontSize: '18px' }} />
            <span>Chat Admin on WhatsApp for Account Number</span>
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
              fontWeight: 700,
            }}
            title="Click to view and accept Terms & Policy"
          >
            <span>📜</span>
            <span>View Terms & Policy to Unlock WhatsApp Link</span>
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
          🔒 Verified campaigns are launched within 5–10 minutes after receipt confirmation.
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
