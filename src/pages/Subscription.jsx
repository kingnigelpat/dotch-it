import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CAMPAIGN_PACKAGES } from '../services/adService'
import { useAuth } from '../context/AuthContext'
import { BANK_DETAILS, getPaymentWhatsAppUrl } from '../config/bankDetails'
import CampaignCreatorModal from '../components/CampaignCreatorModal'

export default function Subscription() {
  const { user, profile } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const generalWhatsAppUrl = getPaymentWhatsAppUrl({
    email: user?.email,
    vendorName: profile?.name,
    planName: 'Campaign Banner Ads',
    planAmount: 'From ₦250',
  })

  return (
    <div className="subscription-page-v2">
      {/* Top Bold Header */}
      <div className="subscription-hero-bold">
        <div className="campaign-glow-pill" style={{ marginBottom: '14px', display: 'inline-flex' }}>
          📢 High-Impact Viral Exposure
        </div>
        <h1 className="subscription-bold-title">
          Scale Your Sales With <span className="hero-gradient-text">Campaign Banner Ads</span>
        </h1>
        <p className="subscription-bold-subtitle">
          Listing your business on Dotch is <strong>100% Free Forever</strong>. Ready to stand out from competitors? Feature your products on the very top homepage carousel starting at just <strong>₦250 for 3 days</strong>.
        </p>
      </div>

      {/* Free Listing Notice */}
      <div className="free-listing-banner-bold">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '28px' }}>🎉</span>
          <div>
            <strong style={{ fontSize: '15.5px', color: 'var(--text-primary)', display: 'block' }}>
              Standard Business Listing is 100% Free Forever
            </strong>
            <p style={{ margin: '2px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Any vendor can create a profile, upload photos, and connect on WhatsApp with zero fees.
            </p>
          </div>
        </div>
        <Link to="/list-business" className="btn btn-outline btn-sm" style={{ fontWeight: 800 }}>
          List Business Free →
        </Link>
      </div>

      {/* Bold Campaign Pricing Grid */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Choose Your Ad Campaign Package
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Transparent micro-campaign pricing designed for high returns for Nigerian brands and merchants:
        </p>
      </div>

      <div className="plans-grid-bold">
        {CAMPAIGN_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`plan-card-bold ${pkg.highlight ? 'featured-plan' : ''}`}
          >
            {pkg.badge && (
              <div className="plan-bold-badge">{pkg.badge}</div>
            )}
            <div className="plan-card-bold-head">
              <h3 className="plan-card-bold-name">{pkg.name}</h3>
              <div className="plan-card-bold-price-wrap">
                <span className="plan-card-bold-price">{pkg.formattedPrice}</span>
                <span className="plan-card-bold-interval">{pkg.interval}</span>
              </div>
            </div>

            <p className="plan-card-bold-desc">
              {pkg.description}
            </p>

            <div className="plan-card-bold-divider" />

            <ul className="plan-card-bold-features">
              {pkg.features.map((f, i) => (
                <li key={i} className="feature-item-bold">
                  <span className="feature-check-bold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`btn ${pkg.highlight ? 'btn-primary' : 'btn-outline'} btn-block btn-lg btn-plan-action`}
              onClick={() => setIsModalOpen(true)}
            >
              🚀 Launch Campaign ({pkg.formattedPrice})
            </button>
          </div>
        ))}
      </div>

      {/* WhatsApp Payment & Account Details Callout (No typed account number) */}
      <div className="campaign-wa-support-card">
        <div className="wa-support-icon">
          <i className="fa-brands fa-whatsapp" />
        </div>
        <div className="wa-support-content">
          <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Message Admin on WhatsApp for Official Account Details
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
            For direct bank transfer payments and instant campaign activation, message Admin directly on WhatsApp at <strong>{BANK_DETAILS.formattedAdminWhatsApp}</strong> to get the verified account number.
          </p>
          <a
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fa-brands fa-whatsapp" /> Chat Admin on WhatsApp ({BANK_DETAILS.formattedAdminWhatsApp})
          </a>
        </div>
      </div>

      <CampaignCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={user}
        userProfile={profile}
      />
    </div>
  )
}
