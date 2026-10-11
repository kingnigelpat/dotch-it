import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { registerUser, friendlyAuthError } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { formatTo234 } from '../utils/phoneUtils'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'explorer'
  const redirectUrl = searchParams.get('redirect')

  const { refreshProfile } = useAuth()
  const [role, setRole] = useState(initialRole) // 'explorer' or 'vendor'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ name, email, password, phone }) => {
    setError('')
    setLoading(true)
    try {
      const formattedPhone = formatTo234(phone)
      await registerUser({ name, email, password, phone: formattedPhone, role, plan: 'free' })
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
      subtitle={isVendor ? 'Register your business on Dotch (100% Free Forever)' : 'Search local spots, stores, dining & services'}
      submitLabel={isVendor ? '🚀 Register & List Business for Free' : 'Create Free Account'}
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
              <span>Find stores, dining, gadgets & services near you across Nigerian cities (Free)</span>
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
              <strong><i className="fa-solid fa-store" style={{ marginRight: '5px' }} /> List My Business (Free)</strong>
              <span>Register your shop, dining spot, or service with photos & WhatsApp line (100% Free)</span>
            </div>
          </label>
        </div>
      </div>

      {isVendor && (
        <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--brand-light, rgba(238, 93, 54, 0.08))', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>🎉</span>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>100% Free Business Listing</strong>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Listing your business, uploading storefront photos, and receiving customer WhatsApp inquiries is completely free with zero commission. Boost your reach anytime with campaign banners from just ₦250!
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
