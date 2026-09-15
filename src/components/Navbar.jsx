import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout, theme, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  const closeMenu = () => setMobileMenuOpen(false)
  const isVendor = profile?.role === 'vendor' || profile?.role === 'business'
  const isAdmin = profile?.role === 'admin'

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand-group">
          <Link to="/" className="brand" onClick={closeMenu}>
            <img src="/icon-logo.png" alt="Dotch" className="brand-logo-img" />
            <span className="brand-name">
              Dotch<span className="brand-dot">.</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
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
            🔍 Explore
          </Link>

          {isVendor ? (
            <Link
              to="/business"
              className={`nav-link ${location.pathname.startsWith('/business') ? 'nav-link-active' : ''}`}
            >
              🏪 Vendor Dashboard
            </Link>
          ) : (
            <Link
              to="/list-business"
              className={`nav-link ${location.pathname === '/list-business' ? 'nav-link-active' : ''}`}
            >
              🏪 List Business
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname === '/admin' ? 'nav-link-active' : ''}`}
              style={{ color: 'var(--brand-primary)', fontWeight: 800 }}
            >
              🛡️ Admin Panel
            </Link>
          )}

          {/* Single Theme Toggle Button */}
          <button
            type="button"
            id="navbar-theme-toggle"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!user ? (
            <div className="nav-auth-actions">
              <Link to="/login" className="nav-link" style={{ fontWeight: 600 }}>
                Log in
              </Link>
              <Link to="/list-business" className="nav-cta">
                ✨ List Your Business
              </Link>
            </div>
          ) : (
            <div className="nav-user-dropdown">
              <div className="nav-user-badge">
                <span className={`avatar-circle ${isVendor ? 'vendor-avatar' : ''}`}>
                  {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </span>
                <span className="user-name-text">
                  {profile?.name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <span className={`badge-pill ${isAdmin ? 'admin-badge' : isVendor ? 'vendor-badge' : 'explorer-badge'}`}>
                  {isAdmin ? 'Admin' : isVendor ? 'Vendor' : 'Explorer'}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
                Sign out
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Right Controls */}
        <div className="mobile-right-controls mobile-only">
          {!user && (
            <Link
              to="/login"
              className="btn btn-outline btn-sm"
              style={{ padding: '5px 12px', fontSize: '13px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
            >
              Log in
            </Link>
          )}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-dropdown mobile-only">
          <Link to="/" className="mobile-menu-item" onClick={closeMenu}>
            🏠 Home
          </Link>
          <Link to="/dashboard" className="mobile-menu-item" onClick={closeMenu}>
            🔍 Explore
          </Link>
          <Link
            to={isVendor ? '/business' : '/list-business'}
            className="mobile-menu-item"
            onClick={closeMenu}
          >
            🏪 {isVendor ? 'Vendor Dashboard' : 'List Business'}
          </Link>

          {isAdmin && (
            <Link to="/admin" className="mobile-menu-item" style={{ color: 'var(--brand-primary)', fontWeight: 800 }} onClick={closeMenu}>
              🛡️ Admin Panel
            </Link>
          )}

          {!user ? (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" className="mobile-menu-item" onClick={closeMenu}>
                👤 Log in
              </Link>
              <Link to="/register" className="mobile-menu-item mobile-menu-cta" onClick={closeMenu}>
                ✨ Create Account
              </Link>
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '6px' }}>
              <button
                className="mobile-menu-item"
                style={{ color: 'var(--accent-rose)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px' }}
                onClick={handleLogout}
              >
                🚪 Sign out ({profile?.name?.split(' ')[0] || user.email})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
