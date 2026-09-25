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
  const [plan, setPlan] = useState('pro_eoy') // End of Year Promo Plan (₦5,000)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      subtitle={isVendor ? 'Register your business on Dotch' : 'Search local spots, stores, dining & services'}
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
              <span>Find stores, dining, gadgets & services near you across Nigerian cities</span>
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
              <span>Register your shop, dining spot, or service (1 account = 1 business)</span>
            </div>
          </label>
        </div>
      </div>

      {isVendor && (
        <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(238, 93, 54, 0.25)' }}>
          <label className="role-label" style={{ marginBottom: '8px', color: 'var(--brand-primary)', fontWeight: 800 }}>
            ⚡ Special End of Year Vendor Promo:
          </label>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--brand-primary)',
              background: 'var(--brand-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="vendorPlan"
                  value="pro_eoy"
                  checked={true}
                  readOnly
                />
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>End of Year Promo Plan</strong>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-primary)' }}>₦5,000</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              🔥 Special Promo: Get full active listing & direct WhatsApp inquiries till the ending of the year for just ₦5,000 flat!
            </p>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', marginBottom: 0, lineHeight: 1.4 }}>
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
