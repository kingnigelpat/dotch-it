import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function MobileBottomNav() {
  const location = useLocation()
  const { profile } = useAuth()

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const isBusiness = profile?.role === 'vendor' || profile?.role === 'business'
  const isAdmin = profile?.role === 'admin'

  return (
    <nav className="mobile-bottom-nav">
      <Link
        to="/"
        className={`nav-tab-item ${isActive('/') ? 'active' : ''}`}
      >
        <span className="nav-tab-icon">🏠</span>
        <span className="nav-tab-label">Home</span>
      </Link>

      <Link
        to="/dashboard"
        className={`nav-tab-item ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <span className="nav-tab-icon">🔍</span>
        <span className="nav-tab-label">Search</span>
      </Link>

      {isBusiness && (
        <Link
          to="/business"
          className={`nav-tab-item ${isActive('/business') ? 'active' : ''}`}
        >
          <span className="nav-tab-icon">📊</span>
          <span className="nav-tab-label">Business</span>
        </Link>
      )}

      {isAdmin && (
        <Link
          to="/admin"
          className={`nav-tab-item ${isActive('/admin') ? 'active' : ''}`}
        >
          <span className="nav-tab-icon">🛡️</span>
          <span className="nav-tab-label">Admin</span>
        </Link>
      )}

      <Link
        to="/account"
        className={`nav-tab-item ${isActive('/account') ? 'active' : ''}`}
      >
        <span className="nav-tab-icon">⚙️</span>
        <span className="nav-tab-label">Settings</span>
      </Link>
    </nav>
  )
}
