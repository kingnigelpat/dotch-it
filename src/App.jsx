import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import MobileBottomNav from './components/MobileBottomNav'
import Landing from './pages/Landing'
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

export default function App() {
  const { user, profile } = useAuth()

  return (
    <ToastProvider>
      <div className="app">
        <Navbar />
        <SetupNotice />
        <main className="main">
          <Routes>
          <Route path="/" element={user ? <AuthenticatedHome /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<FinderDashboard />} />
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
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  </ToastProvider>
  )
}

