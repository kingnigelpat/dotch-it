import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { registerUser } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { friendlyAuthError } from './Login'

export default function Register() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ name, email, password, role }) => {
    setError('')
    setLoading(true)
    try {
      await registerUser({ name, email, password, role })
      await refreshProfile()
      navigate(role === 'business' ? '/business/setup' : '/dashboard', {
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
      subtitle="Choose the account type that fits you"
      submitLabel="Create account"
      error={error}
      loading={loading}
      onSubmit={onSubmit}
      fields={[
        { name: 'name', label: 'Full name', placeholder: 'Your name' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password' },
      ]}
    >
      <div className="field">
        <label>Account type</label>
        <div className="role-cards">
          <label className="role-card">
            <input type="radio" name="role" value="finder" defaultChecked />
            <div>
              <strong>🔎 Finder</strong>
              <span>Search businesses near you</span>
            </div>
          </label>
          <label className="role-card">
            <input type="radio" name="role" value="business" />
            <div>
              <strong>🏪 Business</strong>
              <span>List your business + photos</span>
            </div>
          </label>
        </div>
      </div>
      <p className="form-hint">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthForm>
  )
}
