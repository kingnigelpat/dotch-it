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
          🏪 For Nigerian Business Owners & Vendors
        </span>
        <h1 className="list-biz-title">
          List Your Business On Dotch &<br />
          <span className="hero-gradient-text">Get Discovered By Ready Customers</span>
        </h1>
        <p className="list-biz-subtitle">
          Connect directly with thousands of buyers, tourists, and researchers searching for hotels, restaurants, shops, and services across Nigerian cities every day.
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
              💬
            </div>
            <h3>100% Direct WhatsApp Deals</h3>
            <p>
              Zero commission fees. When customers find you, they tap one button to chat or call you directly on WhatsApp. You negotiate and keep 100% of your money.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
              📸
            </div>
            <h3>Verified Place & Product Photos</h3>
            <p>
              Customers don't trust text-only listings. Post high quality photos of your storefront, hotel rooms, food dishes, or gadgets to prove you are real.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
              📍
            </div>
            <h3>Exact Neighborhood Visibility</h3>
            <p>
              Customers in Lekki, Ikeja, Maitama, Dugbe, Choba, or Ogbete can see you are nearby and walk into your store or order on the spot.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-rose)' }}>
              ⭐
            </div>
            <h3>Official Verified Gold Badge</h3>
            <p>
              Separate your genuine business from online impersonators and scammers with Dotch's official verified business checkmark.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>
              🔎
            </div>
            <h3>10,000+ Daily Searches</h3>
            <p>
              Thousands of tourists, business travelers, and ready buyers search Dotch every day looking for places to stay, eat, and buy.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
              ⚡
            </div>
            <h3>Instant 5-Minute Setup</h3>
            <p>
              No lengthy paperwork. Just register, paste your business details and photos, and your listing goes live across Nigeria immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section — Tell Them Price */}
      <section className="list-biz-section" style={{ marginTop: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">SIMPLE & AFFORDABLE PRICING</span>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Choose Your Business Listing Plan
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>
            No contracts. No hidden fees. Straightforward vendor pricing.
          </p>
        </div>

        <div className="plans-grid" style={{ maxWidth: '780px', margin: '0 auto' }}>
          {/* 1 Month Plan */}
          <div className="plan-card">
            <div className="plan-head">
              <h3 className="plan-name">1 Month Vendor Plan</h3>
              <div className="plan-price-wrap">
                <span className="plan-price">₦5,000</span>
                <span className="plan-interval">/ month</span>
              </div>
            </div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Full 30-day active search listing</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Upload place & product photos</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Direct WhatsApp & phone contact buttons</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Exact address & neighborhood search</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Basic search directory placement</span>
              </li>
            </ul>

            <Link
              to={user ? '/business/setup' : '/register?role=vendor'}
              className="btn btn-outline btn-block"
              style={{ textAlign: 'center', marginTop: 'auto' }}
            >
              {user ? 'Set Up Listing →' : 'Sign Up for ₦5,000 Plan →'}
            </Link>
          </div>

          {/* 2 Months Plan — Highlighted */}
          <div className="plan-card plan-highlight">
            <div className="plan-badge">🔥 BEST VALUE • SAVE ₦2,001</div>
            <div className="plan-head">
              <h3 className="plan-name">2 Months Vendor Plan</h3>
              <div className="plan-price-wrap">
                <span className="plan-price">₦7,999</span>
                <span className="plan-interval">/ 2 months</span>
              </div>
            </div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Full 60-day active search listing</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span><strong>5x Search Visibility Boost</strong></span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span><strong>Top of Search Category Placement</strong></span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span><strong>Official Gold Verified Badge</strong></span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Upload multiple place & product photos</span>
              </li>
              <li className="plan-feature-item">
                <span className="feature-check">✓</span>
                <span>Instant WhatsApp & phone click buttons</span>
              </li>
            </ul>

            <Link
              to={user ? '/business/setup' : '/register?role=vendor'}
              className="btn btn-primary btn-block"
              style={{ textAlign: 'center', marginTop: 'auto' }}
            >
              {user ? 'Get 2 Months Plan →' : 'Sign Up for ₦7,999 Plan →'}
            </Link>
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
            ✨ Register & List Your Business
          </Link>
          {!user && (
            <Link to="/login?redirect=/business" className="btn btn-outline btn-lg">
              👤 Already have an account? Log in
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
