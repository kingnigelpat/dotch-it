import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getBusinessByOwner, deleteBusiness } from '../services/businessService'
import {
  subscribeToBusinessAnalytics,
  subscribeToRecentEvents,
  formatRelativeTime,
  formatEventType,
} from '../services/analyticsService'
import BusinessCard from '../components/BusinessCard'
import ConfirmDialog from '../components/ConfirmDialog'
import CampaignCreatorModal from '../components/CampaignCreatorModal'
import { getUserAds } from '../services/adService'
import {
  getBusinessVerificationMailtoUrl,
  ADMIN_EMAIL,
  ADMIN_PHONE_DISPLAY,
  ADMIN_TEL_HREF,
  BANK_DETAILS,
} from '../config/bankDetails'

function getProfileStatus(business) {
  const dateStr = business?.updatedAt || business?.createdAt
  if (!dateStr) {
    return {
      badge: '🟢 Profile Active',
      text: 'Your business profile is live and searchable on DOTCH.',
    }
  }

  const updatedDate = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return {
      badge: '🟢 Recently Updated',
      text: 'Your business information was updated today.',
    }
  } else if (diffDays === 1) {
    return {
      badge: '🟢 Recently Updated',
      text: 'Your business information was updated yesterday.',
    }
  } else if (diffDays <= 14) {
    return {
      badge: '🟢 Recently Updated',
      text: `Your business information was updated ${diffDays} days ago.`,
    }
  } else {
    return {
      badge: '✓ Up to Date',
      text: `Last updated ${diffDays} days ago. Keeping your photos and price list fresh helps buyers choose your business.`,
    }
  }
}

export default function BusinessDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const { showSuccess, showError } = useToast()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedShortlink, setCopiedShortlink] = useState(false)

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [userAds, setUserAds] = useState([])

  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    lastInteractionAt: null,
  })
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    if (!user?.uid) return
    getBusinessByOwner(user.uid)
      .then((b) => {
        setBusiness(b)
        if (b) {
          setAnalytics({
            profileViews: Number(b.profileViews) || 0,
            whatsappClicks: Number(b.whatsappClicks) || 0,
            phoneClicks: Number(b.phoneClicks) || 0,
            lastInteractionAt: b.lastInteractionAt || null,
          })
        }
      })
      .finally(() => setLoading(false))

    getUserAds(user.uid)
      .then((ads) => setUserAds(ads || []))
      .catch((e) => console.warn('Could not load user ads:', e))
  }, [user?.uid])

  // Real-time Firestore subscription to analytics & activity events
  useEffect(() => {
    if (!business?.id) return

    const unsubAnalytics = subscribeToBusinessAnalytics(business.id, (data) => {
      setAnalytics((prev) => ({ ...prev, ...data }))
    })

    const unsubEvents = subscribeToRecentEvents(business.id, (events) => {
      setRecentEvents(events)
    }, 6)

    return () => {
      unsubAnalytics()
      unsubEvents()
    }
  }, [business?.id])

  const handleRefreshStatus = async () => {
    setRefreshing(true)
    try {
      await refreshProfile()
      if (user?.uid) {
        const b = await getBusinessByOwner(user.uid)
        setBusiness(b)
      }
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async () => {
    if (!business?.id) return
    setDeleting(true)
    try {
      await deleteBusiness(business.id)
      setBusiness(null)
      setIsConfirmOpen(false)
      showSuccess('Business listing deleted successfully.')
    } catch (err) {
      console.error('Failed to delete business listing:', err)
      showError('Could not delete listing — please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="center-loading">Loading business portal…</div>

  // CASE: NO BUSINESS PROFILE CREATED YET
  if (!business) {
    return (
      <div className="empty-state-box" style={{ maxWidth: '600px', margin: '40px auto', padding: '36px 20px', textAlign: 'center' }}>
        <div className="empty-state-icon"><i className="fa-solid fa-store" style={{ fontSize: '36px', color: 'var(--brand-primary)' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
            🎉 100% Free Forever
          </span>
        </div>
        <h2 className="empty-state-title" style={{ fontSize: '22px', marginBottom: '8px' }}>
          Set Up Your Business Profile
        </h2>
        <p className="empty-state-subtitle" style={{ maxWidth: '440px', margin: '0 auto 24px' }}>
          Welcome, <strong>{profile?.name || user?.email}</strong>! Add your business description, storefront photos, and WhatsApp hotline to get discovered by ready customers.
        </p>
        <Link to="/business/setup" className="btn btn-primary btn-lg" style={{ fontWeight: 800 }}>
          <i className="fa-solid fa-rocket" style={{ marginRight: '5px' }} /> Set Up Free Business Profile
        </Link>
      </div>
    )
  }

  // CASE 3: APPROVED AND ACTIVE BUSINESS
  // NOTE (Requirement 11): Hide pricing after successful payment! Do not repeatedly pressure approved customers to pay again.
  const shortUrl = business && typeof window !== 'undefined' ? `${window.location.origin}/b/${business.id}` : ''

  const handleCopyShortlink = async () => {
    if (!shortUrl) return
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopiedShortlink(true)
      showSuccess('Shortlink copied to clipboard!')
      setTimeout(() => setCopiedShortlink(false), 2500)
    } catch {
      // ignore
    }
  }

  const profileStatus = getProfileStatus(business)

  const [searchParams] = useSearchParams()
  const postedJustNow = searchParams.get('posted') === '72h' || searchParams.get('posted') === 'verify_email'

  const getRemainingHours = () => {
    if (!business?.verificationDeadline && !business?.createdAt) return 72
    const target = business?.verificationDeadline
      ? new Date(business.verificationDeadline).getTime()
      : new Date(business.createdAt).getTime() + 72 * 60 * 60 * 1000
    const diffHours = Math.max(0, Math.round((target - Date.now()) / (1000 * 60 * 60)))
    return diffHours
  }

  const remainingHours = getRemainingHours()
  const emailCertUrl = getBusinessVerificationMailtoUrl({
    businessName: business.name,
    email: user?.email,
    phone: business.phone,
  })

  return (
    <div className="business-dashboard">
      {/* Success Alert if just posted */}
      {postedJustNow && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px' }}>🎉</span>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block' }}>
              Your business listing is now live on Dotch!
            </strong>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Buyers can now search and find you. To get your official verified badge, email your CAC report or proof of business document to <strong>{ADMIN_EMAIL}</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Header with Status & Actions */}
      <div className="results-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '12px' }}>
              <i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '4px' }} /> Listing Live & Searchable
            </span>

            {isVerified ? (
              <span className="badge-pill" style={{ background: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-primary)', fontWeight: 800, fontSize: '12px' }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '3px' }} /> Admin Verified
              </span>
            ) : (
              <span className="badge-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', fontWeight: 800, fontSize: '12px' }}>
                <i className="fa-solid fa-file-shield" style={{ marginRight: '4px' }} /> Proof of Business Pending
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Business Dashboard</h1>
          <p className="results-meta">Manage your business profile and presence on Dotch</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/business/setup" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-pen-to-square" style={{ marginRight: '4px' }} /> Edit Profile
          </Link>
          <Link to={`/business/${business.id}`} className="btn btn-primary btn-sm">
            <i className="fa-solid fa-eye" style={{ marginRight: '4px' }} /> View Profile
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={deleting}
          >
            <i className="fa-solid fa-trash-can" style={{ marginRight: '4px' }} /> Delete Listing
          </button>
        </div>
      </div>

      {/* 72-HOUR ADMIN VERIFICATION BANNER */}
      {!isVerified && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(238, 93, 54, 0.04) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 26px',
            marginBottom: '28px',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-pill" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', fontWeight: 800 }}>
                  <i className="fa-solid fa-envelope" style={{ marginRight: '4px' }} /> Proof of Business Verification
                </span>
                <span className="badge-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', fontWeight: 800 }}>
                  Email: {ADMIN_EMAIL}
                </span>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                Send Your Proof of Business to {ADMIN_EMAIL}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.55, margin: '0 0 16px' }}>
                Your business listing for <strong>{business.name}</strong> is live on Dotch! To get your official verified checkmark, simply send your proof of business (either a <strong>CAC report</strong>, registration certificate, or other official business document) via Gmail to <strong>{ADMIN_EMAIL}</strong>.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href={emailCertUrl}
                  className="btn btn-primary btn-lg"
                  style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="fa-solid fa-envelope" style={{ fontSize: '16px' }} />
                  <span>Email Proof to {ADMIN_EMAIL}</span>
                </a>

                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={handleRefreshStatus}
                  disabled={refreshing}
                  style={{ fontWeight: 700 }}
                >
                  {refreshing ? 'Checking status…' : '🔄 Check If Verified'}
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', minWidth: '220px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>📧</div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>Email CAC Proof</strong>
              <small style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Official Verification Mail:<br />
                <strong style={{ color: 'var(--brand-primary)' }}>{ADMIN_EMAIL}</strong>
              </small>
            </div>
          </div>
        </div>
      )}

      {/* CASE B: VERIFIED BUSINESS STATUS CARD */}
      {isVerified && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-emerald)' }}>
                <i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '5px' }} /> Verified Listing Status
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                {business.name} is Live & Discoverable
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', margin: 0, lineHeight: 1.5 }}>
                Your business is verified and active in the Dotch directory across Nigerian cities. Customers can search for your products and services and connect directly on WhatsApp with zero middleman fees.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Location</span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }} /> {business.location || business.city || 'Lagos'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Category:</strong> {business.category || 'General'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>WhatsApp Hotline:</strong> {business.phone ? (<><i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-emerald)', marginRight: '3px' }} /> Connected</>) : 'Not set'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Photo Gallery:</strong> {(business.image1Url || business.image2Url) ? (<><i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-emerald)', marginRight: '3px' }} /> Active</>) : 'No photos added yet'}
            </div>
          </div>
        </div>
      )}

      {/* 1. Your DOTCH Activity (Private to Business Owner) */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            DOTCH Activity
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-lock" style={{ marginRight: '4px' }} /> Private to you
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '10px',
        }}>
          {/* Profile Views */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>👁</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>
              {analytics.profileViews}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              Profile Views
            </div>
          </div>

          {/* WhatsApp Clicks */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>💬</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#25D366', lineHeight: 1 }}>
              {analytics.whatsappClicks}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              WhatsApp Clicks
            </div>
          </div>

          {/* Phone Clicks */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>📞</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-amber, #f59e0b)', lineHeight: 1 }}>
              {analytics.phoneClicks}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              Phone Clicks
            </div>
          </div>

          {/* Last Activity */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>🕒</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, minHeight: '32px', display: 'flex', alignItems: 'center' }}>
              {formatRelativeTime(analytics.lastInteractionAt)}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
              Last Activity
            </div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 12px', lineHeight: 1.4 }}>
          These numbers are based on recorded interactions on DOTCH. Basic throttling is used to reduce duplicate activity.
        </p>

        {/* Lightweight Anonymous Recent Activity Log */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Recent Activity
            </span>
            <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} /> Live Updates
            </span>
          </div>

          {recentEvents.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>
              No activity yet. Recent interactions will appear here in real time as visitors discover your profile.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentEvents.map((evt) => {
                const info = formatEventType(evt.eventType)
                return (
                  <div
                    key={evt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: info.badgeBg,
                        color: info.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                      }}>
                        <i className={info.icon} />
                      </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{info.label}</strong>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Your DOTCH Profile Shortlink & Sharing */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        marginBottom: '28px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          Your DOTCH Profile
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
          Share your verified business profile directly with customers, on your WhatsApp status, or in your social bio:
        </p>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontFamily: 'monospace',
            fontSize: '13.5px',
            color: 'var(--text-primary)',
            fontWeight: 700,
            flex: '1 1 240px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {shortUrl}
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleCopyShortlink}
            style={{ fontWeight: 700 }}
          >
            {copiedShortlink ? '✓ Link Copied' : 'Copy Link'}
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`We are verified on DOTCH! View our photos, price list, and exact location here: ${shortUrl} 📍`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>💬</span> Share to WhatsApp Status
          </a>
        </div>
      </div>

      {/* 3. Profile Status */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        marginBottom: '28px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          Profile Status
        </div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{profileStatus.badge}</span>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
          {profileStatus.text}
        </p>
      </div>

      {/* 4. High-Impact Campaign Banners Booster Card */}
      <div className="campaign-booster-card-bold">
        <div style={{ maxWidth: '540px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="campaign-glow-pill">
              ⚡ Flash Micro-Campaign • ₦250 for 3 Days
            </span>
            <span className="campaign-top-badge">
              🔥 Top Homepage Hero Carousel
            </span>
          </div>
          <h3 className="campaign-booster-title-bold">
            Supercharge Your Inquiries with Campaign Banners
          </h3>
          <p className="campaign-booster-sub-bold">
            Put your brand banner or promotional flyer at the very top of the homepage hero carousel for just <strong>₦250 for 3 days</strong>. Guaranteed top placement to get you hundreds of views and direct WhatsApp chats.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg btn-launch-bold"
          onClick={() => setIsCampaignModalOpen(true)}
        >
          🚀 Launch Campaign Banner (₦250) →
        </button>
      </div>

      {/* Live Search Result Card Preview */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
          Live Directory Preview
        </h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Here is how your verified business appears to customers in search results:
        </p>
        <div style={{ maxWidth: '420px' }}>
          <BusinessCard business={business} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete this business listing?"
        body={`This will permanently remove "${business.name}", including your photos, location, and WhatsApp contact details from Dotch-IT search results. This action cannot be undone.`}
        confirmLabel="Delete listing"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => !deleting && setIsConfirmOpen(false)}
        isLoading={deleting}
      />

      <CampaignCreatorModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        currentUser={user}
        userProfile={profile}
        business={business}
        onSuccess={(newAd) => setUserAds((prev) => [newAd, ...prev])}
      />
    </div>
  )
}

