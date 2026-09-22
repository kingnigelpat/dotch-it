import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBusiness } from '../services/businessService'
import { formatTo234, normalizeWhatsAppPhone, displayFormattedPhone } from '../utils/phoneUtils'
import { recordBusinessView, recordWhatsAppClick, recordPhoneClick } from '../services/analyticsService'
import { applyBusinessSeo } from '../utils/seoUtils'

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
    let cleanupSeo = () => {}
    getBusiness(id)
      .then((b) => {
        if (b) {
          setBusiness(b)
          // Throttled profile view tracking
          recordBusinessView(b.id)
          // Apply structured SEO JSON-LD & meta tags
          cleanupSeo = applyBusinessSeo(b)

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

    return () => {
      cleanupSeo()
    }
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

  const rawPhone = normalizeWhatsAppPhone(business.phone || '2348012345678')
  const customMessage = encodeURIComponent(
    `Hello ${business.name}! I found your business on Dotch and would like to inquire about your products/services.`
  )
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${customMessage}`

  const handleCopyPhone = async () => {
    if (!business.phone) return
    recordPhoneClick(business.id)
    try {
      await navigator.clipboard.writeText(formatTo234(business.phone))
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
    <div className="business-detail-page purr-container" style={{ paddingBottom: '90px', paddingTop: '10px' }}>
      {/* Top App Bar Navigation (Inspo Screen 3) */}
      <div className="purr-topbar">
        <button
          type="button"
          className="purr-circle-btn"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <i className="fa-solid fa-chevron-left" />
        </button>

        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {business.category || 'Place Details'}
        </span>

        <button
          type="button"
          className="purr-circle-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: business.name, url: window.location.href })
            } else {
              navigator.clipboard.writeText(window.location.href)
              alert('Profile link copied to clipboard!')
            }
          }}
          title="Share Place"
        >
          <i className="fa-solid fa-arrow-up-from-bracket" />
        </button>
      </div>

      {/* Main Profile Card Container */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Visual Hero Header - Slate Petrol (Inspo Screen 3) */}
        <div
          style={{
            height: '190px',
            background: 'linear-gradient(135deg, #3d5a6c 0%, #2c4352 100%)',
            position: 'relative',
            padding: '16px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <span
              className="filter-pill"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                fontSize: '11.5px',
                padding: '4px 12px',
              }}
            >
              📍 {business.location || business.city || 'Nigeria'}
            </span>
            <span
              className="filter-pill"
              style={{
                background: 'var(--brand-primary)',
                color: '#fff',
                borderColor: 'transparent',
                fontSize: '11.5px',
                padding: '4px 12px',
                fontWeight: 700,
              }}
            >
              ● Open Now
            </span>
          </div>
        </div>

        {/* Business Header & Primary Content */}
        <div style={{ padding: '20px 24px', position: 'relative' }}>
          {/* Logo & Headline Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '-56px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
              <img
                src={business.logoUrl || business.image1Url || '/icon-logo.png'}
                alt={business.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '20px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span className="purr-tag">{business.category || 'Local Place'}</span>
                  {business.verified && (
                    <span className="purr-tag" style={{ background: '#ecfdf5', color: '#059669' }}>
                      ✓ Verified
                    </span>
                  )}
                  {business.rating && (
                    <span className="purr-card-rating">
                      <i className="fa-solid fa-star" /> {business.rating}
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {business.name}
                </h1>
              </div>
            </div>

            {/* Price Pill if specified */}
            {business.price && (
              <div className="floating-badge-price" style={{ position: 'static', padding: '6px 14px', fontSize: '14px' }}>
                🏷️ {business.price}
              </div>
            )}
          </div>

          {/* Squircle Action Buttons Row (Inspo Screen 3: User, Edit/Call, History, Share) */}
          <div className="purr-action-squircle-row">
            {business.phone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordWhatsAppClick(business.id)}
                className="action-squircle-btn btn-wa-squircle"
                title="Chat on WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>
            )}

            {business.phone && (
              <button
                type="button"
                className="action-squircle-btn"
                onClick={handleCopyPhone}
                title="Copy phone number"
              >
                <i className={copiedPhone ? "fa-solid fa-check" : "fa-solid fa-phone"} />
              </button>
            )}

            <button
              type="button"
              className="action-squircle-btn"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: business.name, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied!')
                }
              }}
              title="Share profile"
            >
              <i className="fa-solid fa-arrow-up-from-bracket" />
            </button>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${business.name} ${business.location || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="action-squircle-btn"
              title="Find on Google Maps"
            >
              <i className="fa-solid fa-location-arrow" />
            </a>

            {/* Direct WhatsApp Callout */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordWhatsAppClick(business.id)}
              className="btn-purr-wa"
              style={{ marginLeft: 'auto', padding: '12px 24px', fontSize: '14px', flex: 'initial' }}
            >
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '16px' }} /> Chat on WhatsApp
            </a>
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
              <span style={{ color: 'var(--text-secondary)' }}>
                {business.rating ? `${business.rating} / 5.0` : 'Not yet rated'}
              </span>
            </div>

            {business.price && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
                <span>🏷️</span>
                <strong style={{ color: 'var(--text-primary)' }}>Price Range:</strong>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{business.price}</span>
              </div>
            )}

            {business.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
                <span title="Direct WhatsApp hotline">💬</span>
                <strong style={{ color: 'var(--text-primary)' }}>WhatsApp / Phone:</strong>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Chat directly with vendor on WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }} />
                  {displayFormattedPhone(business.phone)}
                </a>
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
          onClick={() => recordWhatsAppClick(business.id)}
          className="btn btn-whatsapp btn-block btn-lg"
          style={{ fontWeight: 800 }}
        >
          💬 Chat on WhatsApp
        </a>
      </div>
    </div>
  )
}
