import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ListBusiness() {
  const { user, profile } = useAuth()
  const isVendor = profile?.role === 'vendor' || profile?.role === 'business'

  return (
    <div className="list-business-page">
      {/* Hero Section */}
      <div className="list-biz-hero">
        <span className="badge-pill vendor-badge" style={{ display: 'inline-flex', marginBottom: '12px' }}>
          <i className="fa-solid fa-store" style={{ marginRight: '5px' }} /> For Nigerian Business Owners & Vendors
        </span>
        <h1 className="list-biz-title">
          List Your Business On Dotch &<br />
          <span className="hero-gradient-text">Get Discovered By Ready Customers</span>
        </h1>
        <p className="list-biz-subtitle">
          Connect directly with thousands of buyers, clients, and researchers searching for restaurants, shops, gadgets, and services across Nigerian cities every day.
        </p>

        {/* Existing Account or Status Banner */}
        {user ? (
          <div className="list-biz-user-banner">
            <span>
              Logged in as <strong>{profile?.name || user.email}</strong>
              {isVendor ? ' (Registered Vendor)' : ' (Explorer Account)'}
            </span>
            {isVendor ? (
              <Link to="/business" className="btn btn-primary btn-sm">
                Go to Vendor Dashboard →
              </Link>
            ) : (
              <Link to="/business/setup" className="btn btn-primary btn-sm">
                Set Up Your Business Profile →
              </Link>
            )}
          </div>
        ) : (
          <div className="list-biz-auth-prompt">
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Already have a vendor account?
            </span>
            <Link to="/login?redirect=/business" className="btn btn-outline btn-sm">
              Log in to your account →
            </Link>
          </div>
        )}
      </div>

      {/* Benefits Grid — Convince Them */}
      <section className="list-biz-section">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">WHY LIST ON DOTCH</span>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Real Benefits for Growing Your Sales
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
            Everything you need to turn searchers into paying customers
          </p>
        </div>

        <div className="list-biz-benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>
              <i className="fa-solid fa-magnifying-glass" />
            </div>
            <h3>Get Discovered by Ready Buyers</h3>
            <p>
              Appear instantly in searches when customers, clients, and researchers look for what you sell across Nigerian cities.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
              <i className="fa-solid fa-store" />
            </div>
            <h3>Create a Public Business Profile</h3>
            <p>
              Get an official, search-indexed business profile on Dotch showcasing your authentic brand name, description, and verified credentials.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
              <i className="fa-solid fa-camera" />
            </div>
            <h3>Display Your Products or Services</h3>
            <p>
              Upload real photos of your storefront, dishes, gadgets, or workshop so buyers can see and trust your quality before contacting you.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-rose)' }}>
              <i className="fa-solid fa-location-dot" />
            </div>
            <h3>Reach Customers in Your Location</h3>
            <p>
              Connect with nearby buyers in your exact city and neighborhood (Lekki, Ikeja, Maitama, Wuse, Bodija, Choba, and more).
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>
              <i className="fa-solid fa-chart-line" />
            </div>
            <h3>Track Useful Business Growth</h3>
            <p>
              Monitor your listing status and discover how customers search and reach out to your business on Dotch.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
              <i className="fa-brands fa-whatsapp" />
            </div>
            <h3>Direct WhatsApp Contact</h3>
            <p>
              Buyers chat directly on your personal WhatsApp line. Keep 100% of your customer relationships and profits with zero platform commission.
            </p>
          </div>
        </div>
      </section>

      {/* Free Listing Plan Section */}
      <section className="list-biz-section" style={{ marginTop: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">100% FREE FOR ALL VENDORS</span>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Free Forever Business Listing
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
            Zero listing fees. Zero monthly subscriptions. Zero middleman commissions.
          </p>
        </div>

        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div className="plan-card plan-highlight" style={{ padding: '32px 28px' }}>
            <div className="plan-badge"><i className="fa-solid fa-gift" style={{ marginRight: '4px' }} /> 100% FREE FOREVER</div>
            <div className="plan-head">
              <h3 className="plan-name" style={{ fontSize: '22px' }}>Standard Verified Vendor Listing</h3>
              <div className="plan-price-wrap">
                <span className="plan-price" style={{ fontSize: '36px' }}>₦0</span>
                <span className="plan-interval">/ Free Forever</span>
              </div>
            </div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span><strong>Active search listing across Nigerian cities</strong></span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span><strong>Official Verified Business Profile & Green Badge</strong></span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Upload storefront, place & product photos</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Direct WhatsApp & phone hotline buttons (0% commission)</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">📜</span>
                <span><strong>Proof of Business Verification:</strong> Send your CAC report or business document to <strong>championsmail18@gmail.com</strong></span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Real-time customer view & WhatsApp click tracking</span>
              </li>
            </ul>

            <Link
              to={user ? '/business/setup' : '/register?role=vendor'}
              className="btn btn-primary btn-block btn-lg"
              style={{ textAlign: 'center', marginTop: '24px', fontWeight: 800 }}
            >
              {user ? '✨ Register Business Profile (100% Free) →' : '🚀 Register Business 100% Free →'}
            </Link>

            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
              🛡️ <strong>Scam-Free Guarantee:</strong> Only businesses with verified CAC or company certificates sent to championsmail18@gmail.com receive an official verified badge.
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA & Log In Switcher */}
      <section className="list-biz-cta-box">
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Ready to put your business on the map?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px', margin: '0 auto 24px' }}>
          Create your vendor account today and start receiving customer inquiries directly on WhatsApp.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to={user ? '/business/setup' : '/register?role=vendor'} className="btn btn-primary btn-lg">
            <i className="fa-solid fa-rocket" style={{ marginRight: '5px' }} /> Register & List Your Business
          </Link>
          {!user && (
            <Link to="/login?redirect=/business" className="btn btn-outline btn-lg">
              <i className="fa-solid fa-user" style={{ marginRight: '5px' }} /> Already have an account? Log in
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
