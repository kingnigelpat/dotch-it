import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchIntent from '../components/SearchIntent'
import BusinessCard from '../components/BusinessCard'
import EmptyState from '../components/EmptyState'
import UnifiedAiSearch from '../components/UnifiedAiSearch'
import { searchBusinesses, getAllBusinesses } from '../services/businessService'
import { getActiveAds } from '../services/adService'
import { understandSearch, getSuggestedCategories } from '../services/openrouterService'
import { parseQueryAndLocation } from '../utils/searchParser'
import { aiVoice } from '../utils/aiVoiceAssistant'

export default function FinderDashboard() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQ = searchParams.get('q')
  const initialQ = urlQ !== null ? urlQ : (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_query') || '' : '')
  const urlLoc = searchParams.get('loc')
  const initialLoc = urlLoc !== null ? urlLoc : (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_loc') || 'Lagos' : 'Lagos')

  const [query, setQuery] = useState(initialQ)
  const [location, setLocation] = useState(initialLoc)
  const [activeCategory, setActiveCategory] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(Boolean(initialQ))
  const [aiIntent, setAiIntent] = useState('')
  const [ads, setAds] = useState([])
  const [showAllPlaces, setShowAllPlaces] = useState(false)
  const categories = getSuggestedCategories()

  // Load genuine active adverts (strictly real ones from Firestore)
  useEffect(() => {
    getActiveAds()
      .then((activeAds) => {
        if (activeAds && activeAds.length > 0) {
          setAds(activeAds)
        }
      })
      .catch(() => {})
  }, [])

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
      setHasSearched(true)
      setSearchParams({
        ...(cleanKeyword ? { q: cleanKeyword } : (q.trim() ? { q: q.trim() } : {})),
        loc: effectiveIsEverywhere ? 'Everywhere' : effectiveLoc,
        ...(cat ? { cat } : {}),
      })

      try {
        let parsedIntent = ''
        if (q.trim()) {
          const ai = await understandSearch(q.trim(), effectiveIsEverywhere ? 'Nigeria' : effectiveLoc)
          parsedIntent = detectedLocation
            ? `Looking for: ${cleanKeyword || q.trim()} · 📍 ${detectedLocation}`
            : (ai.intent || q.trim())
          setAiIntent(parsedIntent)
        } else {
          setAiIntent('')
        }

        const realBusinesses = await searchBusinesses({
          category: cat,
          keyword: cleanKeyword || q.trim(),
          location: effectiveIsEverywhere ? '' : effectiveLoc,
        })

        setResults(realBusinesses || [])

        // If voice assistant is enabled, speak search results summary gently
        if (typeof window !== 'undefined' && sessionStorage.getItem('dotch_ai_voice_enabled') === 'true') {
          if (realBusinesses.length > 0) {
            aiVoice.speak(`I found ${realBusinesses.length} verified business${realBusinesses.length > 1 ? 'es' : ''} for your search.`)
          } else {
            aiVoice.speak(`No verified business found yet for ${cleanKeyword || q}. You can be the first to list one!`)
          }
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    },
    [query, location, activeCategory, setSearchParams]
  )

  // Run search if an initial query exists in URL or session
  useEffect(() => {
    if (initialQ) {
      executeSearch(initialQ, initialLoc)
    }
  }, [])

  const handleVoiceQueryReceived = (spokenText) => {
    setQuery(spokenText)
    executeSearch(spokenText, location, activeCategory)
  }

  const handlePromptChipClick = (chipText) => {
    setQuery(chipText)
    executeSearch(chipText, location, activeCategory)
  }

  const handleCategorySelect = (cat) => {
    const nextCat = activeCategory === cat ? '' : cat
    setActiveCategory(nextCat)
    executeSearch(query, location, nextCat)
  }

  const handleLoadAllStores = async () => {
    setLoading(true)
    setShowAllPlaces(true)
    setHasSearched(true)
    try {
      const allReal = await getAllBusinesses(60)
      setResults(allReal || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-search-page purr-container" style={{ paddingBottom: '90px', paddingTop: '10px' }}>
      {/* Top Header Bar */}
      <div className="purr-topbar">
        <Link to="/" className="purr-circle-btn" title="Back to Home">
          <i className="fa-solid fa-chevron-left" />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
            Dotch AI Discovery
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            📍 {location || 'Everywhere in Nigeria'}
          </span>
        </div>
        <Link
          to={user ? (profile?.role === 'vendor' ? '/business' : '/list-business') : '/list-business'}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '12px', fontWeight: 700, borderRadius: 'var(--radius-pill)' }}
        >
          <i className="fa-solid fa-store" style={{ marginRight: '4px' }} /> List Store
        </Link>
      </div>

      {/* Unified AI Discovery Engine */}
      <div className="ai-search-hero-wrap">
        <UnifiedAiSearch
          query={query}
          setQuery={handleQueryChange}
          onSearch={(customQ) => executeSearch(customQ !== undefined ? customQ : query, location, activeCategory)}
          location={location}
          setLocation={(newLoc) => {
            setLocation(newLoc)
            if (hasSearched) executeSearch(query, newLoc, activeCategory)
          }}
          loading={loading}
        />

        {/* AI Intent Summary */}
        {hasSearched && aiIntent && (
          <div style={{ textAlign: 'center', margin: '14px 0 10px 0' }}>
            <SearchIntent intent={aiIntent} location={location} query={query} />
          </div>
        )}

        {/* Category Filters */}
        <div className="filter-pill-strip" style={{ marginTop: '16px', marginBottom: '12px' }}>
          <button
            type="button"
            className={`filter-pill ${activeCategory === '' ? 'active-coral' : ''}`}
            onClick={() => handleCategorySelect('')}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => {
            const isActive = activeCategory === c
            return (
              <button
                key={c}
                type="button"
                className={`filter-pill ${isActive ? 'active-coral' : ''}`}
                onClick={() => handleCategorySelect(c)}
              >
                <span>{c}</span>
                {isActive && <span className="pill-close">✕</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* SURROUNDING ADS: Cleanly positioned around the AI interface */}
      {ads && ads.length > 0 && (
        <div className="ai-framing-ads-wrap" style={{ margin: '18px 0' }}>
          {ads.slice(0, 2).map((ad) => {
            const rawPhone = ad.phone ? String(ad.phone).replace(/\D/g, '') : '2347073544811'
            const waUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hello ${ad.businessName || 'Vendor'}! I saw your verified spotlight on Dotch and want to make an inquiry.`)}`
            return (
              <div key={ad.id} className="ai-ad-spotlight-card">
                <div className="ai-ad-badge">
                  <span className="live-pulse-dot" style={{ background: '#f59e0b' }} />
                  <span>Sponsored Spotlight</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {ad.imageUrl && (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ad.title}
                    </h4>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {ad.businessName} • {ad.targetReach || location}
                    </p>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      <i className="fa-brands fa-whatsapp" style={{ marginRight: '4px' }} /> Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* RESULTS DISPLAY — Not an endless scroll, only shows when searched or explicitly requested */}
      {loading && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--brand-primary)' }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" />
          <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            AI is searching genuine verified businesses near {location}…
          </div>
        </div>
      )}

      {!loading && hasSearched && (
        <div className="ai-search-results-section">
          <div className="purr-section-header" style={{ margin: '20px 0 16px 0' }}>
            <div>
              <h2 className="purr-section-title" style={{ fontSize: '18px' }}>
                {query ? `AI Results for “${query}”` : `${activeCategory || 'Verified Stores'} in ${location}`}
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Real businesses verified by Admin • 0% middlemen
              </span>
            </div>

            <span className="filter-pill" style={{ fontSize: '12px', padding: '4px 12px', cursor: 'default' }}>
              {results.length} {results.length === 1 ? 'store found' : 'stores found'}
            </span>
          </div>

          {results.length === 0 ? (
            <EmptyState
              location={location}
              query={query}
              onSelectEverywhere={() => {
                setLocation('Everywhere')
                executeSearch(query, 'Everywhere', activeCategory)
              }}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                gap: '18px',
              }}
            >
              {results.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* If user has NOT searched yet: Show an intentional invite rather than an endless scroll */}
      {!loading && !hasSearched && (
        <div className="ai-empty-prompt-state">
          <div className="ai-empty-icon">
            <i className="fa-solid fa-sparkles" />
          </div>
          <h3>What would you like to find today?</h3>
          <p>
            Type your inquiry above, tap the microphone to speak, or browse all currently verified Nigerian stores.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={handleLoadAllStores}
            style={{ fontWeight: 700 }}
          >
            <i className="fa-solid fa-store" style={{ marginRight: '6px' }} />
            Browse All Real Verified Businesses
          </button>
        </div>
      )}
    </div>
  )
}
