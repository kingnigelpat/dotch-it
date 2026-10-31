import { Link } from 'react-router-dom'

/**
 * Sponsored Top Banner Ad
 * Placed neatly at the top of the AI discovery interface.
 */
export default function SponsoredBanner({ seller }) {
  if (!seller) return null

  const visitUrl = `/business/${seller.id}`
  const logo = seller.logoUrl || seller.image1Url || '/icon-logo.png'

  return (
    <aside className="sponsored-banner-ad" aria-label="Sponsored Announcement">
      <div className="sponsored-banner-inner">
        <div className="sponsored-ad-meta">
          <span className="sponsored-badge">
            <i className="fa-solid fa-sparkles" style={{ marginRight: '4px', fontSize: '10px' }} />
            Sponsored
          </span>
          <span className="sponsored-location-tag">📍 {seller.city || seller.location}</span>
        </div>

        <div className="sponsored-banner-content">
          <img
            src={logo}
            alt={seller.name}
            className="sponsored-seller-logo"
            loading="lazy"
          />
          <div className="sponsored-banner-info">
            <h4 className="sponsored-seller-name">{seller.name}</h4>
            <p className="sponsored-seller-tagline">
              {seller.sponsorshipTagline || seller.tagline || seller.description}
            </p>
          </div>
        </div>

        <div className="sponsored-banner-actions">
          <Link to={visitUrl} className="btn-visit-sponsored">
            Visit <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px', fontSize: '11px' }} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
