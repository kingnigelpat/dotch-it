import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BusinessCard from '../components/BusinessCard'
import { getActiveAds } from '../services/adService'
import { getAllBusinesses } from '../services/businessService'
import { getSuggestedCategories } from '../services/openrouterService'

export default function AuthenticatedHome() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [ads, setAds] = useState([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [recentBusinesses, setRecentBusinesses] = useState([])
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)
  const categories = getSuggestedCategories()

  const autoRotateRef = useRef(null)

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
    const raw = phone ? phone.replace(/[^0-9]/g, '') : '2348012345678'
    const msg = encodeURIComponent(
      `Hello! I saw your feature "${title}" on DOTCH and would like to inquire about this promotion.`
    )
    return `https://wa.me/${raw}?text=${msg}`
  }

  return (
    <div className="authenticated-home ad-showcase-page">
      {/* Top Header Bar */}
      <div className="home-top-header">
        <div className="home-top-greeting-wrap">
          <div className="home-badge-row">
            <span className={`badge-pill ${isBusiness ? 'vendor-badge' : 'explorer-badge'}`}>
              {isBusiness ? '💼 Business Partner' : '🔎 Explorer'}
            </span>
            <span className="badge-sparkle">📢 Curated Showcase</span>
          </div>
          <h1 className="home-welcome-title">Welcome back, {userName}!</h1>
          <p className="home-welcome-subtitle">
            Explore promotional campaigns, admin spotlights, and verified businesses across Nigeria.
          </p>
        </div>

        <div className="home-top-actions">
          {isAdmin && (
            <Link to="/admin" className="btn btn-outline btn-sm admin-portal-cta">
              🛡️ Admin Ad Manager
            </Link>
          )}
          {isBusiness ? (
            <Link to="/business" className="btn btn-primary btn-sm">
              📊 Business Portal →
            </Link>
          ) : (
            <Link to="/list-business" className="btn btn-outline btn-sm">
              🚀 Feature Your Business
            </Link>
          )}
        </div>
      </div>

      {/* Quick Search Shortcut Bridge */}
      <div
        className="home-search-bridge"
        onClick={() => navigate('/dashboard')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard')
        }}
      >
        <div className="search-bridge-left">
          <span className="search-bridge-icon">🔍</span>
          <span className="search-bridge-placeholder">
            Looking for something specific? Search 5,000+ Nigerian businesses, hotels & services...
          </span>
        </div>
        <button
          type="button"
          className="search-bridge-cta-btn"
          onClick={(e) => {
            e.stopPropagation()
            navigate('/dashboard')
          }}
        >
          Open Search →
        </button>
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
                    {currentHero.badge === 'Sponsored' ? '📢 Sponsored' : '🌟 DOTCH Spotlight'}
                  </span>
                  {currentHero.targetReach && (
                    <span className="ad-reach-pill">
                      📍 {currentHero.targetReach}
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
                    💬 {currentHero.ctaText || 'Chat on WhatsApp'}
                  </a>
                  {currentHero.businessId && (
                    <Link
                      to={`/business/${currentHero.businessId}`}
                      className="btn btn-elevated-outline ad-view-btn"
                    >
                      🏪 View Business Profile
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
                      ‹
                    </button>
                    <button
                      type="button"
                      className="ad-nav-btn next"
                      onClick={handleNextHero}
                      aria-label="Next Spotlight"
                    >
                      ›
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
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#fff',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📢</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
              DOTCH Spotlight — Coming Soon
            </h2>
            <p style={{ fontSize: '15px', opacity: 0.85, maxWidth: '480px', margin: '0 auto' }}>
              Admin-curated business campaigns and featured promotions will appear here. Check back soon!
            </p>
          </div>
        </section>
      )}

      {/* SECTION 2: DOTCH SPOTLIGHT FLYERS & CAMPAIGNS */}
      {activeFlyerAds.length > 0 && (
        <section className="home-section ad-flyers-section">
          <div className="section-header-row">
            <div>
              <div className="section-pretitle">Curated Promotions</div>
              <h2 className="section-title">DOTCH Spotlight: Featured Campaigns & Offers</h2>
              <p className="section-subtitle">
                Exclusive business campaigns, product drops, and verified promotions curated by the DOTCH team
              </p>
            </div>
            <span className="sponsored-disclaimer-pill">
              🛡️ Admin-Curated Ads
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
                  <p className="ad-flyer-vendor">🏢 {item.businessName}</p>
                  <p className="ad-flyer-desc">{item.tagline}</p>

                  <div className="ad-flyer-action-row">
                    <a
                      href={getWhatsAppUrl(item.phone, item.title, item.businessName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm btn-block"
                    >
                      💬 {item.ctaText || 'Connect on WhatsApp'}
                    </a>
                    {item.businessId && (
                      <Link
                        to={`/business/${item.businessId}`}
                        className="btn btn-ghost btn-sm"
                        title="View Full Profile"
                      >
                        Profile →
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
            Open Full Search Experience →
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
            <div className="empty-state-icon">🏪</div>
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
            All Categories →
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
                {cat.includes('Hotel') ? '🏨' :
                 cat.includes('Restaurant') ? '🍽️' :
                 cat.includes('Tech') || cat.includes('Electronic') ? '📱' :
                 cat.includes('Fashion') ? '👟' :
                 cat.includes('Beauty') || cat.includes('Salon') ? '✂️' :
                 cat.includes('Food') || cat.includes('Drink') ? '🍰' :
                 cat.includes('Auto') ? '🚗' : '🏪'}
              </span>
              <span className="category-card-name">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 5: TRUST & DIRECT CONNECTION STRIP */}
      <section className="auth-home-notice-strip">
        <div className="notice-icon">🛡️</div>
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
