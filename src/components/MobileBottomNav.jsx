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

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0
  }

  return (
    <nav className="mobile-bottom-nav">
      <Link
        to="/"
        className={`nav-tab-item ${isActive('/') ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-tab-icon"><i className="fa-solid fa-house" /></span>
        <span className="nav-tab-label">Home</span>
      </Link>

      <Link
        to="/dashboard"
        className={`nav-tab-item ${isActive('/dashboard') ? 'active' : ''}`}
        onClick={handleNavClick}
      >
        <span className="nav-tab-icon"><i className="fa-solid fa-magnifying-glass" /></span>
        <span className="nav-tab-label">Search</span>
      </Link>

      {isBusiness && (
        <Link
          to="/business"
          className={`nav-tab-item ${isActive('/business') ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <span className="nav-tab-icon"><i className="fa-solid fa-chart-line" /></span>
          <span className="nav-tab-label">Business</span>
        </Link>
      )}

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
