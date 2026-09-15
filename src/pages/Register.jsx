import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { registerUser, friendlyAuthError } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'explorer'
  const redirectUrl = searchParams.get('redirect')

  const { refreshProfile } = useAuth()
  const [role, setRole] = useState(initialRole) // 'explorer' or 'vendor'
  const [plan, setPlan] = useState('pro_2m') // 'pro_1m' or 'pro_2m'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ name, email, password }) => {
    setError('')
    setLoading(true)
    try {
      await registerUser({ name, email, password, role, plan })
      if (refreshProfile) await refreshProfile()
      navigate(role === 'vendor' || role === 'business' ? '/business' : (redirectUrl || '/dashboard'), {
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
              <strong>🔎 Search & Explore</strong>
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
              <strong>🏪 List My Business</strong>
              <span>Register your hotel, restaurant, shop or service (1 account = 1 business)</span>
            </div>
          </label>
        </div>
      </div>

      {isVendor && (
        <div style={{ marginBottom: '20px', padding: '14px 16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <label className="role-label" style={{ marginBottom: '8px' }}>Select Listing Plan:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                <strong style={{ fontSize: '13px' }}>1 Month Plan</strong>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₦5,000</span>
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
                <strong style={{ fontSize: '13px' }}>2 Months Plan</strong>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₦7,999 🔥</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>60 days + 5x boost & gold badge</span>
            </label>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4 }}>
            🔒 <strong>Verification Policy:</strong> Business posting is unlocked immediately upon admin payment verification.
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
