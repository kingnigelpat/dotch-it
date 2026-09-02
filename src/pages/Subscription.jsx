import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBusinessByOwner, updateBusinessSubscription } from '../services/businessService'
import { SUBSCRIPTION_PLANS, initializePaystackSubscription } from '../services/paystackService'

export default function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (user?.uid) {
      getBusinessByOwner(user.uid)
        .then(setBusiness)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!business) {
      navigate('/business/setup')
      return
    }

    if (plan.price === 0) {
      return // Already starter
    }

    setProcessingPlan(plan.id)
    setSuccessMsg('')

    await initializePaystackSubscription({
      email: user.email,
      amount: plan.price,
      planId: plan.id,
      businessId: business.id,
      businessName: business.name,
      onSuccess: async (paymentDetails) => {
        try {
          const updatedSub = await updateBusinessSubscription(business.id, {
            planId: plan.id,
            reference: paymentDetails.reference,
            amount: plan.price,
          })
          setBusiness((prev) => ({ ...prev, ...updatedSub }))
          setSuccessMsg(`🎉 Success! Your business "${business.name}" is now upgraded to ${plan.name}!`)
        } catch (err) {
          console.error(err)
        } finally {
          setProcessingPlan(null)
        }
      },
      onClose: () => {
        setProcessingPlan(null)
      },
    })
  }

  const currentTier = business?.subscriptionTier || 'starter'

  return (
    <div className="subscription-page">
      {/* Top Header */}
      <div className="subscription-header">
        <div className="badge-pill explorer-badge" style={{ marginBottom: '12px' }}>
          💼 Dotch Business Growth
        </div>
        <h1 className="subscription-title">Supercharge Your Local Visibility</h1>
        <p className="subscription-subtitle">
          Join verified businesses getting 3x more customer inquiries, instant WhatsApp orders, and top search placement.
        </p>

        {business && (
          <div className="current-status-banner">
            <span>
              Managing: <strong>{business.name}</strong>
            </span>
            <span className="status-badge">
              Active Tier:{' '}
              <strong style={{ color: 'var(--brand-primary)', textTransform: 'capitalize' }}>
                {currentTier.replace('_', ' ')}
              </strong>
            </span>
          </div>
        )}

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
      </div>

      {/* Pricing Cards Grid */}
      <div className="plans-grid">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = currentTier === plan.id
          return (
            <div
              key={plan.id}
              className={`plan-card ${plan.highlight ? 'plan-highlight' : ''} ${
                isCurrent ? 'plan-active-current' : ''
              }`}
            >
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}

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
                {isCurrent ? (
                  <button className="btn btn-outline btn-block" disabled>
                    ✓ Current Plan
                  </button>
                ) : (
                  <button
                    className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'} btn-block btn-lg`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={processingPlan === plan.id}
                  >
                    {processingPlan === plan.id ? 'Connecting Paystack…' : plan.cta}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Security & FAQ strip */}
      <div className="payment-security-strip">
        <div className="security-item">
          <span>🔒</span>
          <div>
            <strong>Secured by Paystack</strong>
            <small>256-bit bank-grade encryption</small>
          </div>
        </div>
        <div className="security-item">
          <span>⚡</span>
          <div>
            <strong>Instant Activation</strong>
            <small>Rank boost applied immediately</small>
          </div>
        </div>
        <div className="security-item">
          <span>📅</span>
          <div>
            <strong>Cancel Anytime</strong>
            <small>Zero lock-ins or hidden fees</small>
          </div>
        </div>
      </div>
    </div>
  )
}
