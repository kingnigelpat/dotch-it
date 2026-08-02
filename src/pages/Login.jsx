import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import { loginUser } from '../services/authService'
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
      // fetch profile directly since AuthContext user state hasn't updated yet
      const { getUserProfile } = await import('../services/authService')
      const profileData = await getUserProfile(cred.user.uid)
      
      navigate(
        profileData?.role === 'business' ? '/business' : '/dashboard',
        { replace: true },
      )
      return cred
    } catch (e) {
      setError(friendlyAuthError(e.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Log in to search local businesses"
      submitLabel="Log in"
      error={error}
      loading={loading}
      onSubmit={onSubmit}
      fields={[
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password' },
      ]}
    >
      <p className="form-hint">
        New here?{' '}
        <Link to="/register">Create an account</Link>
      </p>
    </AuthForm>
  )
}

export function friendlyAuthError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Wrong email or password.'
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a minute.'
    case 'auth/email-already-in-use':
      return 'That email is already registered.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase.'
    default:
      return 'Something went wrong. Check your keys and try again.'
  }
}
