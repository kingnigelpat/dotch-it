import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import SearchIntent from '../components/SearchIntent'
import BusinessCard from '../components/BusinessCard'
import EmptyState from '../components/EmptyState'
import { searchBusinesses, getAllBusinesses } from '../services/businessService'
import { understandSearch, getSuggestedCategories } from '../services/openrouterService'

export default function FinderDashboard() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQ = searchParams.get('q') || ''
  const initialLoc = searchParams.get('loc') || 'Everywhere'

  const [query, setQuery] = useState(initialQ)
  const [location, setLocation] = useState(initialLoc)
  const [activeCategory, setActiveCategory] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(Boolean(initialQ))
  const [aiIntent, setAiIntent] = useState('')
  const [categories] = useState(getSuggestedCategories())

  const executeSearch = useCallback(
    async (overrideQuery, overrideLocation, overrideCat) => {
      const q = overrideQuery !== undefined ? overrideQuery : query
      const loc = overrideLocation !== undefined ? overrideLocation : location
      const cat = overrideCat !== undefined ? overrideCat : activeCategory

      const isEverywhere =
        !loc || loc === 'Everywhere' || loc === 'All Locations' || loc === 'All of Nigeria'

      setLoading(true)
      setSearched(true)
      setSearchParams({
        ...(q.trim() ? { q: q.trim() } : {}),
        loc: isEverywhere ? 'Everywhere' : loc,
        ...(cat ? { cat } : {}),
      })

      try {
        // AI query understanding
        let parsedIntent = ''
        let aiOutside = []
        if (q.trim()) {
          const ai = await understandSearch(q.trim(), isEverywhere ? 'Nigeria' : loc)
          parsedIntent = ai.intent
          setAiIntent(parsedIntent)
          aiOutside = ai.aiSuggestions || []
        } else {
          setAiIntent('')
        }

        // Location-aware search
        let local = []
        if (!q.trim() && !cat && isEverywhere) {
          // No query, no category, and Everywhere: show all listings
          local = await getAllBusinesses()
        } else {
          // If a specific location (e.g. 'Delta'), keyword, or category is selected,
          // filter strictly by that location!
          local = await searchBusinesses({
            category: cat,
            keyword: q.trim(),
            location: isEverywhere ? '' : loc,
          })
        }

        // Merge AI suggestions if query was entered
        const existingNames = new Set(local.map((b) => b.name?.toLowerCase()))
        const formattedAI = aiOutside
          .filter((s) => !existingNames.has(s.name?.toLowerCase()))
          .map((s, i) => ({
            id: `ai-suggest-${i}`,
            isAI: true,
            name: s.name,
            category: s.category || cat || 'General',
            description: s.description || s.reason,
          }))

        setResults([...local, ...formattedAI])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    },
    [query, location, activeCategory, setSearchParams]
  )

  useEffect(() => {
    executeSearch(initialQ, initialLoc)
  }, []) // run once on mount

  const handleCategorySelect = (cat) => {
    const nextCat = activeCategory === cat ? '' : cat
    setActiveCategory(nextCat)
    executeSearch(query, location, nextCat)
  }

  const handleNearbySelect = (nearbyCity) => {
    setLocation(nearbyCity)
    executeSearch(query, nearbyCity, activeCategory)
  }

  return (
    <div className="finder-dashboard">
      {/* Explore Value & Discovery Header */}
      <div className="explore-hero-card">
        <div className="explore-hero-body">
          <div className="explore-badge-row">
            <span className="badge-pill explorer-badge">🔍 Explore Businesses & Places</span>
            <span className="badge-sparkle">📍 Nigeria Wide</span>
          </div>
          <h1 className="explore-hero-title">
            Discover Verified Businesses, Stays & Products
          </h1>
          <p className="explore-hero-subtitle">
            Search genuine stores, inspect verified photos of places and products, locate verified vendors in your city, and connect directly on WhatsApp with zero middlemen fees.
          </p>
        </div>

        {!user ? (
          <div className="explore-auth-cta">
            <div className="explore-auth-info">
              <span className="explore-auth-heading">Join Dotch or Sign In</span>
              <span className="explore-auth-sub">Sign in to save favorite spots, contact sellers, or list your business.</span>
            </div>
            <div className="explore-auth-actions">
              <Link to="/login?redirect=/dashboard" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up Free →
              </Link>
            </div>
          </div>
        ) : (
          <div className="explore-auth-cta explore-auth-cta-user">
            <div className="explore-auth-info">
              <span className="explore-auth-heading">
                👋 Hello, {profile?.name || user.email}
              </span>
              <span className="explore-auth-sub">
                {profile?.role === 'vendor' ? 'You have an active vendor account' : 'Browse verified places and chat with vendors'}
              </span>
            </div>
            <div className="explore-auth-actions">
              {profile?.role === 'vendor' ? (
                <Link to="/business" className="btn btn-primary btn-sm">
                  Vendor Dashboard →
                </Link>
              ) : (
                <Link to="/list-business" className="btn btn-outline btn-sm">
                  🏪 List Your Business
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Header */}
      <div style={{ marginBottom: '24px' }}>
        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={() => executeSearch(query, location, activeCategory)}
          location={location}
          setLocation={(newLoc) => {
            setLocation(newLoc)
            executeSearch(query, newLoc, activeCategory)
          }}
          loading={loading}
        />

        {searched && (
          <div style={{ textAlign: 'center' }}>
            <SearchIntent intent={aiIntent} location={location} query={query} />
          </div>
        )}
      </div>

      {/* Categories & Filter Bar */}
      <div className="category-bar">
        <button
          className={`chip-tag ${activeCategory === '' ? 'chip-tag-active' : ''}`}
          onClick={() => handleCategorySelect('')}
        >
          🌐 All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`chip-tag ${activeCategory === c ? 'chip-tag-active' : ''}`}
            onClick={() => handleCategorySelect(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results Header with City/Region summary and Active Filters */}
      <div className="results-header">
        <div>
          <h2 style={{ fontSize: '20px' }}>
            {searched ? (query ? `Results for “${query}”` : `${activeCategory || 'Top'} Listings`) : 'Discover Local Businesses'}
          </h2>
          <p className="results-meta">
            Showing verified sellers in <strong style={{ color: 'var(--brand-primary)' }}>{location || 'Everywhere'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="results-meta" style={{ fontWeight: 600 }}>
            {results.length} {results.length === 1 ? 'place' : 'places'} found
          </span>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && <div className="center-loading">Searching local engine…</div>}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <EmptyState
          location={location}
          query={query}
          onSelectEverywhere={() => {
            setLocation('Everywhere')
            executeSearch(query, 'Everywhere', activeCategory)
          }}
        />
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="results-grid">
          {results.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  )
}
