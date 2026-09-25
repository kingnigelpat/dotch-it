import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import BusinessCard from '../components/BusinessCard'
import { getAllBusinesses, DEMO_BUSINESSES } from '../services/businessService'
import { getActiveAds, SAMPLE_ADVERTS } from '../services/adService'
import { getBusinessStats } from '../utils/socialStore'

const VIBE_PILLS = [
  { id: 'all', label: '✨ All Vibes' },
  { id: 'restaurant', label: '🍽️ Food & Chow', query: 'Restaurant' },
  { id: 'fashion', label: '👟 Streetwear & Drip', query: 'Fashion' },
  { id: 'tech', label: '⚡ Gadgets & Gear', query: 'Electronics' },
  { id: 'beauty', label: '💆 Beauty & Glow', query: 'Beauty' },
  { id: 'auto', label: '🚗 Auto & Repairs', query: 'Auto' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [query, setQuery] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_query') || '' : ''))
  const [location, setLocation] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_loc') || 'Lagos' : 'Lagos'))
  const [featured, setFeatured] = useState(() => (DEMO_BUSINESSES || []).slice(0, 24))
  const [ads, setAds] = useState(() => SAMPLE_ADVERTS || [])
  const [adIndex, setAdIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  
  // Dynamic Stream Tabs: 'for_you' | 'near_me' | 'hidden_gems' | 'deals'
  const [activeStream, setActiveStream] = useState('for_you')
  const [radarRadius, setRadarRadius] = useState(5) // 3km, 5km, 10km
  const [visibleCount, setVisibleCount] = useState(12)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)

    getAllBusinesses(30).then((data) => {
      if (data && data.length > 0) {
        setFeatured(data)
      }
    }).catch(() => {})

    getActiveAds().then((fetchedAds) => {
      if (fetchedAds && fetchedAds.length > 0) {
        setAds(fetchedAds)
      }
    }).catch(() => {})
  }, [])

  const handleQueryChange = (newQ) => {
    setQuery(newQ)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dotch_last_search_query', newQ)
    }
  }

  const handleSearch = (customQuery) => {
    const q = customQuery !== undefined ? customQuery : query
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dotch_last_search_query', q)
      sessionStorage.setItem('dotch_last_search_loc', location)
    }
    if (q.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(location)}`)
    } else {
      navigate(`/dashboard?loc=${encodeURIComponent(location)}`)
    }
  }

  const handleFilterPillClick = (pill) => {
    setActiveFilter(pill.id)
    if (pill.query) {
      handleSearch(pill.query)
    }
  }

  // Filtered by category pill
  const categoryFiltered = useMemo(() => {
    const list = Array.isArray(featured) ? featured : (DEMO_BUSINESSES || [])
    return list.filter((b) => {
      if (!b) return false
      if (activeFilter === 'all') return true
      const cat = (b.category || '').toLowerCase()
      if (activeFilter === 'restaurant') return cat.includes('restaurant') || cat.includes('food') || cat.includes('dining')
      if (activeFilter === 'fashion') return cat.includes('fashion') || cat.includes('cloth') || cat.includes('wear')
      if (activeFilter === 'tech') return cat.includes('tech') || cat.includes('electronic') || cat.includes('phone')
      if (activeFilter === 'beauty') return cat.includes('beauty') || cat.includes('salon') || cat.includes('spa')
      if (activeFilter === 'auto') return cat.includes('auto') || cat.includes('car')
      return true
    })
  }, [featured, activeFilter])

  // Process stream feeds
  const streamFeed = useMemo(() => {
    if (!categoryFiltered || categoryFiltered.length === 0) return []

    if (activeStream === 'for_you') {
      return [...categoryFiltered].sort((a, b) => {
        const statsA = getBusinessStats(a) || { views: 0 }
        const statsB = getBusinessStats(b) || { views: 0 }
        const scoreA = (statsA.views || 0) + (a?.verified ? 100 : 0)
        const scoreB = (statsB.views || 0) + (b?.verified ? 100 : 0)
        return scoreB - scoreA
      })
    }
    if (activeStream === 'near_me') {
      return [...categoryFiltered].filter((b) => {
        if (!b) return false
        const distNum = parseFloat(b.distance) || (1.2 + ((String(b.name || '').charCodeAt(1) || 5) % 8) * 0.4)
        return distNum <= radarRadius
      })
    }
    if (activeStream === 'hidden_gems') {
      return [...categoryFiltered].filter((b) => {
        if (!b) return false
        const rating = parseFloat(b.rating || 4.8)
        return rating >= 4.7
      })
    }
    return categoryFiltered
  }, [categoryFiltered, activeStream, radarRadius])

  const currentDisplayPlaces = streamFeed.slice(0, visibleCount)
  const hasMore = visibleCount < streamFeed.length

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((prev) => prev + 8)
      setIsLoadingMore(false)
    }, 450)
  }

  const currentAdList = ads && ads.length > 0 ? ads : SAMPLE_ADVERTS

  return (
    <div className="landing-page purr-container" style={{ paddingBottom: '90px', paddingTop: '10px' }}>
      {/* Hero Headline */}
      <div style={{ textAlign: 'center', margin: '18px 0 20px 0' }}>
        <div className="landing-live-badge">
          <span className="live-pulse-dot" />
          <span>⚡ Live Discovery Feed · Over 1,200+ Verified Spots</span>
        </div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2, margin: '10px 0 8px 0' }}>
          Discover Real Places & Vibes
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.5 }}>
          Scroll verified photos, double-tap to save your favorite spots, and chat directly on WhatsApp with zero middlemen.
        </p>
      </div>

      {/* Sleek Floating Pill Search Bar */}
      <div style={{ marginBottom: '14px' }}>
        <SearchBar
          query={query}
          setQuery={handleQueryChange}
          onSearch={() => handleSearch()}
          location={location}
          setLocation={(newLoc) => {
            setLocation(newLoc)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('dotch_last_search_loc', newLoc)
            }
          }}
          autoFocus={false}
        />
      </div>

      {/* Category Vibe Pills Strip */}
      <div className="filter-pill-strip">
        {VIBE_PILLS.map((pill) => (
          <button
            key={pill.id}
            type="button"
            className={`filter-pill ${activeFilter === pill.id ? 'active-coral' : ''}`}
            onClick={() => handleFilterPillClick(pill)}
          >
            <span>{pill.label}</span>
            {activeFilter === pill.id && activeFilter !== 'all' && (
              <span className="pill-close" onClick={(e) => { e.stopPropagation(); setActiveFilter('all') }}>✕</span>
            )}
          </button>
        ))}
      </div>

      {/* 🚀 High-Impact Promotion Flyer Banner */}
      {currentAdList && currentAdList.length > 0 && (() => {
        const flyer = currentAdList[adIndex % currentAdList.length] || currentAdList[0] || SAMPLE_ADVERTS[0]
        const flyerImg = flyer.flyerUrl || flyer.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'
        const rawPhone = flyer.phone ? String(flyer.phone).replace(/\D/g, '') : '2347073544811'
        const flyerWa = `https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hello ${flyer.businessName || 'Dotch Vendor'}! I saw your promotion flyer "${flyer.title}" on Dotch and I would like to make an inquiry.`)}`

        return (
          <div className="purr-promo-flyer-banner">
            <div className="promo-flyer-ribbon">
              <div className="promo-flyer-badge">
                <span className="pulse-beacon" />
                <span>🔥 {flyer.badge || 'Trending Spotlight'}</span>
              </div>
              <div className="promo-flyer-controls">
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {(adIndex % currentAdList.length) + 1} of {currentAdList.length}
                </span>
                <button
                  type="button"
                  className="promo-flyer-nav-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAdIndex((prev) => (prev - 1 + currentAdList.length) % currentAdList.length)
                  }}
                  title="Previous promo"
                  aria-label="Previous flyer"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  type="button"
                  className="promo-flyer-nav-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAdIndex((prev) => (prev + 1) % currentAdList.length)
                  }}
                  title="Next promo"
                  aria-label="Next flyer"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>

            <div className="promo-flyer-body">
              <div className="promo-flyer-poster">
                <img
                  src={flyerImg}
                  alt={flyer.title || flyer.businessName}
                  className="promo-flyer-img"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'
                  }}
                />
                {flyer.pricePromo && (
                  <div className="promo-flyer-price-pill">
                    <i className="fa-solid fa-tag" style={{ color: '#f59e0b' }} />
                    <span>{flyer.pricePromo}</span>
                  </div>
                )}
              </div>

              <div className="promo-flyer-details">
                <div className="promo-flyer-meta-row">
                  <span className="promo-flyer-loc-tag">
                    <i className="fa-solid fa-location-dot" /> {flyer.targetReach || flyer.location || location}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    • {flyer.category || 'Special Deal'}
                  </span>
                </div>

                <h3 className="promo-flyer-biz-name">
                  {flyer.businessName} <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '13px' }} />
                </h3>
                <h4 className="promo-flyer-title">{flyer.title}</h4>
                <p className="promo-flyer-desc">
                  {flyer.tagline || flyer.description || 'Exclusive deal verified on Dotch. Connect directly with the vendor.'}
                </p>

                <div className="promo-flyer-actions">
                  <a
                    href={flyerWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="promo-flyer-wa-btn"
                  >
                    <i className="fa-brands fa-whatsapp" /> {flyer.ctaText || 'Chat on WhatsApp'}
                  </a>
                  {flyer.businessId && (
                    <Link
                      to={`/business/${flyer.businessId}`}
                      className="promo-flyer-view-btn"
                    >
                      View Spot <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 🎯 DYNAMIC DISCOVERY STREAMS SELECTOR */}
      <div className="discovery-stream-bar">
        <div className="discovery-tabs">
          <button
            type="button"
            className={`stream-tab-btn ${activeStream === 'for_you' ? 'is-active' : ''}`}
            onClick={() => setActiveStream('for_you')}
          >
            <i className="fa-solid fa-sparkles" />
            <span>For You</span>
          </button>

          <button
            type="button"
            className={`stream-tab-btn ${activeStream === 'near_me' ? 'is-active' : ''}`}
            onClick={() => setActiveStream('near_me')}
          >
            <i className="fa-solid fa-radar" />
            <span>Near Me</span>
          </button>

          <button
            type="button"
            className={`stream-tab-btn ${activeStream === 'hidden_gems' ? 'is-active' : ''}`}
            onClick={() => setActiveStream('hidden_gems')}
          >
            <i className="fa-solid fa-gem" />
            <span>Hidden Gems</span>
          </button>

          <button
            type="button"
            className={`stream-tab-btn ${activeStream === 'deals' ? 'is-active' : ''}`}
            onClick={() => setActiveStream('deals')}
          >
            <i className="fa-solid fa-fire" />
            <span>Flash Deals</span>
          </button>
        </div>
      </div>

      {/* Radar distance selector if "Near Me" stream is active */}
      {activeStream === 'near_me' && (
        <div className="radar-radius-strip">
          <span className="radar-label"><i className="fa-solid fa-location-crosshairs" /> Radar Radius:</span>
          {[
            { km: 3, label: 'Walking (< 3km)' },
            { km: 5, label: 'Nearby (< 5km)' },
            { km: 10, label: 'City Drive (< 10km)' },
          ].map((r) => (
            <button
              key={r.km}
              type="button"
              className={`radar-pill ${radarRadius === r.km ? 'active' : ''}`}
              onClick={() => setRadarRadius(r.km)}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Social Discovery Grid Feed */}
      <div className="stream-section-header">
        <div>
          <h2 className="stream-title">
            {activeStream === 'for_you' && '🔥 Recommended For You'}
            {activeStream === 'near_me' && `📍 Spots Within ${radarRadius}km of You`}
            {activeStream === 'hidden_gems' && '💎 High-Rated Hidden Gems'}
            {activeStream === 'deals' && '⚡ Verified Special Offers & Deals'}
          </h2>
          <p className="stream-subtitle">Double-tap photo to like · Instant WhatsApp chat</p>
        </div>
        <span className="stream-count-badge">
          {streamFeed.length} places
        </span>
      </div>

      {currentDisplayPlaces.length > 0 ? (
        <div className="social-feed-grid">
          {currentDisplayPlaces.map((place) => (
            <BusinessCard key={`stream-${place.id || place.name}`} business={place} />
          ))}
        </div>
      ) : (
        <div className="empty-stream-box">
          <i className="fa-solid fa-compass" style={{ fontSize: '36px', color: 'var(--brand-primary)', marginBottom: '10px' }} />
          <h3>No spots found in this radar radius</h3>
          <p>Try widening your radius to 10km or exploring our "For You" stream!</p>
          <button
            type="button"
            className="purr-pill-cta"
            onClick={() => {
              setRadarRadius(10)
              setActiveStream('for_you')
            }}
            style={{ marginTop: '12px' }}
          >
            Reset to For You Feed
          </button>
        </div>
      )}

      {/* Infinite Scroll / Load More Trigger */}
      {hasMore && (
        <div className="infinite-load-more-wrap">
          <button
            type="button"
            className="btn-discover-more"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <span><i className="fa-solid fa-spinner fa-spin" /> Fetching more vibes…</span>
            ) : (
              <span>Discover More Spots <i className="fa-solid fa-chevron-down" style={{ marginLeft: '6px' }} /></span>
            )}
          </button>
        </div>
      )}

      {/* Floating Action Button to List Business */}
      <div className="purr-floating-cta-wrap">
        <Link
          to={user ? (profile?.role === 'vendor' ? '/business' : '/list-business') : '/list-business'}
          className="purr-pill-cta"
        >
          <i className="fa-solid fa-store" /> List Your Business (₦5,000 Promo)
        </Link>
      </div>

      {/* Trust & Direct WhatsApp Badge Strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '30px', padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }} />
          <span>100% Verified Photos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }} />
          <span>Direct WhatsApp Chat</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <i className="fa-solid fa-shield-halved" style={{ color: 'var(--brand-primary)' }} />
          <span>Zero Middleman Fees</span>
        </div>
      </div>
    </div>
  )
}
