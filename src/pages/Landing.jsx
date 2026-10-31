import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Landing Page (/)
 * 
 * Simple and clean:
 * - Dotch logo
 * - One headline
 * - One short line of text
 * - One primary button ("Start discovering")
 * 
 * Does NOT contain the AI conversation or a listings feed.
 */
export default function Landing() {
  const { user, profile } = useAuth()
  const isVendor = profile?.role === 'vendor' || profile?.role === 'business'

  return (
    <div className="landing-minimal-page">
      <div className="landing-ambient-bg" />

      <main className="landing-minimal-card">
        {/* Dotch Logo */}
        <div className="landing-logo-container">
          <div className="landing-logo-glow" />
          <img
            src="/icon-logo.png"
            alt="Dotch"
            className="landing-brand-logo"
            width="84"
            height="84"
          />
          <span className="landing-brand-name">
            Dotch<span className="brand-dot">.</span>
          </span>
        </div>

        {/* One Headline */}
        <h1 className="landing-minimal-headline">
          Find Any Business in Nigeria
        </h1>

        {/* One Short Line of Text */}
        <p className="landing-minimal-subtext">
          AI-powered discovery connecting buyers with verified local sellers and services.
        </p>

        {/* One Primary Button */}
        <div className="landing-primary-action">
          <Link to="/discover" className="btn-start-discovering">
            <span>Start discovering</span>
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>

        {/* Quiet Seller Link (Preserving vendor feature without cluttering buyer flow) */}
        <div className="landing-seller-secondary-link">
          <Link
            to={user ? (isVendor ? '/business' : '/business/setup') : '/list-business'}
            className="seller-quiet-link"
          >
            Own a business? List your store →
          </Link>
        </div>
      </main>
    </div>
  )
}
