import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBusinessByOwner, deleteBusiness } from '../services/businessService'
import BusinessCard from '../components/BusinessCard'
import BankTransferCard from '../components/BankTransferCard'

export default function BusinessDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const isApproved = profile?.paymentStatus === 'approved' || profile?.paymentApproved === true || profile?.role === 'admin'

  useEffect(() => {
    getBusinessByOwner(user.uid)
      .then(setBusiness)
      .finally(() => setLoading(false))
  }, [user.uid])

  const handleRefreshStatus = async () => {
    setRefreshing(true)
    try {
      await refreshProfile()
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your business listing? You can recreate it anytime.')) {
      return
    }
    setDeleting(true)
    try {
      await deleteBusiness(business.id)
      setBusiness(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="center-loading">Loading business dashboard…</div>

  // GATE: Posting is unavailable until admin approves payment
  if (!isApproved) {
    const planName = profile?.selectedPlan === 'pro_2m' ? '2 Months Vendor Plan' : '1 Month Vendor Plan'
    const planAmount = profile?.selectedPlan === 'pro_2m' ? '₦7,999' : '₦5,000'

    return (
      <div style={{ maxWidth: '680px', margin: '30px auto', padding: '0 16px' }}>
        <div className="empty-state-box" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
          <span className="badge-pill vendor-badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
            Payment Verification Pending
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Business Listing Locked
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 24px' }}>
            Welcome, <strong>{profile?.name || user.email}</strong>! In accordance with Dotch quality standards, posting your business listing is unlocked once our admin team verifies your payment.
          </p>

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

  // Once payment is approved, check if they have listed their 1 business
  if (!business) {
    return (
      <div className="empty-state-box">
        <div className="empty-state-icon">🏪</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
            ✓ Payment Approved & Verified
          </span>
        </div>
        <h2 className="empty-state-title">You're ready to list your business!</h2>
        <p className="empty-state-subtitle">
          Your payment has been approved by admin. Create your business listing now to start receiving inquiries directly on WhatsApp.
        </p>
        <Link to="/business/setup" className="btn btn-primary btn-lg">
          ✨ Create Business Listing (1 Business)
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="results-header">
        <div>
          <h1 style={{ fontSize: '24px' }}>Business Portal</h1>
          <p className="results-meta">Manage your listing on Dotch</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/subscription" className="btn btn-primary">
            ⚡ Upgrade / Plans
          </Link>
          <Link to="/business/setup" className="btn btn-outline">
            ✏️ Edit Listing
          </Link>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Subscription Tier Banner */}
      <div className="subscription-dashboard-card">
        <div className="sub-dash-left">
          <div className="sub-dash-badge">
            {business.subscriptionTier === 'pro_2m'
              ? '🔥 2 Months Vendor Plan Active (₦7,999)'
              : business.subscriptionTier === 'pro_1m'
              ? '⚡ 1 Month Vendor Plan Active (₦5,000)'
              : '🌱 Free Basic (Name Only)'}
          </div>
          <h2 style={{ fontSize: '18px', margin: '6px 0 4px' }}>
            {business.subscriptionTier === 'pro_2m'
              ? 'Maximum 5x Boost, Place/Product Photos & Location Active'
              : business.subscriptionTier === 'pro_1m'
              ? '3x Search Boost, Place Photos & Location Active'
              : 'Unpaid / Free Tier (No Photos or Phone Allowed)'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {business.subscriptionTier === 'pro_2m'
              ? '2-Month plan active: Priority location discovery, full place/product photo gallery & direct WhatsApp hotline unlocked.'
              : business.subscriptionTier === 'pro_1m'
              ? '1-Month plan active: Location discovery, photo uploads & direct WhatsApp contact enabled for buyers, tourists & researchers.'
              : 'Unpaid tier: Place/product photos, phone numbers and locations are locked by Firebase rules. Upgrade to ₦5k (1 Mo) or ₦7,999 (2 Mos) to unlock.'}
          </p>
        </div>
        <Link to="/subscription" className="btn btn-primary btn-sm">
          {business.subscriptionTier ? 'Manage Subscription →' : '⚡ Upgrade to Paid Plan (from ₦5k) →'}
        </Link>
      </div>

      {/* Analytics Preview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            LISTING STATUS
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            ● Active & Verified
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            SEARCH IMPRESSIONS
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>
            142 <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>this week</span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            CUSTOMER CLICKS
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>
            28 <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>WhatsApp / Contacts</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Live Search Result Card Preview</h3>
      <div style={{ maxWidth: '420px' }}>
        <BusinessCard business={business} />
      </div>
    </div>
  )
}
