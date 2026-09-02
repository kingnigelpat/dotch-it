import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import BusinessCard from '../components/BusinessCard'
import { getAllBusinesses } from '../services/businessService'
import { useEffect } from 'react'

const POPULAR_TAGS = [
  'Hotels',
  'Restaurants',
  'Shoes',
  'Phones',
  'Barbers',
  'Cakes',
  'Mechanics',
  'Salons',
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
      {/* Search Engine Hero Section */}
      <section className="hero-section">
        <div className="hero-brand-badge">
          <img src="/full-logo.png" alt="Dotch" className="hero-full-logo" />
        </div>
        <h1 className="hero-headline">
          Just <span className="text-gradient">Dotch It.</span>
          <br />
          <span style={{ color: 'var(--brand-primary)' }}>Find who has it near you.</span>
        </h1>
        <p className="hero-subhead">
          The local search engine for businesses, products, and services around you.
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

        {/* Popular Trending Searches */}
        <div className="popular-searches">
          <span className="popular-label">Popular:</span>
          {POPULAR_TAGS.map((tag) => (
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

      {/* Featured Local Listings Preview */}
      {featured.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div className="results-header">
            <div>
              <h2 style={{ fontSize: '20px' }}>Discover nearby sellers</h2>
              <p className="results-meta">Popular businesses near {location}</p>
            </div>
            <Link to="/dashboard" className="btn btn-outline btn-sm">
              View all search results →
            </Link>
          </div>

          <div className="results-grid">
            {featured.slice(0, 3).map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}

      {/* How it works summary */}
      <div
        style={{
          marginTop: '64px',
          padding: '40px 24px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
          Searching for local products made effortless
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 24px', fontSize: '14px' }}>
          Type naturally like “Nike Air Force in Lagos” or “Best pizza place in Lekki”.
          Our AI search engine connects you directly with verified local businesses.
        </p>
        <Link to="/register" className="btn btn-primary">
          List your business on Dotch →
        </Link>
      </div>
    </div>
  )
}
