import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateUserProfile } from '../services/authService'
import { getBusinessByOwner, updateBusiness } from '../services/businessService'
import { formatTo234, displayFormattedPhone } from '../utils/phoneUtils'
import PhoneInput from '../components/PhoneInput'

export default function Account() {
  const { user, profile, logout, refreshProfile, reloadUser, sendVerification } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const [business, setBusiness] = useState(null)
  const [loadingBiz, setLoadingBiz] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneVal, setPhoneVal] = useState(profile?.phone || '')
  const [savingPhone, setSavingPhone] = useState(false)
  const [phoneMessage, setPhoneMessage] = useState('')

  const [verifySent, setVerifySent] = useState(false)
  const [checkingVerify, setCheckingVerify] = useState(false)

  const isBusiness = profile?.role === 'vendor' || profile?.role === 'business'
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (user?.uid && isBusiness) {
      setLoadingBiz(true)
      getBusinessByOwner(user.uid)
        .then((b) => {
          setBusiness(b)
          if (b?.phone && !phoneVal) {
            setPhoneVal(b.phone)
          }
        })
        .catch((err) => console.warn('Could not load user business in account:', err))
        .finally(() => setLoadingBiz(false))
    }
  }, [user?.uid, isBusiness])

  useEffect(() => {
    if (profile?.phone) {
      setPhoneVal(profile.phone)
    }
  }, [profile?.phone])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleSavePhone = async (e) => {
    e.preventDefault()
    setSavingPhone(true)
    setPhoneMessage('')
    try {
      const formatted = formatTo234(phoneVal)

      // 1. Update user profile
      await updateUserProfile(user.uid, { phone: formatted })

      // 2. If vendor / business owner has a business listing, update its phone too!
      let targetBiz = business
      if (!targetBiz && user?.uid) {
        try {
          targetBiz = await getBusinessByOwner(user.uid)
        } catch (bizErr) {
          console.warn('Could not fetch owner business during phone update:', bizErr)
        }
      }
      if (targetBiz?.id) {
        await updateBusiness(targetBiz.id, { phone: formatted })
        setBusiness((prev) => (prev ? { ...prev, phone: formatted } : { ...targetBiz, phone: formatted }))
      }

      // 3. Immediately refresh auth profile in context & local state
      if (refreshProfile) {
        await refreshProfile({ phone: formatted })
      }
      setPhoneVal(formatted)
      setEditingPhone(false)
      setPhoneMessage('Phone number and business WhatsApp contact updated successfully.')
      showSuccess('Phone number and WhatsApp contact updated successfully.')
      setTimeout(() => setPhoneMessage(''), 4000)
    } catch (err) {
      console.error('Failed to update phone number:', err)
      setPhoneMessage('Failed to update phone number.')
      showError('Failed to update phone number.')
    } finally {
      setSavingPhone(false)
    }
  }

  const handleSendVerification = async () => {
    try {
      await sendVerification()
      setVerifySent(true)
      showSuccess('Verification email sent! Please check your inbox.')
    } catch (err) {
      console.error('Could not send verification email:', err)
      showError('Could not send verification email — please try again.')
    }
  }

  const handleCheckVerification = async () => {
    setCheckingVerify(true)
    try {
      await reloadUser()
    } finally {
      setCheckingVerify(false)
    }
  }

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-card">
          <div className="account-hero-icon">👤</div>
          <h2>Profile & Settings</h2>
          <p className="account-subtitle">
            Log in or create a free account to view your settings, search local stores, or list your business.
          </p>
          <div className="account-auth-buttons">
            <Link to="/login?redirect=/account" className="btn btn-primary btn-block">
              Log in
            </Link>
            <Link to="/register" className="btn btn-outline btn-block">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isEmailVerified = Boolean(user.emailVerified)
  const isPaymentApproved = profile?.paymentStatus === 'approved' || profile?.paymentApproved === true || isAdmin
  const isPaymentPending = profile?.paymentStatus === 'pending' && !isPaymentApproved

  return (
    <div className="account-page">
      <div className="account-card">
        {/* User Header */}
        <div className="account-header">
          <div className={`account-avatar ${isBusiness ? 'vendor-avatar' : ''}`}>
            {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="account-user-info">
            <h1 className="account-name" style={{ fontSize: '22px', margin: 0 }}>
              {profile?.name || 'Explorer'}
            </h1>
            <p className="account-email">{user.email}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              <span className={`badge-pill ${isAdmin ? 'admin-badge' : isBusiness ? 'vendor-badge' : 'explorer-badge'}`}>
                {isAdmin ? '🛡️ Admin Account' : isBusiness ? '💼 Business Account' : '🔎 Explorer Account'}
              </span>
              <span
                className="badge-pill"
                style={{
                  background: isEmailVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: isEmailVerified ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                {isEmailVerified ? '✓ Email Verified' : '⚠️ Email Unverified'}
              </span>
            </div>
          </div>
        </div>

        {/* Email Verification Action Banner if Unverified */}
        {!isEmailVerified && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>✉️</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                Your email address <strong>{user.email}</strong> is not yet verified.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleSendVerification}
                disabled={verifySent}
                style={{ fontSize: '12px' }}
              >
                {verifySent ? '✓ Verification Email Sent' : 'Send Verification Email'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleCheckVerification}
                disabled={checkingVerify}
                style={{ fontSize: '12px' }}
              >
                {checkingVerify ? 'Checking…' : '🔄 Refresh Status'}
              </button>
            </div>
          </div>
        )}

        <hr className="account-divider" />

        {/* SECTION 1: ACCOUNT DETAILS */}
        <div className="account-section">
          <h2 className="account-section-title" style={{ fontSize: '16px', marginBottom: '12px' }}>
            Account Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="account-detail-row">
              <span className="account-detail-label">Full Name</span>
              <strong className="account-detail-val">{profile?.name || 'Not provided'}</strong>
            </div>

            <div className="account-detail-row">
              <span className="account-detail-label">Email Address</span>
              <strong className="account-detail-val">{user.email}</strong>
            </div>

            <div className="account-detail-row">
              <span className="account-detail-label">Phone Number</span>
              {!editingPhone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong className="account-detail-val">
                    {displayFormattedPhone(profile?.phone || phoneVal) || 'Not provided'}
                  </strong>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditingPhone(true)}
                    style={{ fontSize: '12px', padding: '2px 6px' }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSavePhone} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '380px', marginTop: '6px' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <PhoneInput
                      value={phoneVal}
                      onChange={(val) => setPhoneVal(val)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={savingPhone}>
                      {savingPhone ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingPhone(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            {phoneMessage && (
              <p style={{ fontSize: '12px', color: 'var(--brand-primary)', margin: 0 }}>
                {phoneMessage}
              </p>
            )}

            <div className="account-detail-row">
              <span className="account-detail-label">Account Type</span>
              <strong className="account-detail-val" style={{ textTransform: 'capitalize' }}>
                {isBusiness ? 'Business / Vendor' : 'Explorer (Free Search & Discovery)'}
              </strong>
            </div>
          </div>
        </div>

        <hr className="account-divider" />

        {/* SECTION 2: FOR EXPLORERS — OPTION TO BECOME A LISTED BUSINESS */}
        {!isBusiness && (
          <div className="account-section">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%)',
                border: '1.5px solid rgba(37, 99, 235, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🏪</span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    List Your Business on Dotch
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Grow your store, restaurant, hotel, or service with direct customer WhatsApp inquiries.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <Link to="/list-business" className="btn btn-primary btn-block">
                  ✨ Become a Listed Business / View Benefits →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: FOR BUSINESS USERS — BUSINESS INFORMATION & SETTINGS */}
        {isBusiness && (
          <div className="account-section">
            <h2 className="account-section-title" style={{ fontSize: '16px', marginBottom: '12px' }}>
              Business Profile & Status
            </h2>

            {loadingBiz ? (
              <div className="center-loading" style={{ padding: '16px' }}>Loading business info…</div>
            ) : business ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="account-detail-row">
                  <span className="account-detail-label">Business Name</span>
                  <strong className="account-detail-val">{business.name}</strong>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Category</span>
                  <strong className="account-detail-val">{business.category || 'General'}</strong>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Location</span>
                  <strong className="account-detail-val">{business.location || business.city || 'Lagos'}</strong>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Listing WhatsApp Line</span>
                  <strong className="account-detail-val" style={{ color: 'var(--brand-primary)' }}>
                    <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '4px' }} />
                    {displayFormattedPhone(business.phone) || 'Not set'}
                  </strong>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Listing Status</span>
                  <span
                    className="badge-pill"
                    style={{
                      background: isPaymentApproved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      color: isPaymentApproved ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                      fontWeight: 800,
                    }}
                  >
                    {isPaymentApproved ? '● Active & Approved' : isPaymentPending ? '⏳ Pending Verification' : '⚠️ Unpaid'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <Link to="/business/setup" className="btn btn-outline btn-sm">
                    ✏️ Edit Business Profile
                  </Link>
                  <Link to={`/business/${business.id}`} className="btn btn-ghost btn-sm">
                    👁️ View Live Profile
                  </Link>
                  <Link to="/business" className="btn btn-primary btn-sm">
                    📊 Business Portal
                  </Link>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {isPaymentApproved
                    ? "Your payment is approved! Set up your business profile now to start receiving WhatsApp leads."
                    : "Your business account is registered. Finish setting up your business profile to proceed with activation."}
                </p>
                <Link to="/business/setup" className="btn btn-primary btn-sm">
                  ✨ Set Up Business Profile
                </Link>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <>
            <hr className="account-divider" />
            <div className="account-section">
              <h2 className="account-section-title" style={{ fontSize: '16px', marginBottom: '8px' }}>
                Administrator Tools
              </h2>
              <Link to="/admin" className="btn btn-outline btn-block" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                🛡️ Open Admin Panel (Verify Payments & Approvals)
              </Link>
            </div>
          </>
        )}

        <hr className="account-divider" />

        {/* Logout */}
        <button className="btn btn-danger btn-block" onClick={handleLogout}>
          🚪 Sign out
        </button>
      </div>
    </div>
  )
}
