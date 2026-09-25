import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BusinessCard from '../components/BusinessCard'
import { getActiveAds, SAMPLE_ADVERTS } from '../services/adService'
import { getAllBusinesses, DEMO_BUSINESSES } from '../services/businessService'
import { getSuggestedCategories } from '../services/openrouterService'
import { normalizeWhatsAppPhone } from '../utils/phoneUtils'
import { getBusinessStats } from '../utils/socialStore'

const CATEGORY_ICONS = {
  'Restaurant': 'fa-solid fa-utensils',
  'Tech': 'fa-solid fa-microchip',
  'Electronic': 'fa-solid fa-mobile-screen',
  'Fashion': 'fa-solid fa-shirt',
  'Beauty': 'fa-solid fa-scissors',
  'Salon': 'fa-solid fa-scissors',
  'Food': 'fa-solid fa-bowl-food',
  'Drink': 'fa-solid fa-mug-hot',
  'Auto': 'fa-solid fa-car',
}

function getCategoryIcon(cat) {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (cat.includes(key)) return icon
  }
  return 'fa-solid fa-store'
}

export default function AuthenticatedHome() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [ads, setAds] = useState(SAMPLE_ADVERTS)
  const [loadingAds, setLoadingAds] = useState(false)
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [allBusinesses, setAllBusinesses] = useState(() => (DEMO_BUSINESSES || []))
  const [loadingBusinesses, setLoadingBusinesses] = useState(false)
  
  // Dynamic Stream Tabs: 'for_you' | 'near_me' | 'hidden_gems'
  const [activeStream, setActiveStream] = useState('for_you')
  const [radarRadius, setRadarRadius] = useState(5)
  const [visibleCount, setVisibleCount] = useState(12)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const categories = getSuggestedCategories()
  const autoRotateRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Fetch active adverts curated by Admin
  useEffect(() => {
    let isMounted = true
    setLoadingAds(true)
    getActiveAds()
      .then((activeList) => {
        if (isMounted) {
          setAds(activeList || [])
        }
      })
      .catch((err) => {
        console.warn('Could not load active ads:', err)
      })
      .finally(() => {
        if (isMounted) setLoadingAds(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Fetch recommended verified businesses
  useEffect(() => {
    let isMounted = true
    setLoadingBusinesses(true)
    getAllBusinesses(30)
      .then((all) => {
        if (isMounted) {
          const approved = (all || []).filter(
            (b) => b.status === 'active' || b.paymentStatus === 'approved' || b.verified === true
          )
          setAllBusinesses(approved.length > 0 ? approved : DEMO_BUSINESSES)
        }
      })
      .catch((err) => {
        console.warn('Could not load recommended businesses:', err)
      })
      .finally(() => {
        if (isMounted) setLoadingBusinesses(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Filter hero banners and flyer deals
  const heroAds = ads.filter((a) => a.placement === 'hero_banner')
  const flyerAds = ads.filter((a) => a.placement !== 'hero_banner')
  const activeHeroAds = heroAds.length > 0 ? heroAds : ads.slice(0, 2)
  const activeFlyerAds = flyerAds.length > 0 ? flyerAds : ads.slice(2)

  // Auto-rotate hero banners every 6 seconds
  useEffect(() => {
    if (activeHeroAds.length <= 1) return
    autoRotateRef.current = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % activeHeroAds.length)
    }, 6000)

    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current)
    }
  }, [activeHeroAds.length])

  const handleNextHero = () => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current)
    setCurrentHeroIndex((prev) => (prev + 1) % activeHeroAds.length)
  }

  const handlePrevHero = () => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current)
    setCurrentHeroIndex((prev) => (prev - 1 + activeHeroAds.length) % activeHeroAds.length)
  }

  const userName = profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Explorer'
  const isBusiness = profile?.role === 'vendor' || profile?.role === 'business'
  const isAdmin = profile?.role === 'admin'

  const currentHero = activeHeroAds[currentHeroIndex] || activeHeroAds[0]

  const getWhatsAppUrl = (phone, title, businessName) => {
    const raw = normalizeWhatsAppPhone(phone || '2348012345678')
    const msg = encodeURIComponent(
      `Hello! I saw your feature "${title}" on DOTCH and would like to inquire about this promotion.`
    )
    return `https://wa.me/${raw}?text=${msg}`
  }

  // Compute stream feeds
  const streamFeed = useMemo(() => {
    if (activeStream === 'for_you') {
      return [...allBusinesses].sort((a, b) => {
        const statsA = getBusinessStats(a)
        const statsB = getBusinessStats(b)
        return (statsB.views + (b.verified ? 100 : 0)) - (statsA.views + (a.verified ? 100 : 0))
      })
    }
    if (activeStream === 'near_me') {
      return [...allBusinesses].filter((b) => {
        const distNum = parseFloat(b.distance) || (1.2 + ((b.name?.charCodeAt(1) || 5) % 8) * 0.4)
        return distNum <= radarRadius
      })
    }
    if (activeStream === 'hidden_gems') {
      return [...allBusinesses].filter((b) => {
        const rating = parseFloat(b.rating || 4.8)
        return rating >= 4.7
      })
    }
    return allBusinesses
  }, [allBusinesses, activeStream, radarRadius])

  const currentDisplayPlaces = streamFeed.slice(0, visibleCount)
  const hasMore = visibleCount < streamFeed.length

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((prev) => prev + 8)
      setIsLoadingMore(false)
    }, 450)
  }

  return (
    <div className="authenticated-home ad-showcase-page purr-container" style={{ paddingBottom: '90px', paddingTop: '10px' }}>
      {/* Greeting Title */}
      <div style={{ margin: '14px 0 18px 0' }}>
        <div className="landing-live-badge">
          <span className="live-pulse-dot" />
          <span>⚡ Feed Active · Verified Local Explorers</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
          Welcome back, {userName}!
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Scroll through live vibes, verified gear & dining. Double-tap to like your favorite spots.
        </p>
      </div>

      {/* Sleek Search Bar Shortcut */}
      <div style={{ marginBottom: '18px' }}>
        <div
          className="purr-search-box"
          onClick={() => navigate('/dashboard')}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard')
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '15px', marginRight: '10px' }}>
            <i className="fa-solid fa-magnifying-glass" />
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1 }}>
            Search restaurants, streetwear, gadgets in Lagos…
          </span>
          <div className="purr-search-btn">
            <i className="fa-solid fa-arrow-right" />
          </div>
        </div>
      </div>

      {/* SECTION 1: DOTCH SPOTLIGHT HERO CAROUSEL */}
      {loadingAds ? (
        <div className="ad-hero-skeleton">
          <div className="center-loading">Loading DOTCH Spotlight…</div>
        </div>
      ) : currentHero ? (
        <section className="ad-hero-section" aria-label="DOTCH Spotlight Advertisement">
          <div className="ad-hero-banner" style={{ backgroundImage: `url(${currentHero.imageUrl || currentHero.flyerUrl})` }}>
            <div className="ad-hero-overlay">
              <div className="ad-hero-content">
                {/* Labels */}
                <div className="ad-badge-group">
                  <span className="ad-sponsored-pill">
                    {currentHero.badge === 'Sponsored' ? (
                      <><i className="fa-solid fa-bullhorn" style={{ marginRight: '5px' }} /> Sponsored</>
                    ) : (
                      <><i className="fa-solid fa-star" style={{ marginRight: '5px' }} /> DOTCH Spotlight</>
                    )}
                  </span>
                  {currentHero.targetReach && (
                    <span className="ad-reach-pill">
                      <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }} /> {currentHero.targetReach}
                    </span>
                  )}
                  {currentHero.pricePromo && (
                    <span className="ad-price-pill">
                      {currentHero.pricePromo}
                    </span>
                  )}
                </div>

                <h2 className="ad-hero-title">{currentHero.title}</h2>
                <p className="ad-hero-business-name">By {currentHero.businessName}</p>
                <p className="ad-hero-tagline">{currentHero.tagline}</p>

                {/* Call to Actions */}
                <div className="ad-hero-actions">
                  <a
                    href={getWhatsAppUrl(currentHero.phone, currentHero.title, currentHero.businessName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp ad-cta-btn"
                  >
                    <i className="fa-brands fa-whatsapp" style={{ marginRight: '5px' }} /> {currentHero.ctaText || 'Chat on WhatsApp'}
                  </a>
                  {currentHero.businessId && (
                    <Link
                      to={`/business/${currentHero.businessId}`}
                      className="btn btn-elevated-outline ad-view-btn"
                    >
                      <i className="fa-solid fa-store" style={{ marginRight: '5px' }} /> View Business Profile
                    </Link>
                  )}
                </div>
              </div>

              {/* Slider Controls */}
              {activeHeroAds.length > 1 && (
                <>
                  <div className="ad-hero-nav-arrows">
                    <button
                      type="button"
                      className="ad-nav-btn prev"
                      onClick={handlePrevHero}
                      aria-label="Previous Spotlight"
                    >
                      <i className="fa-solid fa-chevron-left" />
                    </button>
                    <button
                      type="button"
                      className="ad-nav-btn next"
                      onClick={handleNextHero}
                      aria-label="Next Spotlight"
                    >
                      <i className="fa-solid fa-chevron-right" />
                    </button>
                  </div>

                  <div className="ad-hero-dots">
                    {activeHeroAds.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`ad-dot ${idx === currentHeroIndex ? 'active' : ''}`}
                        onClick={() => {
                          if (autoRotateRef.current) clearInterval(autoRotateRef.current)
                          setCurrentHeroIndex(idx)
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* 🎯 DYNAMIC DISCOVERY STREAMS TABS */}
      <div className="discovery-stream-bar" style={{ marginTop: '24px' }}>
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
            <span>Near Me Radar</span>
          </button>

          <button
            type="button"
            className={`stream-tab-btn ${activeStream === 'hidden_gems' ? 'is-active' : ''}`}
            onClick={() => setActiveStream('hidden_gems')}
          >
            <i className="fa-solid fa-gem" />
            <span>Hidden Gems</span>
          </button>
        </div>
      </div>

      {/* Radar distance selector if "Near Me" stream is active */}
      {activeStream === 'near_me' && (
        <div className="radar-radius-strip">
          <span className="radar-label"><i className="fa-solid fa-location-crosshairs" /> Radius:</span>
          {[
            { km: 3, label: '< 3km' },
            { km: 5, label: '< 5km' },
            { km: 10, label: '< 10km' },
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

      {/* Social Discovery Feed Grid */}
      <div className="stream-section-header">
        <div>
          <h2 className="stream-title">
            {activeStream === 'for_you' && '🔥 Recommended For You'}
            {activeStream === 'near_me' && `📍 Spots Within ${radarRadius}km`}
            {activeStream === 'hidden_gems' && '💎 High-Rated Local Gems'}
          </h2>
          <p className="stream-subtitle">Double-tap photo to like · Instant WhatsApp chat</p>
        </div>
        <span className="stream-count-badge">
          {streamFeed.length} places
        </span>
      </div>

      {loadingBusinesses ? (
        <div className="center-loading">Loading discovery feed…</div>
      ) : currentDisplayPlaces.length > 0 ? (
        <div className="social-feed-grid">
          {currentDisplayPlaces.map((b) => (
            <BusinessCard key={`auth-feed-${b.id || b.name}`} business={b} />
          ))}
        </div>
      ) : (
        <div className="empty-stream-box">
          <i className="fa-solid fa-store" style={{ fontSize: '36px', color: 'var(--brand-primary)', marginBottom: '10px' }} />
          <h3>No spots found</h3>
          <p>Try switching to another discovery stream or searching by keyword.</p>
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

      {/* SECTION 4: POPULAR CATEGORIES BRIDGE */}
      <section className="home-section categories-section" style={{ marginTop: '36px' }}>
        <div className="section-header-row">
          <div>
            <div className="section-pretitle">Quick Navigation</div>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Jump straight into search filtered by your preferred industry</p>
          </div>
          <Link to="/dashboard" className="section-link">
            All Categories <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px', fontSize: '11px' }} />
          </Link>
        </div>

        <div className="home-category-grid">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              type="button"
              className="home-category-card"
              onClick={() => navigate(`/dashboard?cat=${encodeURIComponent(cat)}`)}
            >
              <span className="category-card-icon">
                <i className={getCategoryIcon(cat)} />
              </span>
              <span className="category-card-name">{cat}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
