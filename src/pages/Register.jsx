import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { registerUser } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { friendlyAuthError } from './Login'

export default function Register() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [role, setRole] = useState('explorer') // 'explorer' or 'vendor'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ name, email, password }) => {
    setError('')
    setLoading(true)
    try {
      await registerUser({ name, email, password, role })
      await refreshProfile()
      navigate(role === 'vendor' || role === 'business' ? '/business/setup' : '/dashboard', {
        replace: true,
      })
    } catch (e) {
      setError(friendlyAuthError(e.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      title="Create your account"
      subtitle="Select whether you want to search or list a business"
      submitLabel={role === 'vendor' ? 'Register as Vendor' : 'Register as Explorer'}
      error={error}
      loading={loading}
      onSubmit={onSubmit}
      fields={[
        { name: 'name', label: 'Full Name', placeholder: 'Enter your full name' },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters' },
      ]}
    >
      <div className="role-selection-group">
        <label className="role-label">I am registering as:</label>
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
              <strong>🔎 Explorer</strong>
              <span>Search & discover popular hotels, restaurants, products & services near you</span>
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
              <strong>🏪 Vendor / List Business</strong>
              <span>List your hotel, restaurant, shop or business to get local customers</span>
            </div>
          </label>
        </div>
      </div>

      <p className="form-hint" style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ fontWeight: 700 }}>Log in here</Link>
      </p>
    </AuthForm>
  )
}
