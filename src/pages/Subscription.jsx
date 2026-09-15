import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SUBSCRIPTION_PLANS } from '../services/paystackService'
import { useAuth } from '../context/AuthContext'
import BankTransferCard from '../components/BankTransferCard'
import { BANK_DETAILS } from '../config/bankDetails'

export default function Subscription() {
  const { user, profile } = useAuth()
  const [selectedPlanForTransfer, setSelectedPlanForTransfer] = useState(null)

  const paidPlans = SUBSCRIPTION_PLANS.filter((p) => p.price > 0)

  return (
    <div className="subscription-page">
      {/* Top Header */}
      <div className="subscription-header">
        <div className="badge-pill explorer-badge" style={{ marginBottom: '12px' }}>
          💼 Dotch Business Plans
        </div>
        <h1 className="subscription-title">Supercharge Your Local Visibility</h1>
        <p className="subscription-subtitle">
          Unlock photos of your place & products, your exact neighborhood location, and direct
          phone/WhatsApp linking so ready buyers, tourists, and researchers can find and contact you instantly.
        </p>
      </div>

      {/* Bank Transfer Active Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.09) 0%, rgba(234, 88, 12, 0.04) 100%)',
          border: '1.5px solid rgba(249, 115, 22, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto 36px',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏦</div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Direct Bank Transfer Payments Active
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 16px' }}>
          You can activate your vendor listing right now via direct transfer to our official <strong>Paga</strong> account. Automated card payments are coming soon.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '8px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span>Paga Bank</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--brand-primary)' }}>{BANK_DETAILS.accountNumber}</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span>{BANK_DETAILS.accountName}</span>
        </div>
      </div>

      {/* Plan Preview Cards */}
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Select Your Plan
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Choose a plan below to view bank transfer details and submit your payment proof directly on WhatsApp:
        </p>
      </div>

      <div className="plans-grid">
        {paidPlans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.highlight ? 'plan-highlight' : ''}`}
          >
            {plan.badge && (
              <div className="plan-badge">{plan.badge}</div>
            )}
            <div className="plan-head">
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price-wrap">
                <span className="plan-price">{plan.formattedPrice || 'Free'}</span>
                <span className="plan-interval">{plan.interval}</span>
              </div>
            </div>

            <div className="plan-divider" />

            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i} className="plan-feature-item">
                  <span className="feature-check">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="plan-cta-wrap">
              <button
                type="button"
                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'} btn-block btn-lg`}
                onClick={() => setSelectedPlanForTransfer(plan)}
                style={{ fontWeight: 800 }}
              >
                ⚡ Pay via Bank Transfer ({plan.formattedPrice})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Bank Transfer Modal */}
      {selectedPlanForTransfer && (
        <div className="modal-overlay" onClick={() => setSelectedPlanForTransfer(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', padding: '24px', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setSelectedPlanForTransfer(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '22px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                lineHeight: 1,
              }}
              title="Close modal"
            >
              ✕
            </button>

            {!user && (
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#93c5fd',
                }}
              >
                💡 <strong>Not logged in?</strong> We recommend{' '}
                <Link to={`/register?role=vendor&plan=${selectedPlanForTransfer.id}`} style={{ textDecoration: 'underline', fontWeight: 700 }}>
                  Registering as a Vendor
                </Link>{' '}
                first so your payment can be matched immediately to your account!
              </div>
            )}

            <BankTransferCard
              planName={selectedPlanForTransfer.name}
              planAmount={selectedPlanForTransfer.formattedPrice}
              userEmail={user?.email || ''}
              userName={profile?.name || ''}
              showStatusCheck={Boolean(user)}
              onRefresh={() => {
                window.location.href = '/business'
              }}
            />
          </div>
        </div>
      )}

      {/* Security Strip */}
      <div className="payment-security-strip">
        <div className="security-item">
          <span>🔒</span>
          <div>
            <strong>Bank-Grade Security</strong>
            <small>Direct NUBAN bank transfer verification</small>
          </div>
        </div>
        <div className="security-item">
          <span>⚡</span>
          <div>
            <strong>Fast Activation</strong>
            <small>Listing unlocked within 5–10 mins of confirmation</small>
          </div>
        </div>
        <div className="security-item">
          <span>📅</span>
          <div>
            <strong>No Hidden Fees</strong>
            <small>Flat transparent pricing for verified growth</small>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Link to="/dashboard" className="btn btn-outline btn-lg">
          ← Explore Businesses on Dotch
        </Link>
      </div>
    </div>
  )
}
