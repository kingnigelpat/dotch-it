import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { loginUser, getUserProfile, friendlyAuthError, resetPassword } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { BANK_DETAILS } from '../config/bankDetails'

export default function Login() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [typedEmail, setTypedEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [adminContactUrl, setAdminContactUrl] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

  const handleForgotPassword = async (e) => {
    e?.preventDefault?.()
    const emailToUse = (typedEmail || document.getElementById('email')?.value || '').trim()
    if (!emailToUse) {
      setResetError('Enter your email address above first so the admin can identify your account.')
      return
    }
    setResetError('')
    setResetLoading(true)

    const adminPhone = (BANK_DETAILS?.adminWhatsApp || '2347073544811').replace(/[^0-9]/g, '')
    const message = `Hello Dotch Admin, I forgot my password and need help recovering my account.\n\nAccount Email / ID: ${emailToUse}\n\nPlease assist me with password reset and account verification.`
    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`

    setAdminContactUrl(waUrl)
    setSubmittedEmail(emailToUse)

    try {
      await resetPassword(emailToUse)
      setResetSent(true)
    } catch {
      // Even if Firebase reset email encounters an error, WhatsApp support succeeds
      setResetSent(true)
    } finally {
      setResetLoading(false)
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank')
      }
    }
  }

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
        navigate(redirectUrl || '/', { replace: true })
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
      onValuesChange={(vals) => setTypedEmail(vals?.email || '')}
      fields={[
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password' },
      ]}
    >
      <div style={{ marginTop: '-4px', marginBottom: '14px', textAlign: 'right' }}>
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={resetLoading}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--accent-primary)',
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {resetLoading ? 'Connecting to Admin…' : 'Forgot password?'}
        </button>
      </div>

      {adminContactUrl && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: '16px',
            fontSize: '13.5px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div>
            🔑 <strong>Admin Assistance Request:</strong> We&apos;ve initiated a recovery request for <strong>{submittedEmail}</strong>.
          </div>
          <div style={{ fontSize: '12.5px', opacity: 0.9 }}>
            Our admin team will help reset your password using your Account ID. Click below if WhatsApp did not open automatically:
          </div>
          <a
            href={adminContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            style={{
              alignSelf: 'flex-start',
              textDecoration: 'none',
              marginTop: '4px',
            }}
          >
            💬 Message Admin on WhatsApp
          </a>
        </div>
      )}

      {resetError && (
        <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '13.5px' }}>
          {resetError}
        </div>
      )}

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
