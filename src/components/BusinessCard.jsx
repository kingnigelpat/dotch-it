import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { normalizeWhatsAppPhone } from '../utils/phoneUtils'

export default function BusinessCard({ business }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!business) return null

  // AI Suggestion card layout
  if (business.isAI) {
    return (
      <div className="result-card result-card-ai">
        <div>
          <span className="ai-card-badge"><i className="fa-solid fa-robot" style={{ marginRight: '5px' }} /> AI Recommendation</span>
          <h3 className="result-title" style={{ fontSize: '18px', marginTop: '4px' }}>
            {business.name}
          </h3>
          <span className="result-category">{business.category || 'General'}</span>
        </div>

        <p className="result-desc">{business.description || business.reason}</p>

        <div className="result-meta-row">
          <span className="result-meta-item"><i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }} /> Nearby match suggestion</span>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Unlisted business — suggest them to register on Dotch!
          </p>
          <span className="btn btn-outline btn-sm btn-block" style={{ opacity: 0.7, pointerEvents: 'none' }}>
            Unverified Listing
          </span>
        </div>
      </div>
    )
  }

  // Pre-filled WhatsApp message
  const rawPhone = normalizeWhatsAppPhone(business.phone || '2348012345678')
  const customMessage = encodeURIComponent(
    `Hi ${business.name}! I found your listing on Dotch and would like to inquire about your products/services.`
  )
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${customMessage}`

  return (
    <div className="result-card">
      <div className="result-card-top">
        <img
          src={business.logoUrl || '/logo-placeholder.svg'}
          alt={business.name}
          className="result-logo"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop'
          }}
        />
        <div className="result-header-text">
          <div className="result-title-row">
            <h3 className="result-title">{business.name}</h3>
            {business.subscriptionTier === 'enterprise_monthly' || business.subscriptionTier === 'growth_vip' ? (
              <span className="badge-vip" title="Corporate / Hotel VIP Spotlight"><i className="fa-solid fa-crown" style={{ marginRight: '4px' }} /> Corporate / Hotel</span>
            ) : business.subscriptionTier === 'pro_monthly' ? (
              <span className="badge-pro" title="Standard Verified Business"><i className="fa-solid fa-bolt" style={{ marginRight: '4px' }} /> Standard Business</span>
            ) : business.verified ? (
              <span className="badge-verified"><i className="fa-solid fa-circle-check" style={{ marginRight: '3px' }} /> Verified</span>
            ) : null}
          </div>
          <span className="result-category">{business.category || 'Local Business'}</span>
          {business.price && (
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '2px' }}>
              {business.price}
            </div>
          )}
        </div>
      </div>

      <p className="result-desc">
        {business.description || 'Verified local store offering authentic products and services.'}
      </p>

      <div className="result-meta-row">
        <span className="result-meta-item">
          <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }} /> {business.location || business.city || 'Lagos'}
          {business.distance && ` · ${business.distance}`}
        </span>
        {business.rating && (
          <span className="result-meta-item"><i className="fa-solid fa-star" style={{ marginRight: '3px', color: '#f59e0b' }} /> {business.rating}</span>
        )}
      </div>

      {(business.image1Url || business.image2Url) && (
        <div className="result-thumbs">
          {business.image1Url && (
            <img src={business.image1Url} alt="Product preview 1" className="result-thumb-img" />
          )}
          {business.image2Url && (
            <img src={business.image2Url} alt="Product preview 2" className="result-thumb-img" />
          )}
        </div>
      )}

      {/* Action buttons with custom WhatsApp pre-filled text & View details */}
      <div className="result-actions">
        <button
          type="button"
          className="btn btn-whatsapp btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            if (!user) {
              navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}&reason=whatsapp`)
              return
            }
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
          }}
          title={user ? 'Chat on WhatsApp' : 'Log in to chat on WhatsApp'}
        >
          {user ? (
            <><i className="fa-brands fa-whatsapp" style={{ marginRight: '5px' }} /> Chat on WhatsApp</>
          ) : (
            <><i className="fa-solid fa-lock" style={{ marginRight: '5px' }} /> Log in to WhatsApp</>
          )}
        </button>

        <Link to={`/business/${business.id}`} className="btn btn-primary btn-sm">
          View details <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px', fontSize: '11px' }} />
        </Link>
      </div>
    </div>
  )
}
