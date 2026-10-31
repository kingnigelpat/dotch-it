import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AiDiscoveryOrb from '../components/AiDiscoveryOrb'
import TypewriterGreeting from '../components/TypewriterGreeting'
import AiResultCard from '../components/AiResultCard'
import NotifyModal from '../components/NotifyModal'
import SponsoredBanner from '../components/ads/SponsoredBanner'
import SponsoredSideColumn from '../components/ads/SponsoredSideColumn'
import SponsoredBottomStrip from '../components/ads/SponsoredBottomStrip'
import { searchSellers } from '../services/aiDiscoveryService'
import { getSponsoredSellerForSlot } from '../data/adSlots'

const DEFAULT_GREETING = "Welcome. What kind of business are you looking for?"

const SUGGESTED_QUERIES = [
  'Laptops & Gadgets',
  'Artisan Bakery & Cakes',
  'Sneakers in Lagos',
  'Luxury Fashion in Abuja',
  'Solar Inverter Systems',
  'Auto Repair & Diagnostics',
]

const NO_MATCH_SUGGESTIONS = [
  'Laptops in Ikeja',
  'Sneakers in Lagos',
  'Custom cakes in Lekki',
  'Bespoke tailoring Abuja',
  'Solar power in Port Harcourt',
  'Organic skincare spa',
]

export default function AiDiscover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQ)
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState(initialQ)
  const [isTyping, setIsTyping] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState([])
  const [aiGreeting, setAiGreeting] = useState(DEFAULT_GREETING)
  const [notifyModalOpen, setNotifyModalOpen] = useState(false)

  // Sponsored Ads for slots surrounding the AI interface
  const topAdSeller = getSponsoredSellerForSlot('topBanner')
  const leftAdSeller = getSponsoredSellerForSlot('leftColumn')
  const rightAdSeller = getSponsoredSellerForSlot('rightColumn')
  const bottomAdSeller = getSponsoredSellerForSlot('bottomStrip')

  const typingTimerRef = useRef(null)
  const resultsRef = useRef(null)

  // Handle typing detection for orb glow
  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setIsTyping(true)

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 800)
  }

  const handleInputFocus = () => {
    setIsTyping(true)
  }

  const handleInputBlur = () => {
    setIsTyping(false)
  }

  // Core submission execution
  const executeSearch = async (queryToSearch) => {
    const cleanQ = (queryToSearch !== undefined ? queryToSearch : query).trim()
    if (!cleanQ) return

    setLastSubmittedQuery(cleanQ)
    setIsTyping(false)
    setIsThinking(true)
    setAiGreeting(`Searching verified businesses for “${cleanQ}”...`)

    if (cleanQ !== query) {
      setQuery(cleanQ)
    }

    setSearchParams({ q: cleanQ })

    // Simulate 1 second thinking state as required
    const startTime = Date.now()
    try {
      const matches = await searchSellers(cleanQ)
      const elapsed = Date.now() - startTime
      const remainingDelay = Math.max(0, 1000 - elapsed)

      setTimeout(() => {
        setIsThinking(false)
        setHasSearched(true)
        setResults(matches)

        if (matches.length > 0) {
          const countStr = matches.length === 1 ? '1 business' : `${matches.length} businesses`
          setAiGreeting(`I found ${countStr} for “${cleanQ}”`)
        } else {
          setAiGreeting("Sorry, nothing available for that yet.")
        }

        // Smooth scroll to results
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 150)
      }, remainingDelay)
    } catch (err) {
      console.error('Search error:', err)
      setIsThinking(false)
      setHasSearched(true)
      setAiGreeting("Sorry, nothing available for that yet.")
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    executeSearch(query)
  }

  const handleChipClick = (chipText) => {
    setQuery(chipText)
    executeSearch(chipText)
  }

  const handleClear = () => {
    setQuery('')
    setHasSearched(false)
    setResults([])
    setAiGreeting(DEFAULT_GREETING)
    setSearchParams({})
  }

  // Run on initial URL query if provided
  useEffect(() => {
    if (initialQ) {
      executeSearch(initialQ)
    }
  }, [])

  return (
    <div className="ai-discovery-page">
      {/* 1. TOP SPONSORED BANNER AD: Above the AI interface */}
      <div className="ai-ads-top-wrap">
        <SponsoredBanner seller={topAdSeller} />
      </div>

      {/* 2. MAIN WORKSPACE WITH SURROUNDING SIDE ADS */}
      <div className="ai-discovery-layout">
        {/* Left Desktop Ad Column */}
        <SponsoredSideColumn seller={leftAdSeller} side="left" />

        {/* Center Hero AI Interface */}
        <main className="ai-discovery-center">
          {/* Hero 3D Animated Orb */}
          <div className="ai-orb-section">
            <AiDiscoveryOrb isThinking={isThinking} isTyping={isTyping} />
          </div>

          {/* Typed-out AI Greeting Animation */}
          <div className="ai-greeting-section">
            <TypewriterGreeting text={aiGreeting} speed={25} />
          </div>

          {/* Large Text-Only Input Box */}
          <form onSubmit={handleSubmit} className="ai-search-form" role="search">
            <div className={`ai-input-wrapper ${isTyping ? 'focused' : ''} ${isThinking ? 'thinking' : ''}`}>
              <div className="ai-input-leading-icon">
                {isThinking ? (
                  <i className="fa-solid fa-circle-notch fa-spin ai-spin-icon" />
                ) : (
                  <i className="fa-solid fa-magnifying-glass" />
                )}
              </div>

              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="What kind of business are you looking for?"
                className="ai-large-input"
                autoComplete="off"
                spellCheck="false"
                aria-label="Search businesses"
              />

              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ai-input-clear-btn"
                  title="Clear search"
                  aria-label="Clear input"
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                disabled={isThinking || !query.trim()}
                className="ai-input-submit-btn"
                aria-label="Submit search"
              >
                <span>Search</span>
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </form>

          {/* Suggestion Prompts (Only before first search or for quick testing) */}
          {!hasSearched && (
            <div className="ai-suggestions-row">
              <span className="suggestions-label">Try searching:</span>
              <div className="suggestions-chips-wrap">
                {SUGGESTED_QUERIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="ai-suggestion-chip"
                    onClick={() => handleChipClick(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Anchor */}
          <div ref={resultsRef} className="ai-results-anchor" />

          {/* 3. SEARCH RESULTS (INSIDE this page, under the orb) */}
          {hasSearched && !isThinking && (
            <section className="ai-results-section" aria-label="AI Search Results">
              {results.length > 0 ? (
                <div className="ai-results-container">
                  <div className="ai-results-header">
                    <span className="ai-results-count-badge">
                      <span className="live-pulse-dot" />
                      {results.length} {results.length === 1 ? 'Match Found' : 'Matches Found'}
                    </span>
                    <button
                      type="button"
                      className="ai-new-search-btn"
                      onClick={handleClear}
                    >
                      <i className="fa-solid fa-rotate-left" style={{ marginRight: '5px' }} />
                      New Search
                    </button>
                  </div>

                  {/* Result Cards Grid */}
                  <div className="ai-cards-grid">
                    {results.map((seller) => (
                      <AiResultCard key={seller.id} seller={seller} />
                    ))}
                  </div>
                </div>
              ) : (
                /* No Matches State */
                <div className="ai-no-match-state">
                  <div className="no-match-icon-box">
                    <i className="fa-solid fa-compass" />
                  </div>
                  <h3 className="no-match-title">
                    No verified business listed for &ldquo;{lastSubmittedQuery}&rdquo; yet
                  </h3>
                  <p className="no-match-text">
                    We’re constantly onboarding vetted Nigerian vendors. Tap below to be notified as soon as a matching seller registers!
                  </p>

                  <div className="no-match-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-notify-me"
                      onClick={() => setNotifyModalOpen(true)}
                    >
                      <i className="fa-solid fa-bell" style={{ marginRight: '8px' }} />
                      Notify me when a seller joins
                    </button>
                  </div>

                  {/* Suggestion to try a different search */}
                  <div className="no-match-alternative-section">
                    <span className="no-match-alt-heading">Or try searching for:</span>
                    <div className="suggestions-chips-wrap">
                      {NO_MATCH_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          className="ai-suggestion-chip"
                          onClick={() => handleChipClick(sug)}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Small, quiet link to browse all businesses (never the default) */}
          <div className="ai-quiet-browse-footer">
            <span className="quiet-text">Looking for traditional catalog browsing?</span>{' '}
            <Link to="/browse" className="quiet-browse-link">
              Browse all businesses →
            </Link>
          </div>
        </main>

        {/* Right Desktop Ad Column */}
        <SponsoredSideColumn seller={rightAdSeller} side="right" />
      </div>

      {/* 4. BOTTOM SPONSORED STRIP AD */}
      <div className="ai-ads-bottom-wrap">
        <SponsoredBottomStrip seller={bottomAdSeller} />
      </div>

      {/* Notification Signup Modal */}
      <NotifyModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        query={lastSubmittedQuery}
      />
    </div>
  )
}
