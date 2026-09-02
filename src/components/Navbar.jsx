import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout, viewMode, switchViewMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  const closeMenu = () => setMobileMenuOpen(false)

  const handleViewSwitch = (mode) => {
    switchViewMode(mode)
    if (mode === 'business') {
      if (user) {
        navigate('/business')
      } else {
        navigate('/register')
      }
    } else {
      navigate('/dashboard')
    }
  }

  const isBusinessView = viewMode === 'business'
  const isRegisteredVendor = profile?.role === 'vendor' || profile?.role === 'business'

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo & View Pill */}
        <div className="navbar-brand-group">
          <Link to="/" className="brand" onClick={closeMenu}>
            <img src="/icon-logo.png" alt="Dotch" className="brand-logo-img" />
            <span className="brand-name">
              Dotch<span className="brand-dot">.</span>
            </span>
          </Link>

          {/* Desktop Dual Perspective Toggle: Explorer vs Business Owner */}
          <div className="view-mode-toggle desktop-only" role="tablist" aria-label="Perspective View">
            <button
              type="button"
              className={`view-mode-btn ${!isBusinessView ? 'active' : ''}`}
              onClick={() => handleViewSwitch('explorer')}
            >
              <span className="view-mode-icon">🔎</span>
              <span>Explorer</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${isBusinessView ? 'active' : ''}`}
              onClick={() => handleViewSwitch('business')}
            >
              <span className="view-mode-icon">💼</span>
              <span>Business Owner</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
          {!isBusinessView ? (
            /* ===== EXPLORER VIEW ===== */
            <>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
              >
                🏠 Home
              </Link>
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'nav-link-active' : ''}`}
              >
                🔍 Search & Filter
              </Link>
              <Link
                to="/dashboard?cat=Restaurants"
                className="nav-link"
              >
                🍔 Food & Dining
              </Link>
              <Link
                to="/dashboard?cat=Hotels"
                className="nav-link"
              >
                🏨 Stays
              </Link>

              {!user ? (
                <div className="nav-auth-actions">
                  <Link to="/login" className="nav-link">
                    Log in
                  </Link>
                  <button
                    type="button"
                    className="nav-cta-subtle"
                    onClick={() => handleViewSwitch('business')}
                  >
                    I am a Business Owner →
                  </button>
                </div>
              ) : (
                <div className="nav-user-dropdown">
                  <div className="nav-user-badge">
                    <span className="avatar-circle">
                      {(profile?.name?.[0] || user.email?.[0] || 'E').toUpperCase()}
                    </span>
                    <span className="user-name-text">
                      {profile?.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <span className="badge-pill explorer-badge">Explorer</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ===== BUSINESS OWNER VIEW ===== */
            <>
              {user ? (
                <>
                  <Link
                    to="/business"
                    className={`nav-link ${location.pathname === '/business' ? 'nav-link-active' : ''}`}
                  >
                    📊 Business Portal
                  </Link>
                  <Link
                    to="/business/setup"
                    className={`nav-link ${location.pathname === '/business/setup' ? 'nav-link-active' : ''}`}
                  >
                    ✏️ Edit Listing
                  </Link>
                  <Link
                    to="/dashboard"
                    className="nav-link"
                  >
                    👀 Customer View
                  </Link>

                  <div className="nav-user-dropdown">
                    <div className="nav-user-badge">
                      <span className="avatar-circle vendor-avatar">
                        {(profile?.name?.[0] || user.email?.[0] || 'B').toUpperCase()}
                      </span>
                      <span className="user-name-text">
                        {profile?.name?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                      <span className="badge-pill vendor-badge">Owner</span>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-link">
                    Search Discovery
                  </Link>
                  <Link to="/login" className="nav-link">
                    Owner Login
                  </Link>
                  <Link to="/register" className="nav-cta">
                    ✨ List Your Business Free
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-menu-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-dropdown mobile-only">
          {/* Mobile Switcher */}
          <div className="view-mode-toggle mobile-switcher" style={{ margin: '8px 12px 14px' }}>
            <button
              type="button"
              className={`view-mode-btn ${!isBusinessView ? 'active' : ''}`}
              onClick={() => {
                handleViewSwitch('explorer')
                closeMenu()
              }}
            >
              🔎 Explorer
            </button>
            <button
              type="button"
              className={`view-mode-btn ${isBusinessView ? 'active' : ''}`}
              onClick={() => {
                handleViewSwitch('business')
                closeMenu()
              }}
            >
              💼 Business Owner
            </button>
          </div>

          <Link to="/" className="mobile-menu-item" onClick={closeMenu}>
            🏠 Home
          </Link>
          <Link to="/dashboard" className="mobile-menu-item" onClick={closeMenu}>
            🔍 Search Engine
          </Link>

          {isBusinessView && (
            <Link to={user ? '/business' : '/register'} className="mobile-menu-item mobile-menu-cta" onClick={closeMenu}>
              🏪 Business Owner Portal
            </Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className="mobile-menu-item" onClick={closeMenu}>
                👤 Log in
              </Link>
              <Link to="/register" className="mobile-menu-item mobile-menu-cta" onClick={closeMenu}>
                ✨ Register
              </Link>
            </>
          ) : (
            <button
              className="mobile-menu-item"
              style={{ color: 'var(--accent-rose)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px' }}
              onClick={handleLogout}
            >
              🚪 Sign out ({profile?.name?.split(' ')[0] || user.email})
            </button>
          )}
        </div>
      )}
    </header>
  )
}
