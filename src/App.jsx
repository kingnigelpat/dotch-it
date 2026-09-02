import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import MobileBottomNav from './components/MobileBottomNav'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import FinderDashboard from './pages/FinderDashboard'
import BusinessDashboard from './pages/BusinessDashboard'
import BusinessSetup from './pages/BusinessSetup'
import BusinessDetail from './pages/BusinessDetail'
import Account from './pages/Account'
import SetupNotice from './components/SetupNotice'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="center-loading">Loading application…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { profile } = useAuth()

  return (
    <div className="app">
      <Navbar />
      <SetupNotice />
      <main className="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<FinderDashboard />} />
          <Route path="/account" element={<Account />} />

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
      <MobileBottomNav />
    </div>
  )
}
