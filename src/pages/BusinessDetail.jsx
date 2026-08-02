import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBusiness } from '../services/businessService'

export default function BusinessDetail() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setNotFound(true)
      return
    }
    getBusiness(id)
      .then((b) => {
        if (b) setBusiness(b)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="center-loading">Loading…</div>
  if (notFound)
    return (
      <div className="empty-state">
        <h2>Business not found</h2>
        <Link to="/dashboard" className="btn btn-primary">
          Back to search
        </Link>
      </div>
    )

  return (
    <div className="detail">
      <div className="detail-hero">
        <img
          src={business.logoUrl || '/logo-placeholder.svg'}
          alt={business.name}
          className="detail-logo"
          onError={(e) => {
            e.currentTarget.src = '/logo-placeholder.svg'
          }}
        />
        <div>
          <span className="chip">{business.category || 'General'}</span>
          <h1>{business.name}</h1>
          <p>{business.description || 'No description yet.'}</p>
        </div>
      </div>

      <div className="detail-photos">
        {business.image1Url && (
          <img src={business.image1Url} alt="Photo 1" />
        )}
        {business.image2Url && (
          <img src={business.image2Url} alt="Photo 2" />
        )}
      </div>

      <div className="detail-actions">
        <Link to="/dashboard" className="btn btn-outline">
          ← Back to search
        </Link>
      </div>
    </div>
  )
}
