import { Link } from 'react-router-dom'
import { normalizeWhatsAppPhone } from '../utils/phoneUtils'

// Curated aesthetic fallback photos based on category keywords
const CATEGORY_FALLBACKS = {
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80',
  stay: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80',
  tech: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
  auto: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
}

function getCoverPhoto(business) {
  if (business.image1Url) return business.image1Url
  if (business.image2Url) return business.image2Url
  if (business.logoUrl && !business.logoUrl.includes('logo-placeholder')) return business.logoUrl

  const cat = (business.category || '').toLowerCase()
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (cat.includes(key)) return url
  }
  return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
}

export default function BusinessCard({ business, inCarousel = false }) {
  if (!business) return null

  // AI Suggestion card layout
  if (business.isAI) {
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
    `Hi ${business.name}! I found your place on Dotch and would like to inquire.`
  )
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${customMessage}`

  const coverImage = getCoverPhoto(business)
  const rating = business.rating || (4.5 + ((business.name?.charCodeAt(0) || 7) % 5) * 0.1).toFixed(1)
  const priceDisplay = business.price || (
    business.category?.toLowerCase().includes('hotel') ? '₦25,000 / night' :
    business.category?.toLowerCase().includes('restaurant') || business.category?.toLowerCase().includes('food') ? '₦4,500 avg' :
    'Verified Spot'
  )

  // Split tags cleanly (e.g. "Restaurant & Dining" -> ["Restaurant", "Dining"])
  const tags = (business.category || 'Local Spot')
    .split(/[&,/]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 2)

  return (
    <div className={`purr-card ${inCarousel ? 'purr-card-carousel-item' : ''}`}>
      {/* Visual Cover Photo with Floating Badges (Inspo Screen 1) */}
      <div className="purr-card-img-wrap">
        <img
          src={coverImage}
          alt={business.name}
          className="purr-card-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
          }}
        />

        {/* Floating Price Badge (Top Left) */}
        <span className="floating-badge-price">
          {priceDisplay}
        </span>

        {/* Floating Discount or Verified Badge (Top Right) */}
        {business.subscriptionTier === 'enterprise_monthly' || business.subscriptionTier === 'growth_vip' ? (
          <span className="floating-badge-verified">
            <i className="fa-solid fa-crown" /> VIP
          </span>
        ) : business.verified ? (
          <span className="floating-badge-deal" style={{ background: 'var(--brand-primary)' }}>
            ✓ Verified
          </span>
        ) : (
          <span className="floating-badge-deal">
            Open
          </span>
        )}
      </div>

      {/* Card Information Body */}
      <div className="purr-card-body">
        {/* Distance Indicator Badge */}
        <div className="purr-distance-pill">
          <i className="fa-solid fa-location-dot" style={{ color: 'var(--brand-primary)', fontSize: '10.5px' }} />
          <span>{business.distance || `${(1.1 + ((business.name?.charCodeAt(1) || 5) % 8) * 0.4).toFixed(1)} km away`}</span>
          <span>·</span>
          <span>{business.location || business.city || 'Lagos'}</span>
        </div>

        {/* Title and Star Rating */}
        <div className="purr-card-title-row">
          <Link
            to={`/business/${business.id}`}
            style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}
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

        {/* Soft Terracotta Category Tags */}
        <div className="purr-tag-row">
          {tags.map((tag, idx) => (
            <span key={idx} className="purr-tag">
              {tag}
            </span>
          ))}
          {business.city && (
            <span className="purr-tag" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              {business.city}
            </span>
          )}
        </div>

        {/* Action Buttons: Instant WhatsApp & View details */}
        <div className="purr-card-actions">
          {business.phone ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-purr-wa"
              onClick={(e) => e.stopPropagation()}
              title="Chat directly on WhatsApp"
            >
              <i className="fa-brands fa-whatsapp" /> Chat
            </a>
          ) : null}

          <Link
            to={`/business/${business.id}`}
            className="btn-purr-details"
            style={{ flex: business.phone ? 'none' : '1', textAlign: 'center' }}
          >
            Details <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', marginLeft: '4px' }} />
          </Link>
        </div>
      </div>
    </div>
  )
}

