import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import SearchIntent from '../components/SearchIntent'
import BusinessCard from '../components/BusinessCard'
import EmptyState from '../components/EmptyState'
import { searchBusinesses, getAllBusinesses } from '../services/businessService'
import { understandSearch, getSuggestedCategories } from '../services/openrouterService'

export default function FinderDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQ = searchParams.get('q') || ''
  const initialLoc = searchParams.get('loc') || 'Lagos'

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

      if (!q.trim() && !cat) {
        setLoading(true)
        try {
          const all = await getAllBusinesses()
          setResults(all)
          setSearched(false)
        } finally {
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setSearched(true)
      setSearchParams({ q, loc, cat })

      try {
        // AI query understanding
        let parsedIntent = ''
        let aiOutside = []
        if (q.trim()) {
          const ai = await understandSearch(q.trim(), loc)
          parsedIntent = ai.intent
          setAiIntent(parsedIntent)
          aiOutside = ai.aiSuggestions || []
        } else {
          setAiIntent('')
        }

        // Local Firestore search matching keywords, location, and category
        const local = await searchBusinesses({
          category: cat,
          keyword: q.trim(),
          location: loc,
        })

        // Merge AI suggestions if not present in local
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
      {!loading && searched && results.length === 0 && (
        <EmptyState
          location={location}
          query={query}
          onSelectNearby={handleNearbySelect}
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
