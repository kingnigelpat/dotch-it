import { Link } from 'react-router-dom'

export default function BusinessCard({ business }) {
  return (
    <Link to={`/business/${business.id}`} className="card">
      <div className="card-media">
        <img
          src={business.logoUrl || '/logo-placeholder.svg'}
          alt={business.name}
          className="card-logo"
          onError={(e) => {
            e.currentTarget.src = '/logo-placeholder.svg'
          }}
        />
      </div>
      <div className="card-body">
        <h3 className="card-title">{business.name}</h3>
        <span className="chip">{business.category || 'General'}</span>
        <p className="card-desc">
          {business.description || 'No description yet.'}
        </p>
      </div>
      {(business.image1Url || business.image2Url) && (
        <div className="card-thumbs">
          {business.image1Url && (
            <img src={business.image1Url} alt="product 1" />
          )}
          {business.image2Url && (
            <img src={business.image2Url} alt="product 2" />
          )}
        </div>
      )}
    </Link>
  )
}
