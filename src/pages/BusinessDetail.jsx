import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBusiness } from '../services/businessService'

export default function BusinessDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activePhoto, setActivePhoto] = useState(null)
  const [copiedPhone, setCopiedPhone] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setNotFound(true)
      return
    }
    getBusiness(id)
      .then((b) => {
        if (b) {
          setBusiness(b)
          // Track recently viewed in localStorage for the discovery dashboard
          try {
            const raw = localStorage.getItem('dotch_recently_viewed')
            const list = raw ? JSON.parse(raw) : []
            const filtered = list.filter((item) => item.id !== b.id)
            filtered.unshift(b)
            localStorage.setItem('dotch_recently_viewed', JSON.stringify(filtered.slice(0, 10)))
          } catch {
            // ignore localStorage quota errors
          }
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="center-loading">Loading business profile…</div>

  if (notFound || !business) {
    return (
      <div className="empty-state-box" style={{ maxWidth: '540px', margin: '60px auto', padding: '40px 24px' }}>
        <div className="empty-state-icon">🏢</div>
        <h2 className="empty-state-title">Business Listing Not Found</h2>
        <p className="empty-state-subtitle">
          The requested business profile may have been removed or updated.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          ← Back to Search Engine
        </Link>
      </div>
    )
  }

  const rawPhone = business.phone ? business.phone.replace(/[^0-9]/g, '') : '2348012345678'
  const customMessage = encodeURIComponent(
    `Hello ${business.name}! I found your business on Dotch and would like to inquire about your products/services.`
  )
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${customMessage}`

  const handleCopyPhone = async () => {
    if (!business.phone) return
    try {
      await navigator.clipboard.writeText(business.phone)
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    } catch {
      // ignore
    }
  }

  const galleryImages = [
    business.image1Url,
    business.image2Url,
  ].filter(Boolean)

  return (
    <div className="business-detail-page" style={{ paddingBottom: '90px' }}>
      {/* Top Breadcrumb & Clear Back Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <Link to="/dashboard" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span>←</span>
          <span>Back to Search</span>
        </Link>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Directory ID: {business.id?.slice(0, 12)}
        </span>
      </div>

      {/* Main Profile Card Container */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Visual Hero Header */}
        <div
          style={{
            height: '180px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <span
              className="badge-pill"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '12px',
              }}
            >
              📍 {business.location || business.city || 'Nigeria'}
            </span>
            <span
              className="badge-pill"
              style={{
                background: 'rgba(16, 185, 129, 0.9)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              ● Available
            </span>
          </div>
        </div>

        {/* Business Header & Primary Content */}
        <div style={{ padding: '24px', position: 'relative' }}>
          {/* Logo & Headline Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '-64px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
              <img
                src={business.logoUrl || '/icon-logo.png'}
                alt={business.name}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  border: '4px solid var(--bg-surface)',
                  background: 'var(--bg-surface)',
                  boxShadow: 'var(--shadow-md)',
                }}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop'
                }}
              />
              <div style={{ paddingBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span className="result-category">{business.category || 'Local Business'}</span>
                  {business.verified && (
                    <span className="badge-verified" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                      ✓ Verified Listing
                    </span>
                  )}
                  {business.subscriptionTier === 'pro_2m' && (
                    <span className="badge-vip" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                      🔥 Featured Top Match
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {business.name}
                </h1>
              </div>
            </div>

            {/* Direct Contact Actions Header (Desktop) */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '48px' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
              >
                <span>💬</span>
                <span>Chat on WhatsApp</span>
              </a>

              {business.phone && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCopyPhone}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px' }}
                  title="Copy telephone number"
                >
                  <span>📞</span>
                  <span>{copiedPhone ? '✓ Copied' : 'Call / Copy Phone'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Quick Info Strip */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              padding: '14px 18px',
              background: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
              <span>📍</span>
              <strong style={{ color: 'var(--text-primary)' }}>Location:</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{business.location || business.city || 'Lagos'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
              <span>⭐</span>
              <strong style={{ color: 'var(--text-primary)' }}>Rating:</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{business.rating || '4.9'} (Verified Directory Score)</span>
            </div>

            {business.price && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
                <span>🏷️</span>
                <strong style={{ color: 'var(--text-primary)' }}>Price Range:</strong>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{business.price}</span>
              </div>
            )}
          </div>

          {/* About & Description Section */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              About {business.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px', whiteSpace: 'pre-line' }}>
              {business.description || 'Verified local business. Contact directly via WhatsApp for inquiries, service appointments, pricing, or directions.'}
            </p>
          </div>

          {/* Products, Facility & Place Photos Gallery */}
          {galleryImages.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Photos & Facility Showcase
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '14px',
                }}
              >
                {galleryImages.map((src, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhoto(src)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      height: '200px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <img
                      src={src}
                      alt={`Photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s ease' }}
                      onError={(e) => (e.currentTarget.parentElement.style.display = 'none')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Direct Connection Notice */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>💬</span>
            <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              <strong>Direct WhatsApp Connection:</strong> Tap <em>Chat on WhatsApp</em> to communicate directly with {business.name}. Dotch takes zero middlemen fees or commissions on your transactions.
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Enlarged Photo Modal */}
      {activePhoto && (
        <div
          className="modal-overlay"
          onClick={() => setActivePhoto(null)}
          style={{ zIndex: 1200 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', padding: '16px', textAlign: 'center', background: '#000' }}
          >
            <img
              src={activePhoto}
              alt="Enlarged view"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setActivePhoto(null)}
              style={{ marginTop: '12px', color: '#fff', borderColor: '#444' }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Sticky Mobile Direct Contact Bar */}
      <div className="sticky-mobile-contact-bar">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp btn-block btn-lg"
          style={{ fontWeight: 800 }}
        >
          💬 Chat on WhatsApp
        </a>
      </div>
    </div>
  )
}
