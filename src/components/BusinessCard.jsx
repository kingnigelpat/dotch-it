import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { normalizeWhatsAppPhone } from '../utils/phoneUtils'
import {
  isBusinessLiked,
  toggleBusinessLike,
  isBusinessSaved,
  toggleBusinessSave,
  getBusinessStats,
  getVibeTags,
} from '../utils/socialStore'

// Highly distinct, curated aesthetic fallback photos based on category & keyword
const CATEGORY_FALLBACKS = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
  repair: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop',
  tech: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop',
  electronic: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop',
  phone: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop',
  barber: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop',
  beauty: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop',
  sneaker: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop',
  shoe: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
  fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop',
  cloth: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop',
  auto: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop',
  car: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop',
  grill: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
}

function getDistinctCoverPhoto(business) {
  if (!business) return CATEGORY_FALLBACKS.food
  if (business.image1Url && !business.image1Url.includes('placeholder')) return business.image1Url
  if (business.image2Url && !business.image2Url.includes('placeholder')) return business.image2Url
  if (business.logoUrl && !business.logoUrl.includes('logo-placeholder')) return business.logoUrl

  const str = `${business.name || ''} ${business.category || ''} ${business.description || ''}`.toLowerCase()
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (str.includes(key)) return url
  }
  return CATEGORY_FALLBACKS.food
}

export default function BusinessCard({ business, inCarousel = false }) {
  const businessId = business?.id || business?.name || 'dotch-card'
  const isAI = Boolean(business?.isAI)

  const [liked, setLiked] = useState(() => (business ? isBusinessLiked(businessId) : false))
  const [saved, setSaved] = useState(() => (business ? isBusinessSaved(businessId) : false))
  const stats = useMemo(() => getBusinessStats(business), [business])
  const [likeCount, setLikeCount] = useState(() => stats.baseLikes + (liked ? 1 : 0))
  const [showHeartPop, setShowHeartPop] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  
  const lastTapRef = useRef(0)
  const heartTimerRef = useRef(null)

  // Sync state if custom event occurs elsewhere in the app
  useEffect(() => {
    if (!business) return
    const handleSocialUpdate = (e) => {
      if (e.detail?.id === businessId) {
        if (e.detail.type === 'like') {
          setLiked(e.detail.isLiked)
          setLikeCount((prev) => (e.detail.isLiked ? prev + 1 : Math.max(0, prev - 1)))
        }
        if (e.detail.type === 'save') {
          setSaved(e.detail.isSaved)
        }
      }
    }
    window.addEventListener('dotch_social_update', handleSocialUpdate)
    return () => window.removeEventListener('dotch_social_update', handleSocialUpdate)
  }, [businessId, business])

  if (!business) return null

  // AI Suggestion card layout
  if (isAI) {
    return (
      <div className={`purr-card ${inCarousel ? 'purr-card-carousel-item' : ''}`}>
        <div className="purr-card-img-wrap" style={{ height: '120px', background: 'var(--accent-petrol-light)' }}>
          <div className="floating-badge-price" style={{ background: 'var(--accent-petrol)', color: '#fff' }}>
            <i className="fa-solid fa-robot" /> AI Match
          </div>
        </div>
        <div className="purr-card-body">
          <div className="purr-card-title-row">
            <h3 className="purr-card-title">{business.name}</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: 1.4 }}>
            {business.description || business.reason}
          </p>
          <div className="purr-tag-row">
            <span className="purr-tag">{business.category || 'Local Suggestion'}</span>
          </div>
          <div className="purr-card-actions">
            <Link to="/list-business" className="btn-purr-details" style={{ width: '100%', textAlign: 'center' }}>
              Recommend to Register
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Pre-filled WhatsApp message
  const rawPhone = normalizeWhatsAppPhone(business.phone || '2348012345678')
  const customMessage = encodeURIComponent(
    `Hi ${business.name}! I discovered your spot on DOTCH and would like to inquire.`
  )
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${customMessage}`
  const callUrl = business.phone ? `tel:${business.phone}` : null

  // Photos list for multi-photo support
  const photos = [
    business.image1Url,
    business.image2Url,
  ].filter(Boolean)

  const coverImage = photos.length > 0 ? photos[activePhotoIdx % photos.length] : getDistinctCoverPhoto(business)
  const rating = business.rating || (4.6 + ((business.name?.charCodeAt(0) || 7) % 4) * 0.1).toFixed(1)
  
  const priceDisplay = business.price || (
    business.category?.toLowerCase().includes('restaurant') || business.category?.toLowerCase().includes('food') ? '₦4,500 avg' :
    business.category?.toLowerCase().includes('tech') || business.category?.toLowerCase().includes('phone') ? 'Verified Gear' :
    'Verified Spot'
  )

  const vibeTags = getVibeTags(business)

  // Handle double tap to heart
  const handleImageTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!liked) {
        toggleBusinessLike(businessId)
      }
      setShowHeartPop(true)
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current)
      heartTimerRef.current = setTimeout(() => setShowHeartPop(false), 900)
    }
    lastTapRef.current = now
  }

  const handleHeartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const newState = toggleBusinessLike(businessId)
    if (newState) {
      setShowHeartPop(true)
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current)
      heartTimerRef.current = setTimeout(() => setShowHeartPop(false), 800)
    }
  }

  const handleSaveClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleBusinessSave(businessId, business)
  }

  const handleFallbackImageError = (e) => {
    const fallback = getDistinctCoverPhoto(business)
    if (e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback
    } else {
      e.currentTarget.src = CATEGORY_FALLBACKS.food
    }
  }

  return (
    <div className={`purr-card social-discovery-card ${inCarousel ? 'purr-card-carousel-item' : ''}`}>
      {/* Visual Cover Photo Area with Double-Tap Heart Interaction */}
      <div
        className="purr-card-img-wrap"
        onClick={handleImageTap}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={coverImage}
          alt={business.name}
          className="purr-card-img"
          loading="lazy"
          onError={handleFallbackImageError}
        />

        {/* Double-Tap Pop Heart Animation */}
        {showHeartPop && (
          <div className="double-tap-heart-bubble">
            <i className="fa-solid fa-heart" />
          </div>
        )}

        {/* Top Overlay Badges */}
        <div className="card-top-badges">
          <span className="floating-badge-price">
            {priceDisplay}
          </span>

          <div className="card-top-social-actions">
            <button
              type="button"
              className={`social-icon-btn like-btn ${liked ? 'is-active' : ''}`}
              onClick={handleHeartClick}
              title={liked ? 'Unlike spot' : 'Double-tap or click to like'}
              aria-label="Like spot"
            >
              <i className="fa-solid fa-heart" style={{ color: liked ? '#ff3366' : '#ffffff', fontSize: '13px' }} />
              <span className="like-count-num">{likeCount}</span>
            </button>

            <button
              type="button"
              className={`social-icon-btn save-btn ${saved ? 'is-active' : ''}`}
              onClick={handleSaveClick}
              title={saved ? 'Remove from saved collection' : 'Save to my bucket list'}
              aria-label="Save spot"
            >
              <i className="fa-solid fa-bookmark" style={{ color: saved ? '#ee5d36' : '#ffffff', fontSize: '13px' }} />
            </button>
          </div>
        </div>

        {/* Photo Switcher Dots if multiple images */}
        {photos.length > 1 && (
          <div className="card-photo-dots" onClick={(e) => e.stopPropagation()}>
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={`photo-dot ${idx === (activePhotoIdx % photos.length) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActivePhotoIdx(idx)
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom Image Gradient Overlay with Vibe Pill */}
        <div className="card-img-bottom-gradient">
          <div className="card-vibe-pill-strip">
            {vibeTags.map((tag, i) => (
              <span key={i} className="vibe-tag-badge">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Information Body */}
      <div className="purr-card-body">
        {/* Distance & Live Social Proof Strip */}
        <div className="card-sub-header">
          <div className="purr-distance-pill">
            <i className="fa-solid fa-location-dot" style={{ color: 'var(--brand-primary)', fontSize: '11px' }} />
            <span>{business.distance || `${(1.1 + ((business.name?.charCodeAt(1) || 5) % 8) * 0.4).toFixed(1)} km away`}</span>
            <span>·</span>
            <span>{business.location || business.city || 'Lagos'}</span>
          </div>

          <div className="live-explorer-proof">
            <span className="live-pulse-dot" />
            <span>🔥 {stats.savesToday} saved today</span>
          </div>
        </div>

        {/* Title and Star Rating */}
        <div className="purr-card-title-row">
          <Link
            to={`/business/${business.id}`}
            style={{ textDecoration: 'none', color: 'inherit', minWidth: 0, flex: 1 }}
          >
            <h3 className="purr-card-title" title={business.name}>
              {business.name}
            </h3>
          </Link>

          <div className="purr-card-rating">
            <i className="fa-solid fa-star" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Short Punchy Description */}
        {business.description && (
          <p className="card-short-desc">
            {business.description}
          </p>
        )}

        {/* Seamless Floating WhatsApp / Call Action Bar */}
        <div className="purr-card-actions social-card-actions">
          {business.phone ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-purr-wa-floating"
              onClick={(e) => e.stopPropagation()}
              title="Chat directly on WhatsApp"
            >
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '15px' }} /> <span>Chat</span>
            </a>
          ) : null}

          {callUrl && (
            <a
              href={callUrl}
              className="btn-purr-call-floating"
              onClick={(e) => e.stopPropagation()}
              title="Call Business Owner"
            >
              <i className="fa-solid fa-phone" style={{ fontSize: '12px' }} />
            </a>
          )}

          <Link
            to={`/business/${business.id}`}
            className="btn-purr-details-floating"
            title="View full menu, photos & vibe details"
          >
            <span>Explore</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '10.5px' }} />
          </Link>
        </div>
      </div>
    </div>
  )
}
