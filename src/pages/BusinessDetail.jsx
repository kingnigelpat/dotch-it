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

  if (loading) return <div className="center-loading">Loading business profile…</div>

  if (notFound || !business) {
    return (
      <div className="empty-state-box">
        <div className="empty-state-icon">🏢</div>
        <h2 className="empty-state-title">Business profile not found</h2>
        <p className="empty-state-subtitle">
          The requested business listing may have been moved or removed.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Search Engine
        </Link>
      </div>
    )
  }

  const rawPhone = business.phone ? business.phone.replace(/[^0-9]/g, '') : '2348012345678'
  const customMessage = encodeURIComponent(
    `Hi ${business.name}! I found your listing on Dotch and would like to inquire about your products/services.`
  )
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${customMessage}`

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/dashboard" className="btn btn-ghost btn-sm">
          ← Back to search results
        </Link>
      </div>

      <div className="profile-detail">
        <div className="profile-hero-banner" />

        <div className="profile-header-content">
          <div className="profile-logo-wrapper">
            <img
              src={business.logoUrl || '/logo-placeholder.svg'}
              alt={business.name}
              className="profile-logo"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="profile-main-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="result-category">{business.category || 'Local Business'}</span>
              {business.verified && <span className="badge-verified">✓ Verified Business</span>}
            </div>
            <h1>{business.name}</h1>

            <div className="profile-meta-bar">
              <span>📍 {business.location || business.city || 'Lagos'}</span>
              <span>⭐ {business.rating || '4.9'} Rating</span>
              {business.price && (
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  {business.price}
                </span>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>About {business.name}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>
              {business.description || 'Verified local business. Contact directly via WhatsApp or phone for orders, pricing, and inquiries.'}
            </p>
          </div>
        </div>

        {(business.image1Url || business.image2Url) && (
          <div className="profile-gallery">
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Products & Services Gallery</h3>
            <div className="gallery-grid">
              {business.image1Url && (
                <img
                  src={business.image1Url}
                  alt="Product 1"
                  className="gallery-img"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              {business.image2Url && (
                <img
                  src={business.image2Url}
                  alt="Product 2"
                  className="gallery-img"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Direct Contact Bar */}
      <div className="sticky-mobile-contact-bar">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp btn-block btn-lg"
        >
          💬 Chat with {business.name} on WhatsApp
        </a>
      </div>
    </div>
  )
}
