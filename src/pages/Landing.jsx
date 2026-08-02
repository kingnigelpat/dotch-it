import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user, profile } = useAuth()

  return (
    <section className="landing">
      <div className="landing-hero">
        <span className="hero-icon">🔍</span>
        <h1>Find any business near you</h1>
        <p>
          Search restaurants, salons, repair shops and more. Powered by AI to
          understand exactly what you need.
        </p>
        <div className="landing-actions">
          {!user && (
            <>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
              <Link to="/login" className="btn btn-outline">
                I have an account
              </Link>
            </>
          )}
          {user && profile?.role === 'finder' && (
            <Link to="/dashboard" className="btn btn-primary">
              Start searching
            </Link>
          )}
          {user && profile?.role === 'business' && (
            <Link to="/business" className="btn btn-primary">
              Go to my business
            </Link>
          )}
        </div>
      </div>

      <div className="landing-cards">
        <div className="feature-card">
          <span>🔎</span>
          <h3>For finders</h3>
          <p>
            Create a free account and search any business by category or name.
            Get local results instantly.
          </p>
        </div>
        <div className="feature-card">
          <span>🏪</span>
          <h3>For businesses</h3>
          <p>
            Create an account, add your name, logo and two photos of your
            products or services to get discovered.
          </p>
        </div>
        <div className="feature-card">
          <span>🤖</span>
          <h3>AI-powered search</h3>
          <p>
            Type naturally — “best barber near me” — and our AI turns it into
            a smart, local search.
          </p>
        </div>
      </div>
    </section>
  )
}
