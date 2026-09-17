import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout, theme, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isBusiness = profile?.role === 'vendor' || profile?.role === 'business'
  const isAdmin = profile?.role === 'admin'

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand-group">
          <Link to="/" className="brand">
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
            🔍 Search
          </Link>

          {isBusiness && (
            <Link
              to="/business"
              className={`nav-link ${location.pathname.startsWith('/business') ? 'nav-link-active' : ''}`}
            >
              📊 Business
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname === '/admin' ? 'nav-link-active' : ''}`}
              style={{ color: 'var(--brand-primary)', fontWeight: 800 }}
            >
              🛡️ Admin
            </Link>
          )}

          <Link
            to="/account"
            className={`nav-link ${location.pathname === '/account' ? 'nav-link-active' : ''}`}
          >
            ⚙️ Settings
          </Link>

          {/* Theme Toggle Button */}
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
              <Link to="/register" className="nav-cta">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="nav-user-dropdown">
              <Link to="/account" className="nav-user-badge" style={{ textDecoration: 'none' }}>
                <span className={`avatar-circle ${isBusiness ? 'vendor-avatar' : ''}`}>
                  {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </span>
                <span className="user-name-text">
                  {profile?.name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <span className={`badge-pill ${isAdmin ? 'admin-badge' : isBusiness ? 'vendor-badge' : 'explorer-badge'}`}>
                  {isAdmin ? 'Admin' : isBusiness ? 'Business' : 'Explorer'}
                </span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
                Sign out
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Right Controls: Minimal & Clean (No duplicate menu drawer) */}
        <div className="mobile-right-controls mobile-only">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!user ? (
            <Link
              to="/login"
              className="btn btn-outline btn-sm"
              style={{ padding: '5px 12px', fontSize: '13px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
            >
              Log in
            </Link>
          ) : (
            <Link
              to="/account"
              className="nav-user-badge"
              style={{ textDecoration: 'none', padding: '4px 8px' }}
              title="Profile & Settings"
            >
              <span className={`avatar-circle ${isBusiness ? 'vendor-avatar' : ''}`} style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
