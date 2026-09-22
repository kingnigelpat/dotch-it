import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BusinessCard from '../components/BusinessCard'
import { getActiveAds, SAMPLE_ADVERTS } from '../services/adService'
import { getAllBusinesses, DEMO_BUSINESSES } from '../services/businessService'
import { getSuggestedCategories } from '../services/openrouterService'
import { normalizeWhatsAppPhone } from '../utils/phoneUtils'

const CATEGORY_ICONS = {
  'Hotel': 'fa-solid fa-hotel',
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
  const [recentBusinesses, setRecentBusinesses] = useState(() => (DEMO_BUSINESSES || []).slice(0, 8))
  const [loadingBusinesses, setLoadingBusinesses] = useState(false)
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
    getAllBusinesses(12)
      .then((all) => {
        if (isMounted) {
          const approved = (all || []).filter(
            (b) => b.status === 'active' || b.paymentStatus === 'approved' || b.verified === true
          )
          setRecentBusinesses(approved.slice(0, 8))
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
  // Fallback if no specific hero_banner placement is tagged
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

  return (
    <div className="authenticated-home ad-showcase-page purr-container" style={{ paddingBottom: '90px', paddingTop: '10px' }}>
      {/* Top Header Bar — Clean & Minimal (Inspo Screen 1) */}
      <div className="purr-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/full-logo.png" alt="Dotch" style={{ height: '30px', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && (
            <Link to="/admin" className="filter-pill" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <i className="fa-solid fa-shield-halved" /> Admin
            </Link>
          )}
          {isBusiness ? (
            <Link to="/business" className="filter-pill active-coral" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <i className="fa-solid fa-store" /> Business Portal
            </Link>
          ) : (
            <Link to="/list-business" className="filter-pill active-coral" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <i className="fa-solid fa-plus" /> List Business
            </Link>
          )}
        </div>
      </div>

      {/* Greeting Title */}
      <div style={{ margin: '14px 0 18px 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Welcome back, {userName}!
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Discover verified places, hotels, dining & services around your area.
        </p>
      </div>

      {/* Sleek Search Bar Shortcut (Inspo Screen 1) */}
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
            Search restaurants, hotels, shops in Lagos…
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
      ) : (
        <section className="ad-hero-section" aria-label="DOTCH Spotlight">
          <div
            style={{
              background: 'linear-gradient(135deg, #3d5a6c 0%, #243844 100%)',
              borderRadius: 'var(--radius-card)',
              padding: '36px 28px',
              color: '#fff',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: '520px', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="ad-sponsored-pill">
                  <i className="fa-solid fa-sparkles" style={{ marginRight: '5px' }} /> Spotlight
                </span>
                <span className="ad-reach-pill">
                  📍 Verified Spots
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>
                Discover Curated Places & Deals
              </h2>
              <p style={{ fontSize: '13.5px', opacity: 0.9, lineHeight: 1.5, margin: '0 0 18px 0' }}>
                Find verified hotels, restaurants, lounges & stores. Connect directly with owners on WhatsApp with zero middlemen fees.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/dashboard" className="purr-pill-cta" style={{ padding: '10px 22px', fontSize: '13.5px' }}>
                  <i className="fa-solid fa-magnifying-glass" /> Browse Places
                </Link>
                <Link to="/list-business" className="btn-elevated-outline">
                  <i className="fa-solid fa-store" style={{ marginRight: '6px' }} /> Feature Your Business
                </Link>
              </div>
            </div>

            <div style={{ fontSize: '72px', opacity: 0.12, position: 'absolute', right: '24px', bottom: '10px' }}>
              <i className="fa-solid fa-store" />
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: DOTCH SPOTLIGHT FLYERS & CAMPAIGNS */}
      {activeFlyerAds.length > 0 && (
        <section className="home-section ad-flyers-section">
          <div className="section-header-row">
            <div>
              <div className="section-pretitle">Curated Promotions</div>
              <h2 className="section-title">Featured Campaigns & Offers</h2>
              <p className="section-subtitle">
                Exclusive business campaigns and verified promotions curated by the DOTCH team
              </p>
            </div>
            <span className="sponsored-disclaimer-pill">
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '5px' }} /> Admin-Curated
            </span>
          </div>

          <div className="ad-flyers-grid">
            {activeFlyerAds.map((item) => (
              <div key={item.id} className="ad-flyer-card">
                <div className="ad-flyer-image-container">
                  <img
                    src={item.flyerUrl || item.imageUrl}
                    alt={item.title}
                    className="ad-flyer-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop'
                    }}
                  />
                  <div className="ad-flyer-badge-overlay">
                    <span className="ad-tag-badge">
                      {item.badge || 'DOTCH Spotlight'}
                    </span>
                    {item.targetReach && (
                      <span className="ad-tag-reach">{item.targetReach}</span>
                    )}
                  </div>
                </div>

                <div className="ad-flyer-body">
                  <div className="ad-flyer-meta">
                    <span className="ad-flyer-cat">{item.category}</span>
                    {item.pricePromo && (
                      <span className="ad-flyer-price">{item.pricePromo}</span>
                    )}
                  </div>

                  <h3 className="ad-flyer-title">{item.title}</h3>
                  <p className="ad-flyer-vendor"><i className="fa-solid fa-building" style={{ marginRight: '5px', opacity: 0.6 }} /> {item.businessName}</p>
                  <p className="ad-flyer-desc">{item.tagline}</p>

                  <div className="ad-flyer-action-row">
                    <a
                      href={getWhatsAppUrl(item.phone, item.title, item.businessName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm btn-block"
                    >
                      <i className="fa-brands fa-whatsapp" style={{ marginRight: '5px' }} /> {item.ctaText || 'Connect on WhatsApp'}
                    </a>
                    {item.businessId && (
                      <Link
                        to={`/business/${item.businessId}`}
                        className="btn btn-ghost btn-sm"
                        title="View Full Profile"
                      >
                        Profile <i className="fa-solid fa-arrow-right" style={{ marginLeft: '3px', fontSize: '10px' }} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: RECOMMENDED BUSINESSES */}
      <section className="home-section recommended-section">
        <div className="section-header-row">
          <div>
            <div className="section-pretitle">Curated Directory</div>
            <h2 className="section-title">Recommended Businesses</h2>
            <p className="section-subtitle">
              Verified service providers, hotels, dining & retail stores across Nigeria
            </p>
          </div>
          <Link to="/dashboard" className="section-link">
            Open Full Search <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px', fontSize: '11px' }} />
          </Link>
        </div>

        {loadingBusinesses ? (
          <div className="center-loading">Loading recommended businesses…</div>
        ) : recentBusinesses.length > 0 ? (
          <div className="results-grid">
            {recentBusinesses.map((b) => (
              <BusinessCard key={b.id || b.name} business={b} />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <div className="empty-state-icon"><i className="fa-solid fa-store" style={{ fontSize: '32px', color: 'var(--brand-primary)' }} /></div>
            <h3>Explore Verified Businesses</h3>
            <p>Use our dedicated search engine to find businesses by keyword, category, or city.</p>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Go to Search
            </Link>
          </div>
        )}
      </section>

      {/* SECTION 4: POPULAR CATEGORIES BRIDGE */}
      <section className="home-section categories-section">
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

      {/* SECTION 5: TRUST & DIRECT CONNECTION STRIP */}
      <section className="auth-home-notice-strip">
        <div className="notice-icon"><i className="fa-solid fa-shield-halved" /></div>
        <div className="notice-content">
          <strong>Promotional & Direct Connection Policy:</strong>
          <span>
            {' '}Advertisements displayed here are curated or approved by DOTCH management. DOTCH connects buyers and clients directly with genuine business owners on WhatsApp with zero middlemen markups. Always verify transaction and delivery details directly.
          </span>
        </div>
      </section>
    </div>
  )
}
