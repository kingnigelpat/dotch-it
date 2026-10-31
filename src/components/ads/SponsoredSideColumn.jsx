import { Link } from 'react-router-dom'

/**
 * Sponsored Side Column Ad (Desktop Only)
 * Positioned on the flanks of the central AI hero.
 */
export default function SponsoredSideColumn({ seller, side = 'left' }) {
  if (!seller) return null

  const visitUrl = `/business/${seller.id}`
  const logo = seller.logoUrl || seller.image1Url || '/icon-logo.png'

  return (
    <aside
      className={`sponsored-side-column side-${side} desktop-only`}
      aria-label={`Sponsored ${side} placement`}
    >
      <div className="sponsored-side-card">
        <div className="sponsored-card-header">
          <span className="sponsored-badge">
            <i className="fa-solid fa-sparkles" style={{ marginRight: '4px', fontSize: '9px' }} />
            Sponsored
          </span>
          <span className="sponsored-card-category">{seller.category}</span>
        </div>

        <div className="sponsored-side-image-wrap">
          <img
            src={logo}
            alt={seller.name}
            className="sponsored-side-img"
            loading="lazy"
          />
          {seller.rating && (
            <div className="sponsored-rating-pill">
              ★ {seller.rating} ({seller.reviewsCount || 20}+)
            </div>
          )}
        </div>

        <div className="sponsored-side-body">
          <h4 className="sponsored-seller-name">{seller.name}</h4>
          <span className="sponsored-card-location">📍 {seller.location}</span>
          <p className="sponsored-side-tagline">
            {seller.sponsorshipTagline || seller.tagline || seller.description}
          </p>
        </div>

        <div className="sponsored-side-footer">
          <Link to={visitUrl} className="btn-visit-side">
            Visit Store <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginLeft: '4px' }} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
