import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { registerUser, friendlyAuthError } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { formatTo234 } from '../utils/phoneUtils'

import { BANK_DETAILS } from '../config/bankDetails'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'explorer'
  const redirectUrl = searchParams.get('redirect')

  const { refreshProfile } = useAuth()
  const [role, setRole] = useState(initialRole) // 'explorer' or 'vendor'
  const [plan, setPlan] = useState('pro_2m') // 'pro_1m', 'pro_2m', or 'pro_1y'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const adminPhone = (BANK_DETAILS.adminWhatsApp || '2347073544811').replace(/\D/g, '')
  const adminWaUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent('Hello Dotch Admin, I am registering my business and I want to subscribe to the 1-Year VIP Vendor Plan.')}`

  const onSubmit = async ({ name, email, password, phone }) => {
    setError('')
    setLoading(true)
    try {
      const formattedPhone = formatTo234(phone)
      await registerUser({ name, email, password, phone: formattedPhone, role, plan })
      if (refreshProfile) await refreshProfile()
      navigate(role === 'vendor' || role === 'business' ? '/business' : (redirectUrl || '/'), {
        replace: true,
      })
    } catch (e) {
      setError(friendlyAuthError(e.code))
    } finally {
      setLoading(false)
    }
  }

  const isVendor = role === 'vendor' || role === 'business'

  return (
    <AuthForm
      title="Create your account"
      subtitle={isVendor ? 'Register your business on Dotch' : 'Search local businesses, hotels & products'}
      submitLabel={isVendor ? 'Register Business & Request Approval' : 'Create Free Account'}
      error={error}
      loading={loading}
      onSubmit={onSubmit}
      fields={[
        { name: 'name', label: isVendor ? 'Business Owner / Contact Name' : 'Full Name', placeholder: 'Enter your name' },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com' },
        { name: 'phone', label: 'Phone Number / WhatsApp', type: 'tel', placeholder: '801 234 5678' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters' },
      ]}
    >
      <div className="role-selection-group">
        <label className="role-label">I want to:</label>
        <div className="role-cards">
          <label
            className={`role-card ${role === 'explorer' ? 'active' : ''}`}
            onClick={() => setRole('explorer')}
          >
            <input
              type="radio"
              name="accountRole"
              value="explorer"
              checked={role === 'explorer'}
              onChange={() => setRole('explorer')}
            />
            <div className="role-card-content">
              <strong><i className="fa-solid fa-magnifying-glass" style={{ marginRight: '5px' }} /> Search & Explore</strong>
              <span>Find hotels, restaurants, shops & services near you across Nigerian cities</span>
            </div>
          </label>

          <label
            className={`role-card ${role === 'vendor' ? 'active' : ''}`}
            onClick={() => setRole('vendor')}
          >
            <input
              type="radio"
              name="accountRole"
              value="vendor"
              checked={role === 'vendor'}
              onChange={() => setRole('vendor')}
            />
            <div className="role-card-content">
              <strong><i className="fa-solid fa-store" style={{ marginRight: '5px' }} /> List My Business</strong>
              <span>Register your hotel, restaurant, shop or service (1 account = 1 business)</span>
            </div>
          </label>
        </div>
      </div>

      {isVendor && (
        <div style={{ marginBottom: '20px', padding: '14px 16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <label className="role-label" style={{ marginBottom: '8px' }}>Select Listing Plan:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: plan === 'pro_1m' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                background: plan === 'pro_1m' ? 'var(--brand-light)' : 'var(--bg-surface)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="vendorPlan"
                  value="pro_1m"
                  checked={plan === 'pro_1m'}
                  onChange={() => setPlan('pro_1m')}
                />
                <strong style={{ fontSize: '12.5px' }}>1 Month Plan</strong>
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>₦5,000</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>30-day listing & WhatsApp</span>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: plan === 'pro_2m' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                background: plan === 'pro_2m' ? 'var(--brand-light)' : 'var(--bg-surface)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="vendorPlan"
                  value="pro_2m"
                  checked={plan === 'pro_2m'}
                  onChange={() => setPlan('pro_2m')}
                />
                <strong style={{ fontSize: '12.5px' }}>2 Months Plan</strong>
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₦7,999 <i className="fa-solid fa-fire" style={{ color: '#ef4444' }} />
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>60 days + 5x boost & badge</span>
            </label>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: plan === 'pro_1y' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                background: plan === 'pro_1y' ? 'var(--brand-light)' : 'var(--bg-surface)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="vendorPlan"
                  value="pro_1y"
                  checked={plan === 'pro_1y'}
                  onChange={() => setPlan('pro_1y')}
                />
                <strong style={{ fontSize: '12.5px' }}>1 Year Plan</strong>
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                Contact Admin <i className="fa-solid fa-crown" style={{ color: '#eab308' }} />
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>365 days + VIP priority</span>
            </label>
          </div>

          {plan === 'pro_1y' && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px 14px',
                background: 'rgba(238, 93, 54, 0.08)',
                border: '1.5px solid rgba(238, 93, 54, 0.35)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👑</span>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  1-Year VIP Listing (Custom Annual Payment)
                </strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Get uninterrupted 365-day visibility, top promotional flyer spotlight, and direct VIP account verification. Contact our admin directly on WhatsApp to finalize your annual VIP plan.
              </p>
              <div>
                <a
                  href={adminWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#25D366',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <i className="fa-brands fa-whatsapp" /> Chat with Admin on WhatsApp
                </a>
              </div>
            </div>
          )}

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4 }}>
            <i className="fa-solid fa-lock" style={{ marginRight: '4px' }} /> <strong>Verification Policy:</strong> Business posting is unlocked immediately upon admin payment verification.
          </p>
        </div>
      )}

      <p className="form-hint" style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ fontWeight: 700 }}>
          Log in here
        </Link>
      </p>
    </AuthForm>
  )
}
