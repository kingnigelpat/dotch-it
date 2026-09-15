import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '40px',
        }}
      >
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>🏪</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Dotch
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '280px' }}>
            Nigeria's trusted local business discovery directory. Connect directly with verified vendors, hotels, stores, and service providers via WhatsApp.
          </p>
        </div>

        {/* Col 2: For Customers & Explorers */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            Discover
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/dashboard" style={{ fontSize: '13.5px', color: 'var(--text-secondary)', transition: 'color 0.15s' }}>
                🔍 Explore Nearby Stores
              </Link>
            </li>
            <li>
              <Link to="/dashboard?category=Restaurant" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                🍽️ Restaurants & Dining
              </Link>
            </li>
            <li>
              <Link to="/dashboard?category=Hotel+%26+Travel" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                🏨 Hotels & Stays
              </Link>
            </li>
            <li>
              <Link to="/dashboard?category=Fashion+%26+Clothing" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                👟 Fashion & Boutiques
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: For Vendors */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            For Businesses
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/list-business" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                ✨ List Your Business
              </Link>
            </li>
            <li>
              <Link to="/subscription" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                💼 Plans & Pricing
              </Link>
            </li>
            <li>
              <Link to="/business" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                📊 Vendor Dashboard
              </Link>
            </li>
            <li>
              <Link to="/terms" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                📜 Terms & Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Support & Direct Contact */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            Help & WhatsApp
          </h4>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
            Have questions about your listing or payment? Chat directly with Dotch admin support.
          </p>
          <a
            href="https://wa.me/2347073544811?text=Hello%20Dotch%20Support%2C%20I%20have%20an%20inquiry%20regarding%20Dotch."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>💬</span>
            <span>+234 707 354 4811</span>
          </a>
        </div>
      </div>

      {/* Bottom Bar with Developed by RAE attribution */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          © {currentYear} Dotch. All rights reserved. •{' '}
          <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
            Terms & Policy
          </Link>
        </div>

        {/* DEVELOPED BY RAE */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-muted)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span>Developed by</span>
          <a
            href="https://www.raehub.live"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--brand-primary)',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '0.3px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>RAE</span>
            <span style={{ fontSize: '11px' }}>↗</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
