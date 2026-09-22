import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import BankTransferCard from '../components/BankTransferCard'
import ConfirmDialog from '../components/ConfirmDialog'

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

  const isApproved = profile?.paymentStatus === 'approved' || profile?.paymentApproved === true || profile?.role === 'admin'

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

  // CASE 1: PAYMENT NOT YET APPROVED
  if (!isApproved) {
    const isOneYear = profile?.selectedPlan === 'pro_1y' || profile?.selectedPlan === 'annual'
    const planName = isOneYear ? '1 Year VIP Vendor Plan' : profile?.selectedPlan === 'pro_2m' ? '2 Months Vendor Plan' : '1 Month Vendor Plan'
    const planAmount = isOneYear ? 'Contact Admin' : profile?.selectedPlan === 'pro_2m' ? '₦7,999' : '₦5,000'

    return (
      <div style={{ maxWidth: '680px', margin: '30px auto', padding: '0 16px' }}>
        <div className="empty-state-box" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}><i className="fa-solid fa-hourglass-half" style={{ color: 'var(--accent-amber, #f59e0b)' }} /></div>
          <span className="badge-pill vendor-badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
            Payment Verification Pending
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Activation In Progress
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 20px' }}>
            Welcome, <strong>{profile?.name || user.email}</strong>! In accordance with Dotch quality standards, your listing is verified once our admin team confirms your payment receipt.
          </p>

          {!business && (
            <div style={{ marginBottom: '24px', padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                You haven't added your business information yet.
              </p>
              <Link to="/business/setup" className="btn btn-outline btn-sm">
                <i className="fa-solid fa-pen-to-square" style={{ marginRight: '5px' }} /> Fill in Business Information & Photos
              </Link>
            </div>
          )}

          <BankTransferCard
            planName={planName}
            planAmount={planAmount}
            userEmail={user.email}
            userName={profile?.name || ''}
            onRefresh={handleRefreshStatus}
            refreshing={refreshing}
            showStatusCheck={true}
          />
        </div>
      </div>
    )
  }

  // CASE 2: PAYMENT APPROVED BUT NO BUSINESS PROFILE CREATED YET
  if (!business) {
    return (
      <div className="empty-state-box" style={{ maxWidth: '600px', margin: '40px auto', padding: '36px 20px' }}>
        <div className="empty-state-icon"><i className="fa-solid fa-store" style={{ fontSize: '32px', color: 'var(--brand-primary)' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }} /> Payment Approved & Verified
          </span>
        </div>
        <h2 className="empty-state-title" style={{ fontSize: '22px', marginBottom: '8px' }}>
          Ready to Publish Your Business
        </h2>
        <p className="empty-state-subtitle" style={{ maxWidth: '440px', margin: '0 auto 24px' }}>
          Your payment is approved! Set up your business profile now to start receiving inquiries directly on WhatsApp.
        </p>
        <Link to="/business/setup" className="btn btn-primary btn-lg">
          <i className="fa-solid fa-rocket" style={{ marginRight: '5px' }} /> Set Up Business Profile Now
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

  return (
    <div className="business-dashboard">
      {/* Header with Approved Status & Actions */}
      <div className="results-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '12px' }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: '3px' }} /> Payment Approved
            </span>
            <span className="badge-pill" style={{ background: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-primary)', fontWeight: 800, fontSize: '12px' }}>
              <i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '4px' }} /> Listing Active
            </span>
          </div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Business Dashboard</h1>
          <p className="results-meta">Manage your business profile and presence on Dotch</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/business/setup" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-pen-to-square" style={{ marginRight: '4px' }} /> Edit Profile
          </Link>
          <Link to={`/business/${business.id}`} className="btn btn-primary btn-sm">
            <i className="fa-solid fa-eye" style={{ marginRight: '4px' }} /> View Live Profile
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

      {/* Business Status & Visibility Overview Card */}
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
              Your business is active in the Dotch directory across Nigerian cities. Customers can search for your products and services and connect directly on WhatsApp with zero middleman fees.
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
    </div>
  )
}

