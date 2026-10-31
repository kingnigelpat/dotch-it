import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function MobileBottomNav() {
  const location = useLocation()
  const { user, profile } = useAuth()

  // Do not show bottom nav on landing page or for logged-out visitors
  if (!user || location.pathname === '/') {
    return null
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const isBusiness = profile?.role === 'vendor' || profile?.role === 'business'
  const isAdmin = profile?.role === 'admin'

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0
  }

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. Home tab */}
      <Link
        to="/"
        className={`nav-tab-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-tab-icon"><i className="fa-solid fa-house" /></span>
        <span className="nav-tab-label">Home</span>
      </Link>

      {/* 2. AI Discover tab */}
      <Link
        to="/discover"
        className={`nav-tab-item ${location.pathname.startsWith('/discover') ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-tab-icon"><i className="fa-solid fa-sparkles" /></span>
        <span className="nav-tab-label">Discover</span>
      </Link>

      {/* 3. Campaign Ads tab */}
      <Link
        to="/subscription"
        className={`nav-tab-item nav-tab-campaign-bold ${isActive('/subscription') ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-tab-icon">
          <i className="fa-solid fa-bullhorn" />
          <span className="tab-micro-badge">Ads</span>
        </span>
        <span className="nav-tab-label">Campaigns</span>
      </Link>

      {/* 4. Business Storefront tab */}
      <Link
        to={isBusiness ? '/business' : '/list-business'}
        className={`nav-tab-item ${isActive('/business') || isActive('/list-business') ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-tab-icon"><i className="fa-solid fa-store" /></span>
        <span className="nav-tab-label">{isBusiness ? 'Business' : 'List Store'}</span>
      </Link>

      {/* 4. Admin tab (if admin) */}
      {isAdmin && (
        <Link
          to="/admin"
          className={`nav-tab-item ${isActive('/admin') ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <span className="nav-tab-icon"><i className="fa-solid fa-shield-halved" /></span>
          <span className="nav-tab-label">Admin</span>
        </Link>
      )}

      {/* 5. Settings / Profile tab */}
      <Link
        to="/account"
        className={`nav-tab-item ${isActive('/account') ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-tab-icon"><i className="fa-solid fa-gear" /></span>
        <span className="nav-tab-label">Settings</span>
      </Link>
    </nav>
  )
}
