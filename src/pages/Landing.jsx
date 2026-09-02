import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import BusinessCard from '../components/BusinessCard'
import { getAllBusinesses } from '../services/businessService'

const CATEGORY_CARDS = [
  { name: 'Restaurants & Food', icon: '🍔', desc: 'Local delicacies, cafes & fine dining', query: 'Restaurant' },
  { name: 'Hotels & Suites', icon: '🏨', desc: 'Luxury stays, resorts & lodges', query: 'Hotel' },
  { name: 'Fashion & Sneakers', icon: '👟', desc: 'Original shoes, apparel & boutiques', query: 'Fashion' },
  { name: 'Phones & Gadgets', icon: '📱', desc: 'Smartphones, repairs & accessories', query: 'Electronics' },
  { name: 'Beauty & Grooming', icon: '💇', desc: 'Barbers, salons & skincare spas', query: 'Beauty' },
  { name: 'Auto Repair & Parts', icon: '🚗', desc: 'Mechanics, diagnostics & spare parts', query: 'Auto' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Lagos')
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    getAllBusinesses(6).then(setFeatured)
  }, [])

  const handleSearch = (customQuery) => {
    const q = customQuery !== undefined ? customQuery : query
    if (q.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(location)}`)
    } else {
      navigate(`/dashboard`)
    }
  }

  return (
    <div className="landing-page">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-bottom-right" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-brand-badge">
          <img src="/full-logo.png" alt="Dotch" className="hero-full-logo" />
        </div>

        <div className="live-stat-pill">
          <span className="pulse-dot" />
          <span>500+ Verified Stores, Hotels & Services Live</span>
        </div>

        <h1 className="hero-headline">
          Just <span className="text-gradient">Dotch It.</span>
          <br />
          <span className="hero-subline">Find who has it near you.</span>
        </h1>

        <p className="hero-subhead">
          The next-generation local discovery search engine. Type what you are looking for and connect with verified sellers on WhatsApp in seconds.
        </p>

        {/* Central Search Bar */}
        <div className="hero-search-wrapper">
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={() => handleSearch()}
            location={location}
            setLocation={setLocation}
            autoFocus={true}
          />
        </div>

        {/* Popular Quick-Tags */}
        <div className="popular-searches">
          <span className="popular-label">Trending Searches:</span>
          {['Nike Dunks', 'Eko Hotel', 'Pizza in Ikeja', 'iPhone 15', 'Barber Lekki', 'Cake & Pastries'].map((tag) => (
            <button
              key={tag}
              className="chip-tag"
              onClick={() => handleSearch(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Visual Category Cards Grid */}
      <section className="curated-categories-section">
        <div className="section-head-center">
          <h2 className="section-title">Browse Curated Categories</h2>
          <p className="section-desc">Explore thousands of verified listings tailored to your city</p>
        </div>

        <div className="category-cards-grid">
          {CATEGORY_CARDS.map((cat) => (
            <div
              key={cat.name}
              className="curated-category-card"
              onClick={() => handleSearch(cat.query)}
            >
              <div className="cat-icon-wrap">{cat.icon}</div>
              <h3 className="cat-card-title">{cat.name}</h3>
              <p className="cat-card-desc">{cat.desc}</p>
              <span className="cat-card-link">Explore listings →</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Local Listings Preview */}
      {featured.length > 0 && (
        <section className="featured-sellers-section">
          <div className="results-header">
            <div>
              <h2 style={{ fontSize: '22px' }}>⭐ Top Verified Businesses</h2>
              <p className="results-meta">Popular sellers and services near {location}</p>
            </div>
            <Link to="/dashboard" className="btn btn-outline btn-sm">
              View all results in {location} →
            </Link>
          </div>

          <div className="results-grid">
            {featured.slice(0, 3).map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </section>
      )}

      {/* Vendor Growth & Monetization Banner */}
      <section className="vendor-spotlight-banner">
        <div className="vendor-banner-content">
          <span className="badge-pill vendor-badge" style={{ alignSelf: 'flex-start' }}>
            🏪 For Business Owners
          </span>
          <h2 className="vendor-banner-title">
            Are you a seller, hotel, or service provider?
          </h2>
          <p className="vendor-banner-text">
            Get discovered by ready buyers right when they search for what you sell. Start free or boost your listing to the #1 spot with Dotch Pro.
          </p>
          <div className="vendor-banner-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              ✨ List Your Business Free
            </Link>
            <Link to="/subscription" className="btn btn-outline btn-lg">
              ⚡ View Subscription Plans →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
