import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getBusinessByOwner, deleteBusiness } from '../services/businessService'
import BusinessCard from '../components/BusinessCard'
import BankTransferCard from '../components/BankTransferCard'
import ConfirmDialog from '../components/ConfirmDialog'

export default function BusinessDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const { showSuccess, showError } = useToast()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const isApproved = profile?.paymentStatus === 'approved' || profile?.paymentApproved === true || profile?.role === 'admin'

  useEffect(() => {
    if (!user?.uid) return
    getBusinessByOwner(user.uid)
      .then(setBusiness)
      .finally(() => setLoading(false))
  }, [user?.uid])

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
    const planName = profile?.selectedPlan === 'pro_2m' ? '2 Months Vendor Plan' : '1 Month Vendor Plan'
    const planAmount = profile?.selectedPlan === 'pro_2m' ? '₦7,999' : '₦5,000'

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

