import { Link } from 'react-router-dom'

/**
 * Sponsored Bottom Strip Ad
 * Placed at the bottom of the AI discovery interface.
 * Stays visible on both desktop and mobile.
 */
export default function SponsoredBottomStrip({ seller }) {
  if (!seller) return null

  const visitUrl = `/business/${seller.id}`
  const logo = seller.logoUrl || seller.image1Url || '/icon-logo.png'

  return (
    <aside className="sponsored-bottom-strip" aria-label="Sponsored Partner Spotlight">
      <div className="sponsored-strip-inner">
        <div className="sponsored-strip-left">
          <span className="sponsored-badge">
            <i className="fa-solid fa-sparkles" style={{ marginRight: '4px', fontSize: '9px' }} />
            Sponsored
          </span>
          <img
            src={logo}
            alt={seller.name}
            className="sponsored-strip-thumb"
            loading="lazy"
          />
          <div className="sponsored-strip-text">
            <div className="strip-title-row">
              <span className="sponsored-strip-name">{seller.name}</span>
              <span className="sponsored-strip-dot">•</span>
              <span className="sponsored-strip-cat">{seller.category}</span>
            </div>
            <p className="sponsored-strip-tagline">
              {seller.sponsorshipTagline || seller.tagline || seller.description}
            </p>
          </div>
        </div>

        <div className="sponsored-strip-actions">
          <Link to={visitUrl} className="btn-visit-strip">
            Visit <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
