import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import BusinessCard from '../components/BusinessCard'
import { getAllBusinesses, DEMO_BUSINESSES } from '../services/businessService'
import { getActiveAds, SAMPLE_ADVERTS } from '../services/adService'

const FILTER_PILLS = [
  { id: 'all', label: '✨ All Spots' },
  { id: 'hotel', label: '🏨 Hotels & Suites', query: 'Hotel' },
  { id: 'restaurant', label: '🍽️ Food & Dining', query: 'Restaurant' },
  { id: 'fashion', label: '🛍️ Streetwear & Stores', query: 'Fashion' },
  { id: 'tech', label: '📱 Phones & Gadgets', query: 'Electronics' },
  { id: 'beauty', label: '💆 Beauty & Spas', query: 'Beauty' },
  { id: 'auto', label: '🚗 Auto & Repairs', query: 'Auto' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [query, setQuery] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_query') || '' : ''))
  const [location, setLocation] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('dotch_last_search_loc') || 'Lagos' : 'Lagos'))
  const [featured, setFeatured] = useState(() => (DEMO_BUSINESSES || []).slice(0, 16))
  const [ads, setAds] = useState(SAMPLE_ADVERTS)
  const [adIndex, setAdIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const [segmentedTab, setSegmentedTab] = useState('places') // 'places' | 'recommended'

  useEffect(() => {
    window.scrollTo(0, 0)

    getAllBusinesses(16).then((data) => {
      if (data && data.length > 0) {
        setFeatured(data)
      }
    })

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

  const filteredPlaces = featured.filter((b) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'hotel') return (b.category || '').toLowerCase().includes('hotel')
    if (activeFilter === 'restaurant') return (b.category || '').toLowerCase().includes('restaurant') || (b.category || '').toLowerCase().includes('food')
    if (activeFilter === 'fashion') return (b.category || '').toLowerCase().includes('fashion')
    if (activeFilter === 'tech') return (b.category || '').toLowerCase().includes('tech') || (b.category || '').toLowerCase().includes('electronic')
    if (activeFilter === 'beauty') return (b.category || '').toLowerCase().includes('beauty') || (b.category || '').toLowerCase().includes('salon')
    if (activeFilter === 'auto') return (b.category || '').toLowerCase().includes('auto') || (b.category || '').toLowerCase().includes('car')
    return true
  })

  const nearbyCarouselList = filteredPlaces.slice(0, 8)
  const recommendedList = filteredPlaces.slice(1, 9)

  const locationLabel = !location || location.toLowerCase() === 'everywhere' ? 'All Places' : `Places in ${location}`

  return (
    <div className="landing-page purr-container" style={{ paddingBottom: '90px', paddingTop: '10px' }}>
      {/* Sleek Top Bar & Auth Strip (Inspo Screen 1) */}
      <div className="purr-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/full-logo.png" alt="Dotch" style={{ height: '32px', objectFit: 'contain' }} />
        </div>

        <div>
          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="filter-pill" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
                Log in
              </Link>
              <Link to="/register" className="filter-pill active-coral" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
                Join Free
              </Link>
            </div>
          ) : (
            <Link
              to={profile?.role === 'vendor' || profile?.role === 'business' ? '/business' : '/account'}
              className="filter-pill"
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              👋 {profile?.name?.split(' ')[0] || user.email?.split('@')[0]}
            </Link>
          )}
        </div>
      </div>

      {/* Hero Headline & Clean Value Props */}
      <div style={{ textAlign: 'center', margin: '18px 0 20px 0' }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '8px' }}>
          Discover Real Places & Spots
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
          Inspect verified photos, exact locations, and connect directly on WhatsApp with zero middlemen.
        </p>
      </div>

      {/* Sleek Floating Pill Search Bar (Inspo Style) */}
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

      {/* Quick Filter Pills (Screen 1 Inspiration: "Nearby x", "Open now x", "Italian x") */}
      <div className="filter-pill-strip">
        {FILTER_PILLS.map((pill) => (
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

      {/* 🚀 High-Impact Top Promotion Flyer Banner */}
      {ads.length > 0 && (() => {
        const flyer = ads[adIndex] || ads[0] || SAMPLE_ADVERTS[0]
        const flyerImg = flyer.flyerUrl || flyer.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'
        const rawPhone = flyer.phone ? flyer.phone.replace(/\D/g, '') : '2347073544811'
        const flyerWa = `https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hello ${flyer.businessName || 'Dotch Vendor'}! I saw your promotion flyer "${flyer.title}" on Dotch and I would like to make an inquiry.`)}`

        return (
          <div className="purr-promo-flyer-banner">
            <div className="promo-flyer-ribbon">
              <div className="promo-flyer-badge">
                <span className="pulse-beacon" />
                <span>🔥 {flyer.badge || 'Featured Promo Flyer'}</span>
              </div>
              <div className="promo-flyer-controls">
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Flyer {adIndex + 1} of {ads.length}
                </span>
                <button
                  type="button"
                  className="promo-flyer-nav-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAdIndex((prev) => (prev - 1 + ads.length) % ads.length)
                  }}
                  title="Previous promotion flyer"
                  aria-label="Previous flyer"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  type="button"
                  className="promo-flyer-nav-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAdIndex((prev) => (prev + 1) % ads.length)
                  }}
                  title="Next promotion flyer"
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

      {/* Segmented Tabs (Screen 2 Inspiration: "Places" vs "Recommended") */}
      <div className="purr-segmented-wrap">
        <div className="purr-segmented-tabs">
          <button
            type="button"
            className={`segmented-tab-btn ${segmentedTab === 'places' ? 'active' : ''}`}
            onClick={() => setSegmentedTab('places')}
          >
            <i className="fa-solid fa-compass" /> {locationLabel}
          </button>
          <button
            type="button"
            className={`segmented-tab-btn ${segmentedTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setSegmentedTab('recommended')}
          >
            <i className="fa-solid fa-sparkles" /> Recommended Spots
          </button>
        </div>
      </div>

      {/* Dynamic View switching based on Segmented Tab */}
      {segmentedTab === 'places' ? (
        <div>
          {/* Section 1: Places in [Location] Carousel */}
          <div className="purr-section-header">
            <h2 className="purr-section-title">{locationLabel}</h2>
            <Link to={`/dashboard?loc=${encodeURIComponent(location)}`} className="purr-section-action">
              See all <i className="fa-solid fa-chevron-right" style={{ fontSize: '11px', marginLeft: '3px' }} />
            </Link>
          </div>

          {/* Smooth Horizontal Carousel */}
          <div className="snap-carousel">
            {nearbyCarouselList.length > 0 ? (
              nearbyCarouselList.map((place) => (
                <BusinessCard key={place.id} business={place} inCarousel={true} />
              ))
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>
                Loading verified places in {location}…
              </div>
            )}
          </div>

          {/* Places Grid */}
          <div style={{ marginTop: '22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {filteredPlaces.slice(0, 6).map((place) => (
                <BusinessCard key={`grid-${place.id}`} business={place} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Section 2: Recommended Curated Spots */}
          <div className="purr-section-header">
            <h2 className="purr-section-title">⭐ Curated Recommended Spots</h2>
            <span className="purr-section-action" onClick={() => navigate('/dashboard')}>
              Explore grid <i className="fa-solid fa-chevron-right" style={{ fontSize: '11px', marginLeft: '3px' }} />
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recommendedList.map((place) => {
              const cover = place.image1Url || place.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop'
              const rawPhone = place.phone ? place.phone.replace(/\D/g, '') : '2348012345678'
              const placeWa = `https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hi ${place.name}! I found your place on Dotch Recommended.`)}`

              return (
                <div
                  key={`rec-${place.id}`}
                  className="purr-list-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/business/${place.id}`)}
                >
                  <img
                    src={cover}
                    alt={place.name}
                    className="purr-list-thumb"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop'
                    }}
                  />
                  <div className="purr-list-content">
                    <h4 className="purr-list-title">{place.name}</h4>
                    <p className="purr-list-desc">
                      {place.description || `Authentic verified ${place.category || 'spot'} in ${place.location || place.city || location}.`}
                    </p>
                    <div className="purr-list-meta">
                      <span>
                        <i className="fa-solid fa-star" style={{ color: '#f59e0b', marginRight: '3px' }} />
                        {place.rating || '4.9'}
                      </span>
                      <span>
                        <i className="fa-solid fa-location-dot" style={{ color: 'var(--brand-primary)', marginRight: '3px' }} />
                        {place.location || place.city || location}
                      </span>
                      {place.verified && (
                        <span style={{ color: '#10b981' }}>
                          <i className="fa-solid fa-check-circle" style={{ marginRight: '3px' }} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="purr-list-right">
                    <a
                      href={placeWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-squircle-btn btn-wa-squircle"
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '38px', height: '38px', fontSize: '16px', borderRadius: '12px' }}
                      title="Chat on WhatsApp"
                    >
                      <i className="fa-brands fa-whatsapp" />
                    </a>
                    <i className="fa-solid fa-chevron-right" style={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Prominent Bottom Coral Action Button (Screen 2 Inspiration: "Create a group" -> "List a Business / Explore All") */}
      <div className="purr-floating-cta-wrap">
        <Link
          to={user ? (profile?.role === 'vendor' ? '/business' : '/list-business') : '/list-business'}
          className="purr-pill-cta"
        >
          <i className="fa-solid fa-store" /> List Your Business
        </Link>
      </div>

      {/* Subtle Trust Indicators */}
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

