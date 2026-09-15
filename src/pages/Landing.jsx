import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import BusinessCard from '../components/BusinessCard'
import { getAllBusinesses } from '../services/businessService'

const LIVE_ACTIVITIES = [
  { icon: '🟢', city: 'Lagos', text: 'Someone in Lekki contacted Kicks Hub on WhatsApp for Nike Dunks' },
  { icon: '🏨', city: 'Abuja', text: 'Tourist booked executive suite at Transcorp Hilton Maitama' },
  { icon: '🔬', city: 'Ibadan', text: 'University researcher located specialized electronic components in Dugbe' },
  { icon: '🍔', city: 'Lagos', text: 'Foodie discovered Yellow Chilli Restaurant & Bar in Victoria Island' },
  { icon: '📱', city: 'Port Harcourt', text: 'Buyer ordered iPhone 15 Pro Max from verified tech hub in Choba' },
  { icon: '🚗', city: 'Enugu', text: 'Driver found genuine Toyota spare parts in Ogbete Market' },
]



const CATEGORY_CARDS = [
  { name: 'Hotels & Luxury Suites', icon: '🏨', count: '120+ Verified Stays', desc: '5-star suites, boutique resorts, serviced apartments & lodges', query: 'Hotel' },
  { name: 'Food & Fine Dining', icon: '🍔', count: '350+ Kitchens & Cafes', desc: 'Authentic African cuisines, gourmet seafood, grills & fast eats', query: 'Restaurant' },
  { name: 'Sneakers & Streetwear', icon: '👟', count: '180+ Stores', desc: 'Original Nike, Adidas, bespoke fashion & premium urban boutiques', query: 'Fashion' },
  { name: 'Phones & Tech Gadgets', icon: '📱', count: '240+ Tech Hubs', desc: 'Original smartphones, laptops, repairs & authentic accessories', query: 'Electronics' },
  { name: 'Research & Hardware Hubs', icon: '🔬', count: '90+ Specialists', desc: 'Lab components, specialized materials, books & technical tools', query: 'Research' },
  { name: 'Beauty, Spas & Grooming', icon: '💇', count: '160+ Salons', desc: 'Celebrity barbers, luxury wellness spas & aesthetic studios', query: 'Beauty' },
  { name: 'Auto Repair & Spare Parts', icon: '🚗', count: '110+ Workshops', desc: 'Certified diagnostics, mechanics, batteries & genuine OEM parts', query: 'Auto' },
  { name: 'Nightlife, Lounges & Events', icon: '🍸', count: '95+ Venues', desc: 'VIP lounges, rooftop bars, beach clubs & private event centers', query: 'Nightlife' },
]

const POPULAR_CATEGORIES = [
  { label: 'Hotels & Suites', icon: '🏨', query: 'Hotel' },
  { label: 'Restaurants & Dining', icon: '🍔', query: 'Restaurant' },
  { label: 'Sneakers & Streetwear', icon: '👟', query: 'Fashion' },
  { label: 'Phones & Gadgets', icon: '📱', query: 'Electronics' },
  { label: 'Auto & Spare Parts', icon: '🚗', query: 'Auto' },
  { label: 'Beauty & Spas', icon: '💇', query: 'Beauty' },
  { label: 'Nightlife & Lounges', icon: '🍸', query: 'Nightlife' },
  { label: 'Hardware & Supplies', icon: '🔬', query: 'Hardware' },
]

const TRENDING_SEARCHES = [
  'Nike Dunks Lagos',
  'Transcorp Hilton Abuja',
  'Yellow Chilli VI',
  'iPhone 16 Ikeja',
  'Amala Sky Dugbe',
  'Toyota OEM Parts',
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Lagos')
  const [featured, setFeatured] = useState([])
  const [activeActivityIndex, setActiveActivityIndex] = useState(0)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all')

  useEffect(() => {
    getAllBusinesses(12).then(setFeatured)
  }, [])

  // Rotate live activity ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveActivityIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (customQuery) => {
    const q = customQuery !== undefined ? customQuery : query
    if (q.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(location)}`)
    } else {
      navigate(`/dashboard?loc=${encodeURIComponent(location)}`)
    }
  }

  const filteredFeatured = featured.filter((b) => {
    if (selectedCategoryTab === 'all') return true
    if (selectedCategoryTab === 'hotel') return (b.category || '').toLowerCase().includes('hotel')
    if (selectedCategoryTab === 'food') return (b.category || '').toLowerCase().includes('restaurant') || (b.category || '').toLowerCase().includes('food')
    if (selectedCategoryTab === 'fashion') return (b.category || '').toLowerCase().includes('fashion')
    if (selectedCategoryTab === 'tech') return (b.category || '').toLowerCase().includes('tech') || (b.category || '').toLowerCase().includes('electronic')
    return true
  })

  return (
    <div className="landing-page">
      {/* Top Real-Time Activity Ticker */}
      <div className="live-activity-bar">
        <div className="live-activity-inner">
          <span className="live-badge-pulse">
            <span className="pulse-dot" />
            LIVE ACTIVITY
          </span>
          <div className="live-ticker-message" key={activeActivityIndex}>
            <span className="ticker-icon">{LIVE_ACTIVITIES[activeActivityIndex].icon}</span>
            <span className="ticker-city">{LIVE_ACTIVITIES[activeActivityIndex].city}:</span>
            <span className="ticker-text">{LIVE_ACTIVITIES[activeActivityIndex].text}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Brand Logo & Search Engine Header */}
        <div className="hero-brand-badge">
          <img src="/full-logo.png" alt="Dotch" className="hero-full-logo" />
        </div>

        <div className="live-stat-pill">
          <span className="badge-sparkle">🇳🇬</span>
          <span>Nigeria's Verified Business, Hotel & Product Search Engine</span>
        </div>

        {/* Existing Account or Status Notice in Home Section */}
        {!user ? (
          <div className="home-auth-strip">
            <span className="home-auth-text">Already have an account?</span>
            <Link to="/login" className="home-auth-login-link">
              Log in here →
            </Link>
            <span className="home-auth-divider">•</span>
            <Link to="/register" className="home-auth-register-link">
              Create free account
            </Link>
          </div>
        ) : (
          <div className="home-auth-strip home-auth-welcome">
            <span className="home-auth-text">
              👋 Welcome back, <strong>{profile?.name?.split(' ')[0] || user.email?.split('@')[0]}</strong>
            </span>
            {profile?.role === 'admin' ? (
              <Link to="/admin" className="badge-pill explorer-badge">🛡️ Admin Panel</Link>
            ) : (profile?.role === 'vendor' || profile?.role === 'business') ? (
              <Link to="/business" className="badge-pill vendor-badge">🏪 Vendor Dashboard</Link>
            ) : (
              <Link to="/dashboard" className="badge-pill explorer-badge">🔍 Explore Places</Link>
            )}
          </div>
        )}

        <h1 className="hero-headline">
          The Search Engine For
          <br />
          <span className="hero-gradient-text">Real Places & Products.</span>
        </h1>

        <p className="hero-subhead">
          Search anything you need around your city. Inspect verified photos of places and products, check exact locations, and connect directly on WhatsApp with zero middlemen.
        </p>

        {/* Hero Search Box */}
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

        {/* Quick Category Shortcuts */}
        <div className="persona-nav-wrap">
          <div className="persona-tag-strip">
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                className="chip-tag chip-tag-glow"
                onClick={() => handleSearch(cat.query)}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Trending Searches */}
          <div className="popular-searches">
            <span className="popular-label">Trending:</span>
            {TRENDING_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                className="chip-tag"
                onClick={() => handleSearch(tag)}
                style={{ fontSize: '12.5px', padding: '4px 12px' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Core Pillars (Buyers, Tourists, Researchers) */}
      <section className="value-pillars-section">
        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-wrap" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>
              🛍️
            </div>
            <h3 className="pillar-title">For Ready Buyers</h3>
            <p className="pillar-desc">
              Looking for original sneakers, electronics, or instant meals? Skip days of parcel shipping. Find who has genuine stock right near your location and chat on WhatsApp instantly.
            </p>
            <button className="pillar-link" onClick={() => handleSearch('Fashion')}>
              Find Local Stores →
            </button>
          </div>

          <div className="pillar-card pillar-card-featured">
            <div className="pillar-badge">Popular with Travelers</div>
            <div className="pillar-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
              🧭
            </div>
            <h3 className="pillar-title">For Travelers & Tourists</h3>
            <p className="pillar-desc">
              Visiting Lagos, Abuja, or Port Harcourt? Discover 5-star hotels, luxury executive suites, authentic African cuisine, and vetted car services with real photos before you arrive.
            </p>
            <button className="pillar-link" onClick={() => handleSearch('Hotel')}>
              Explore Stays & Dining →
            </button>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
              🔬
            </div>
            <h3 className="pillar-title">For Researchers & Pros</h3>
            <p className="pillar-desc">
              Source specialized equipment, academic literature, local raw materials, artisanal fabricators, and specialized services with exact phone numbers and verified location pins.
            </p>
            <button className="pillar-link" onClick={() => handleSearch('Electronics')}>
              Locate Specialists →
            </button>
          </div>
        </div>
      </section>

      {/* Interactive 3-Step "How Dotch Works" */}
      <section className="how-it-works-section">
        <div className="section-head-center">
          <span className="section-eyebrow">FAST & TRANSPARENT</span>
          <h2 className="section-title">How Dotch Works</h2>
          <p className="section-desc">Search, inspect real photos, and talk directly to business owners in seconds</p>
        </div>

        <div className="how-steps-grid">
          <div className="how-step-card">
            <div className="step-number">01</div>
            <div className="step-content">
              <h4>Search What You Need</h4>
              <p>Type any item, hotel, restaurant, or service. Filter instantly by your current city or neighborhood.</p>
            </div>
          </div>

          <div className="how-step-card">
            <div className="step-number">02</div>
            <div className="step-content">
              <h4>Inspect Verified Photos & Places</h4>
              <p>Verified sellers post genuine photos of their place, products, and prices so you know exactly what you get.</p>
            </div>
          </div>

          <div className="how-step-card">
            <div className="step-number">03</div>
            <div className="step-content">
              <h4>Connect Direct On WhatsApp</h4>
              <p>Tap one button to call or chat on WhatsApp. Zero commissions, zero hidden platform fees, 100% direct.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Curated Categories Grid */}
      <section className="curated-categories-section">
        <div className="section-head-center">
          <span className="section-eyebrow">EXPLORE BY CATEGORY</span>
          <h2 className="section-title">Discover Verified Local Hubs</h2>
          <p className="section-desc">Curated directories across major Nigerian cities tailored for quick contact</p>
        </div>

        <div className="category-cards-grid">
          {CATEGORY_CARDS.map((cat) => (
            <div
              key={cat.name}
              className="curated-category-card"
              onClick={() => handleSearch(cat.query)}
            >
              <div className="cat-card-header">
                <div className="cat-icon-wrap">{cat.icon}</div>
                <span className="cat-count-pill">{cat.count}</span>
              </div>
              <h3 className="cat-card-title">{cat.name}</h3>
              <p className="cat-card-desc">{cat.desc}</p>
              <div className="cat-card-footer">
                <span className="cat-card-link">Explore Listings →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Verified Places Live Showcase */}
      {featured.length > 0 && (
        <section className="featured-sellers-section">
          <div className="results-header">
            <div>
              <div className="badge-pill explorer-badge" style={{ marginBottom: '6px' }}>
                ⭐ Handpicked & Verified
              </div>
              <h2 style={{ fontSize: '26px' }}>Top Verified Spots in {location}</h2>
              <p className="results-meta">Popular hotels, top dining, and verified vendors near you</p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="featured-filter-tabs">
              <button
                type="button"
                className={`filter-tab-pill ${selectedCategoryTab === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryTab('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-tab-pill ${selectedCategoryTab === 'hotel' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryTab('hotel')}
              >
                🏨 Hotels
              </button>
              <button
                type="button"
                className={`filter-tab-pill ${selectedCategoryTab === 'food' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryTab('food')}
              >
                🍔 Dining
              </button>
              <button
                type="button"
                className={`filter-tab-pill ${selectedCategoryTab === 'fashion' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryTab('fashion')}
              >
                👟 Fashion
              </button>
              <button
                type="button"
                className={`filter-tab-pill ${selectedCategoryTab === 'tech' ? 'active' : ''}`}
                onClick={() => setSelectedCategoryTab('tech')}
              >
                📱 Tech
              </button>
            </div>
          </div>

          <div className="results-grid">
            {filteredFeatured.slice(0, 6).map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/dashboard" className="btn btn-outline btn-lg">
              View all results in {location} and other cities →
            </Link>
          </div>
        </section>
      )}

      {/* Trust & Transparency Numbers */}
      <section className="stats-metric-strip">
        <div className="metric-item">
          <div className="metric-number">10,000+</div>
          <div className="metric-label">Local Searches Daily</div>
        </div>
        <div className="metric-item">
          <div className="metric-number">100%</div>
          <div className="metric-label">Direct WhatsApp Connection</div>
        </div>
        <div className="metric-item">
          <div className="metric-number">36</div>
          <div className="metric-label">States & Cities Covered</div>
        </div>
        <div className="metric-item">
          <div className="metric-number">0%</div>
          <div className="metric-label">Commission On Your Deals</div>
        </div>
      </section>

      {/* High-Converting Vendor Growth & Monetization Banner */}
      <section className="vendor-spotlight-banner">
        <div className="vendor-spotlight-decor" />
        <div className="vendor-banner-content">
          <span className="badge-pill vendor-badge">
            🏪 For Vendors, Hotels & Local Businesses
          </span>

          <h2 className="vendor-banner-title">
            Own a store, hotel, or service?
            <br />
            <span className="text-gradient">Get discovered by ready buyers & tourists daily.</span>
          </h2>

          <p className="vendor-banner-text">
            Post verified photos of your place & products, list your exact location, and connect directly on WhatsApp with customers looking for what you sell right now.
          </p>

          {/* Pricing Highlight Strip */}
          <div className="vendor-plans-teaser-grid">
            <div className="vendor-plan-box">
              <div className="plan-box-head">
                <span className="plan-box-title">1 Month Vendor Plan</span>
                <span className="plan-box-price">₦5,000</span>
              </div>
              <p className="plan-box-sub">Full 30-day access • Place/product photos, exact location & direct phone/WhatsApp linking.</p>
            </div>

            <div className="vendor-plan-box vendor-plan-box-popular">
              <div className="plan-box-popular-tag">🔥 Best Value • Save ₦2,001</div>
              <div className="plan-box-head">
                <span className="plan-box-title">2 Months Vendor Plan</span>
                <span className="plan-box-price">₦7,999</span>
              </div>
              <p className="plan-box-sub">Full 60-day access • 5x Search Visibility Boost, Top Placement & Gold Verified Badge.</p>
            </div>
          </div>

          <div className="vendor-banner-actions">
            <Link to={user ? "/business/setup" : "/register?role=vendor"} className="btn btn-primary btn-lg">
              ✨ List Your Business
            </Link>
            <Link to="/list-business" className="btn btn-outline btn-lg">
              ⚡ View Pricing & Benefits →
            </Link>
            {!user && (
              <Link to="/login?redirect=/business" className="btn btn-secondary btn-lg">
                👤 Already have an account? Log In
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
