import { Component } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import MobileBottomNav from './components/MobileBottomNav'
import Landing from './pages/Landing'
import AiDiscover from './pages/AiDiscover'
import AuthenticatedHome from './pages/AuthenticatedHome'
import Login from './pages/Login'
import Register from './pages/Register'
import FinderDashboard from './pages/FinderDashboard'
import BusinessDashboard from './pages/BusinessDashboard'
import BusinessSetup from './pages/BusinessSetup'
import BusinessDetail from './pages/BusinessDetail'
import Account from './pages/Account'
import Subscription from './pages/Subscription'
import AdminPanel from './pages/AdminPanel'
import ListBusiness from './pages/ListBusiness'
import TermsAndPolicy from './pages/TermsAndPolicy'
import SetupNotice from './components/SetupNotice'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="center-loading">Loading application…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminOnly({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="center-loading">Checking admin authorization…</div>
  if (!user) return <Navigate to="/login?redirect=/admin" replace />
  if (profile?.role !== 'admin') {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center', padding: '32px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Admin Privileges Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
          You are logged in as <strong>{user.email}</strong>, but this account does not have administrator privileges.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-outline btn-sm">Return Home</a>
          <a href="/login?redirect=/admin" className="btn btn-primary btn-sm">Switch Account</a>
        </div>
      </div>
    )
  }
  return children
}

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null })
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DOTCH][RouteErrorBoundary] Route render/refresh error:', {
      name: error?.name || 'Error',
      message: error?.message || String(error),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      route: this.props.resetKey,
      timestamp: new Date().toISOString(),
    })
  }

  handleRetry = () => {
    try {
      localStorage.removeItem('dotch_cache_v1')
    } catch (e) {}
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            maxWidth: '480px',
            margin: '48px auto',
            padding: '32px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            We couldn&apos;t refresh your feed. Please try again.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
            The rest of DOTCH is still available. Tap Retry to reload this view.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={this.handleRetry}
            style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700, padding: '10px 24px' }}
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default function App() {
  const { user, profile } = useAuth()
  const location = useLocation()

  return (
    <ToastProvider>
      <ScrollToTop />
      <div className="app">
        <Navbar />
        <SetupNotice />
        <main className="main">
          <RouteErrorBoundary resetKey={`${location.pathname}${location.search}`}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/discover" element={<AiDiscover />} />
              <Route path="/browse" element={<FinderDashboard />} />
              <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
              <Route path="/search" element={<Navigate to="/discover" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/list-business" element={<ListBusiness />} />
              <Route path="/account" element={<Account />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/terms" element={<TermsAndPolicy />} />

              <Route
                path="/business"
                element={
                  <Protected>
                    <BusinessDashboard />
                  </Protected>
                }
              />
              <Route
                path="/business/setup"
                element={
                  <Protected>
                    <BusinessSetup />
                  </Protected>
                }
              />
              <Route path="/business/:id" element={<BusinessDetail />} />
              <Route path="/b/:id" element={<BusinessDetail />} />

              {/* Hidden admin-only route — not linked from any public page */}
              <Route
                path="/admin"
                element={
                  <AdminOnly>
                    <AdminPanel />
                  </AdminOnly>
                }
              />

              <Route
                path="*"
                element={
                  profile?.role === 'business' ? (
                    <Navigate to="/business" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
            </Routes>
          </RouteErrorBoundary>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </ToastProvider>
  )
}

