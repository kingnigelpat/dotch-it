import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function MobileBottomNav() {
  const location = useLocation()
  const { user, profile } = useAuth()

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const isVendor = profile?.role === 'vendor' || profile?.role === 'business'
  const businessTarget = isVendor ? '/business' : '/list-business'

  return (
    <nav className="mobile-bottom-nav">
      <Link
        to="/"
        className={`nav-tab-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
      >
        <span className="nav-tab-icon">🏠</span>
        <span className="nav-tab-label">Home</span>
      </Link>

      <Link
        to="/dashboard"
        className={`nav-tab-item ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <span className="nav-tab-icon">🔍</span>
        <span className="nav-tab-label">Explore</span>
      </Link>

      <Link
        to={businessTarget}
        className={`nav-tab-item ${isActive('/list-business') || isActive('/business') ? 'active' : ''}`}
      >
        <span className="nav-tab-icon">🏪</span>
        <span className="nav-tab-label">List Business</span>
      </Link>
    </nav>
  )
}
