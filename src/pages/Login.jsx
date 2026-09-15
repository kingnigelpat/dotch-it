import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { loginUser, getUserProfile, friendlyAuthError } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ email, password }) => {
    setError('')
    setLoading(true)
    try {
      const cred = await loginUser(email, password)
      const profileData = await getUserProfile(cred.user.uid)
      if (refreshProfile) await refreshProfile()

      const searchParams = new URLSearchParams(window.location.search)
      const redirectUrl = searchParams.get('redirect')

      if (profileData?.role === 'admin') {
        navigate(redirectUrl || '/admin', { replace: true })
      } else if (profileData?.role === 'vendor' || profileData?.role === 'business') {
        navigate(redirectUrl || '/business', { replace: true })
      } else {
        navigate(redirectUrl || '/dashboard', { replace: true })
      }
      return cred
    } catch (e) {
      setError(friendlyAuthError(e.code))
    } finally {
      setLoading(false)
    }
  }

  const searchParams = new URLSearchParams(window.location.search)
  const isWhatsAppReason = searchParams.get('reason') === 'whatsapp'
  const redirectUrl = searchParams.get('redirect')

  return (
    <AuthForm
      title="Welcome back"
      subtitle={isWhatsAppReason ? 'Log in to connect with verified businesses' : 'Log in to search local businesses'}
      submitLabel="Log in"
      error={error}
      loading={loading}
      onSubmit={onSubmit}
      fields={[
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password' },
      ]}
    >
      {isWhatsAppReason && (
        <div
          style={{
            background: 'rgba(37, 211, 102, 0.08)',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13.5px',
            lineHeight: 1.45,
          }}
        >
          💬 <strong>Account required:</strong> Please log in or create an account to chat directly with verified business owners on WhatsApp.
        </div>
      )}

      <p className="form-hint">
        New here?{' '}
        <Link to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}>
          Create an account
        </Link>
      </p>
    </AuthForm>
  )
}
