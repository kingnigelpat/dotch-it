import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import SearchIntent from '../components/SearchIntent'
import BusinessCard from '../components/BusinessCard'
import EmptyState from '../components/EmptyState'
import { searchBusinesses, getAllBusinesses } from '../services/businessService'
import { understandSearch, getSuggestedCategories } from '../services/openrouterService'
import { parseQueryAndLocation } from '../utils/searchParser'

export default function FinderDashboard() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQ = searchParams.get('q')
  const initialQ = urlQ !== null ? urlQ : (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_query') || '' : '')
  const urlLoc = searchParams.get('loc')
  const initialLoc = urlLoc !== null ? urlLoc : (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_loc') || 'Everywhere' : 'Everywhere')

  const [query, setQuery] = useState(initialQ)
  const [location, setLocation] = useState(initialLoc)
  const [activeCategory, setActiveCategory] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(Boolean(initialQ))
  const [aiIntent, setAiIntent] = useState('')
  const [categories] = useState(getSuggestedCategories())

  const handleQueryChange = (val) => {
    setQuery(val)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dotch_last_search_query', val)
    }
  }

  const executeSearch = useCallback(
    async (overrideQuery, overrideLocation, overrideCat) => {
      const q = overrideQuery !== undefined ? overrideQuery : query
      const loc = overrideLocation !== undefined ? overrideLocation : location
      const cat = overrideCat !== undefined ? overrideCat : activeCategory

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dotch_last_search_query', q)
        sessionStorage.setItem('dotch_last_search_loc', loc)
      }

      const isEverywhere =
        !loc || loc === 'Everywhere' || loc === 'All Locations' || loc === 'All of Nigeria'

      // Natural language query & location parsing (e.g. "bag in lagos" -> cleanKeyword: "bag", detectedLocation: "Lagos")
      const { keyword: cleanKeyword, location: resolvedLoc, detectedLocation } = parseQueryAndLocation(q, isEverywhere ? '' : loc)
      const effectiveLoc = resolvedLoc || (isEverywhere ? '' : loc)
      const effectiveIsEverywhere =
        !effectiveLoc ||
        effectiveLoc === 'Everywhere' ||
        effectiveLoc === 'All Locations' ||
        effectiveLoc === 'All of Nigeria'

      if (detectedLocation && isEverywhere) {
        setLocation(detectedLocation)
      }

      setLoading(true)
      setSearched(true)
      setSearchParams({
        ...(cleanKeyword ? { q: cleanKeyword } : (q.trim() ? { q: q.trim() } : {})),
        loc: effectiveIsEverywhere ? 'Everywhere' : effectiveLoc,
        ...(cat ? { cat } : {}),
      })

      try {
        // AI query understanding
        let parsedIntent = ''
        let aiOutside = []
        if (q.trim()) {
          const ai = await understandSearch(q.trim(), effectiveIsEverywhere ? 'Nigeria' : effectiveLoc)
          parsedIntent = detectedLocation
            ? `Looking for: ${cleanKeyword || q.trim()} · 📍 ${detectedLocation}`
            : (ai.intent || q.trim())
          setAiIntent(parsedIntent)
          aiOutside = ai.aiSuggestions || []
        } else {
          setAiIntent('')
        }

        // Location-aware search
        let local = []
        if (!q.trim() && !cat && effectiveIsEverywhere) {
          // No query, no category, and Everywhere: show all listings
          local = await getAllBusinesses()
        } else {
          // Filter by resolved location and clean keyword
          local = await searchBusinesses({
            category: cat,
            keyword: cleanKeyword || q.trim(),
            location: effectiveIsEverywhere ? '' : effectiveLoc,
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
    <div className="finder-dashboard purr-container" style={{ paddingBottom: '90px', paddingTop: '8px' }}>
      {/* Sleek Top Navigation Bar (Inspo Screen 1) */}
      <div className="purr-topbar">
        <Link to="/" className="purr-circle-btn" title="Back to Home">
          <i className="fa-solid fa-chevron-left" />
        </Link>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {location || 'All of Nigeria'}
        </span>
        <Link to="/list-business" className="purr-circle-btn" title="List your business">
          <i className="fa-solid fa-plus" />
        </Link>
      </div>

      {/* Floating Pill Search Box */}
      <div style={{ marginBottom: '12px' }}>
        <SearchBar
          query={query}
          setQuery={handleQueryChange}
          onSearch={() => executeSearch(query, location, activeCategory)}
          location={location}
          setLocation={(newLoc) => {
            setLocation(newLoc)
            executeSearch(query, newLoc, activeCategory)
          }}
          loading={loading}
        />

        {searched && aiIntent && (
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <SearchIntent intent={aiIntent} location={location} query={query} />
          </div>
        )}
      </div>

      {/* Purrweb Filter Pills Strip (Inspo Screen 1: "Nearby x", "Open now x", "Category x") */}
      <div className="filter-pill-strip">
        <button
          type="button"
          className={`filter-pill ${activeCategory === '' ? 'active-coral' : ''}`}
          onClick={() => handleCategorySelect('')}
        >
          <span>🌐 All Spots</span>
        </button>

        {categories.map((c) => {
          const isActive = activeCategory === c
          return (
            <button
              key={c}
              type="button"
              className={`filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => handleCategorySelect(c)}
            >
              <span>{c}</span>
              {isActive && <span className="pill-close">✕</span>}
            </button>
          )
        })}
      </div>

      {/* Clean Results Header with Location & Count */}
      <div className="purr-section-header" style={{ margin: '14px 0 16px 0' }}>
        <div>
          <h2 className="purr-section-title" style={{ fontSize: '18px' }}>
            {searched ? (query ? `Results for “${query}”` : `${activeCategory || 'Places'} in ${location || 'Nigeria'}`) : `Discover in ${location}`}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing verified listings in <strong style={{ color: 'var(--brand-primary)' }}>{location || 'Everywhere'}</strong>
          </span>
        </div>

        <span className="filter-pill" style={{ fontSize: '12px', padding: '4px 12px', cursor: 'default' }}>
          {results.length} {results.length === 1 ? 'place' : 'places'}
        </span>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--brand-primary)' }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" />
          <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Searching spots near {location}…</div>
        </div>
      )}

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

      {/* Results Cards Grid using Purrweb card layout */}
      {!loading && results.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '18px',
          }}
        >
          {results.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}

      {/* Prominent Bottom Coral Action Button */}
      <div className="purr-floating-cta-wrap">
        <Link
          to={user ? (profile?.role === 'vendor' ? '/business' : '/list-business') : '/list-business'}
          className="purr-pill-cta"
        >
          <i className="fa-solid fa-plus" /> List a Place
        </Link>
      </div>
    </div>
  )
}

