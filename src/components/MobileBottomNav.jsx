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
  const businessTarget = isVendor ? '/business' : '/business/setup'

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`nav-tab-item ${isActive('/') && !location.pathname.startsWith('/dashboard') ? 'active' : ''}`}>
        <span className="nav-tab-icon">🏠</span>
        <span className="nav-tab-label">Home</span>
      </Link>

      <Link to="/dashboard" className={`nav-tab-item ${isActive('/dashboard') ? 'active' : ''}`}>
        <span className="nav-tab-icon">🔍</span>
        <span className="nav-tab-label">Explore</span>
      </Link>

      <Link to={businessTarget} className={`nav-tab-item ${isActive('/business') ? 'active' : ''}`}>
        <span className="nav-tab-icon">🏪</span>
        <span className="nav-tab-label">{isVendor ? 'Vendor' : 'List Business'}</span>
      </Link>

      <Link to="/account" className={`nav-tab-item ${isActive('/account') ? 'active' : ''}`}>
        <span className="nav-tab-icon">👤</span>
        <span className="nav-tab-label">
          {!user ? 'Account' : (profile?.name?.split(' ')[0] || 'Account')}
        </span>
      </Link>
    </nav>
  )
}
