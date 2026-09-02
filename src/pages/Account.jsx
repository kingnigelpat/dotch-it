import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { user, profile, logout, viewMode, switchViewMode } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isBusiness = profile?.role === 'vendor' || profile?.role === 'business'

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-card">
          <div className="account-hero-icon">👤</div>
          <h2>Welcome to Dotch</h2>
          <p className="account-subtitle">
            Log in or create an account to manage your searches, bookmark businesses, or list your store.
          </p>
          <div className="account-auth-buttons">
            <Link to="/login" className="btn btn-primary btn-block">
              Log in
            </Link>
            <Link to="/register" className="btn btn-outline btn-block">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="account-card">
        {/* User Header */}
        <div className="account-header">
          <div className="account-avatar">
            {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="account-user-info">
            <h2 className="account-name">{profile?.name || 'Explorer'}</h2>
            <p className="account-email">{user.email}</p>
            <span className={`badge-pill ${isBusiness ? 'vendor-badge' : 'explorer-badge'}`}>
              {isBusiness ? '🏪 Business Owner / Vendor' : '🔎 Explorer Account'}
            </span>
          </div>
        </div>

        <hr className="account-divider" />

        {/* View Switcher Section */}
        <div className="account-section">
          <h3 className="account-section-title">Active Experience Mode</h3>
          <p className="account-section-desc">
            Toggle your interface perspective between browsing as a customer or managing a business.
          </p>
          <div className="view-mode-toggle account-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode !== 'business' ? 'active' : ''}`}
              onClick={() => switchViewMode('explorer')}
            >
              🔎 Explorer Mode
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'business' ? 'active' : ''}`}
              onClick={() => switchViewMode('business')}
            >
              💼 Business Owner Mode
            </button>
          </div>
        </div>

        <hr className="account-divider" />

        {/* Quick Links */}
        <div className="account-section">
          <h3 className="account-section-title">Quick Actions</h3>
          <div className="account-links-list">
            <Link to="/dashboard" className="account-link-row">
              <span className="account-link-icon">🔍</span>
              <div className="account-link-text">
                <strong>Explore & Search</strong>
                <small>Find stores, hotels, and services nearby</small>
              </div>
              <span className="account-link-chevron">›</span>
            </Link>

            <Link to={isBusiness ? "/business" : "/business/setup"} className="account-link-row">
              <span className="account-link-icon">🏪</span>
              <div className="account-link-text">
                <strong>{isBusiness ? 'Business Listing Portal' : 'List a Business on Dotch'}</strong>
                <small>{isBusiness ? 'Manage inquiries, catalog and details' : 'Reach thousands of local customers'}</small>
              </div>
              <span className="account-link-chevron">›</span>
            </Link>

            {isBusiness && (
              <Link to="/business/setup" className="account-link-row">
                <span className="account-link-icon">✏️</span>
                <div className="account-link-text">
                  <strong>Edit Business Info</strong>
                  <small>Update phone, location, photos and prices</small>
                </div>
                <span className="account-link-chevron">›</span>
              </Link>
            )}
          </div>
        </div>

        <hr className="account-divider" />

        {/* Logout */}
        <button className="btn btn-danger btn-block" onClick={handleLogout}>
          🚪 Sign out
        </button>
      </div>
    </div>
  )
}
