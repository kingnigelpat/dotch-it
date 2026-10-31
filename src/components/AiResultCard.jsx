import { Link } from 'react-router-dom'

/**
 * Result Card for AI Discovery Page
 * 
 * Shows logo, business name, category, short description, location,
 * sponsored badge (if sponsored), and a "View" button.
 */
export default function AiResultCard({ seller }) {
  if (!seller) return null

  const logo = seller.logoUrl || seller.image1Url || '/icon-logo.png'
  const detailUrl = `/business/${seller.id}`
  const rawPhone = seller.phone || seller.whatsapp ? String(seller.phone || seller.whatsapp).replace(/\D/g, '') : null
  const whatsappUrl = rawPhone
    ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hello ${seller.name}, I discovered your business on Dotch AI Discovery and would like to make an inquiry.`)}`
    : null

  return (
    <article className={`ai-result-card ${seller.isSponsored ? 'is-sponsored-result' : ''}`}>
      <div className="ai-card-top">
        <div className="ai-card-logo-wrap">
          <img
            src={logo}
            alt={seller.name}
            className="ai-card-logo"
            loading="lazy"
          />
        </div>

        <div className="ai-card-header-info">
          <div className="ai-card-badges-row">
            {seller.isSponsored && (
              <span className="sponsored-badge">
                <i className="fa-solid fa-sparkles" style={{ marginRight: '3px', fontSize: '9px' }} />
                Sponsored
              </span>
            )}
            <span className="ai-card-category-badge">{seller.category}</span>
          </div>

          <h3 className="ai-card-title">
            <Link to={detailUrl}>{seller.name}</Link>
          </h3>

          <span className="ai-card-location">
            <i className="fa-solid fa-location-dot" style={{ marginRight: '4px', color: 'var(--brand-primary)' }} />
            {seller.location}
          </span>
        </div>
      </div>

      <p className="ai-card-description">
        {seller.description}
      </p>

      {seller.sponsorshipTagline && seller.isSponsored && (
        <div className="ai-card-promo-banner">
          {seller.sponsorshipTagline}
        </div>
      )}

      <div className="ai-card-footer">
        <div className="ai-card-rating">
          {seller.rating && (
            <span>
              <i className="fa-solid fa-star" style={{ color: '#f59e0b', marginRight: '3px' }} />
              <strong>{seller.rating}</strong>
              <small style={{ color: 'var(--text-muted)', marginLeft: '3px' }}>
                ({seller.reviewsCount || 20}+ reviews)
              </small>
            </span>
          )}
        </div>

        <div className="ai-card-action-btns">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-whatsapp"
              title="Chat on WhatsApp"
            >
              <i className="fa-brands fa-whatsapp" />
            </a>
          )}
          <Link to={detailUrl} className="btn-card-view">
            View
            <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px', fontSize: '11px' }} />
          </Link>
        </div>
      </div>
    </article>
  )
}
