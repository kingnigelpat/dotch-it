import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user, profile } = useAuth()

  const primaryTarget = !user
    ? '/register'
    : profile?.role === 'business'
      ? '/business'
      : '/dashboard'

  const primaryLabel = !user
    ? 'Get started'
    : profile?.role === 'business'
      ? 'Go to my business'
      : 'Start searching'

  return (
    <section className="landing">
      <div className="landing-hero">
        <span className="hero-badge">
          <span className="hero-badge-dot" />
          Powered by AI search
        </span>
        <h1>
          Find any business{' '}
          <span className="gradient-text">near you</span>
        </h1>
        <p className="hero-subtitle">
          Search restaurants, salons, repair shops and more. Type naturally —
          our AI turns it into a smart, local search.
        </p>

        <div className="search-mock" aria-hidden="true">
          <span className="search-mock-icon">🔍</span>
          <span className="search-mock-text">best barber near me</span>
          <span className="search-mock-btn">Search</span>
        </div>

        <div className="landing-actions">
          <Link to={primaryTarget} className="btn btn-primary btn-lg">
            {primaryLabel}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-outline btn-lg">
              I have an account
            </Link>
          )}
        </div>

        <ul className="hero-points">
          <li>
            <span>✓</span> Free to start
          </li>
          <li>
            <span>✓</span> Local results
          </li>
          <li>
            <span>✓</span> No cards required
          </li>
        </ul>
      </div>

      <div className="landing-cards">
        <div className="feature-card">
          <div className="feature-icon feature-icon-indigo">🔎</div>
          <h3>For finders</h3>
          <p>
            Create a free account and search any business by category or name.
            Get local results instantly.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon feature-icon-amber">🏪</div>
          <h3>For businesses</h3>
          <p>
            Create an account, add your name, logo and two photos of your
            products or services to get discovered.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon feature-icon-emerald">🤖</div>
          <h3>AI-powered search</h3>
          <p>
            Type naturally — “best barber near me” — and our AI turns it into
            a smart, local search.
          </p>
        </div>
      </div>

      <div className="landing-cta">
        <h2>Ready to discover what’s around you?</h2>
        <p>
          Join local finders and businesses today — it takes less than a
          minute to sign up.
        </p>
        <Link to={primaryTarget} className="btn btn-primary btn-lg">
          {primaryLabel}
        </Link>
      </div>
    </section>
  )
}
