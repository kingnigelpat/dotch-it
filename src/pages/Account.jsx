import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateUserProfile, resetPassword } from '../services/authService'
import { getBusinessByOwner, updateBusiness } from '../services/businessService'
import { getUserAds, CAMPAIGN_PACKAGES } from '../services/adService'
import { formatTo234, displayFormattedPhone } from '../utils/phoneUtils'
import { BANK_DETAILS, getPaymentWhatsAppUrl, getBusinessVerificationMailtoUrl, ADMIN_EMAIL } from '../config/bankDetails'
import PhoneInput from '../components/PhoneInput'
import CampaignCreatorModal from '../components/CampaignCreatorModal'

export default function Account() {
  const { user, profile, logout, refreshProfile, reloadUser, sendVerification, theme, toggleTheme } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  // Tab navigation: 'profile' | 'business' | 'ads' | 'security'
  const [activeTab, setActiveTab] = useState('profile')

  const [business, setBusiness] = useState(null)
  const [loadingBiz, setLoadingBiz] = useState(false)
  const [userAds, setUserAds] = useState([])
  const [loadingAds, setLoadingAds] = useState(false)

  // Profile fields editing
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(profile?.name || '')
  const [savingName, setSavingName] = useState(false)

  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneVal, setPhoneVal] = useState(profile?.phone || '')
  const [savingPhone, setSavingPhone] = useState(false)

  // Email verification & password reset states
  const [verifySent, setVerifySent] = useState(false)
  const [checkingVerify, setCheckingVerify] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)

  // Campaign Ad modal
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)

  const isBusiness = profile?.role === 'vendor' || profile?.role === 'business'
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (profile?.name) setNameVal(profile.name)
    if (profile?.phone) setPhoneVal(profile.phone)
  }, [profile])

  // Load business info if vendor
  useEffect(() => {
    if (user?.uid) {
      if (isBusiness) {
        setLoadingBiz(true)
        getBusinessByOwner(user.uid)
          .then((b) => {
            setBusiness(b)
            if (b?.phone && !phoneVal) setPhoneVal(b.phone)
          })
          .catch((err) => console.warn('Could not load user business in account:', err))
          .finally(() => setLoadingBiz(false))
      }

      // Load user ad campaigns
      setLoadingAds(true)
      getUserAds(user.uid)
        .then((ads) => setUserAds(ads || []))
        .catch((err) => console.warn('Could not load user ads:', err))
        .finally(() => setLoadingAds(false))
    }
  }, [user?.uid, isBusiness])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleSaveName = async (e) => {
    e.preventDefault()
    if (!nameVal.trim()) return
    setSavingName(true)
    try {
      await updateUserProfile(user.uid, { name: nameVal.trim() })
      if (refreshProfile) await refreshProfile({ name: nameVal.trim() })
      setEditingName(false)
      showSuccess('Profile name updated!')
    } catch (err) {
      showError('Failed to update name: ' + (err.message || 'Error'))
    } finally {
      setSavingName(false)
    }
  }

  const handleSavePhone = async (e) => {
    e.preventDefault()
    setSavingPhone(true)
    try {
      const formatted = formatTo234(phoneVal)
      await updateUserProfile(user.uid, { phone: formatted })

      if (business?.id) {
        await updateBusiness(business.id, { phone: formatted })
        setBusiness((prev) => (prev ? { ...prev, phone: formatted } : null))
      }

      if (refreshProfile) await refreshProfile({ phone: formatted })
      setPhoneVal(formatted)
      setEditingPhone(false)
      showSuccess('Phone number and WhatsApp contact updated successfully!')
    } catch (err) {
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
    } catch {
      showError('Could not send verification email — please try again.')
    }
  }

  const handleCheckVerification = async () => {
    setCheckingVerify(true)
    try {
      await reloadUser()
      showSuccess('Refreshed email status.')
    } finally {
      setCheckingVerify(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setSendingReset(true)
    try {
      await resetPassword(user.email)
      showSuccess(`Password reset email sent to ${user.email}`)
    } catch (err) {
      showError('Could not send password reset email: ' + (err.message || ''))
    } finally {
      setSendingReset(false)
    }
  }

  const handleCampaignCreated = (newAd) => {
    setUserAds((prev) => [newAd, ...prev])
  }

  if (!user) {
    return (
      <div className="account-page-v2">
        <div className="account-unauth-card">
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>👤</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
            Profile & Settings
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
            Log in or join free to view your account settings, manage your storefront profile, and run high-converting campaign banner ads.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login?redirect=/account" className="btn btn-primary btn-lg" style={{ fontWeight: 800 }}>
              Log In to Account
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ fontWeight: 800 }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page-v2">
      <div className="account-shell">
        {/* TOP PROFILE HERO HEADER */}
        <div className="account-hero-card">
          <div className="account-hero-main">
            <div className={`account-avatar-v2 ${isBusiness ? 'vendor' : ''}`}>
              {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </div>

            <div className="account-hero-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="account-hero-name">
                  {profile?.name || 'Explorer'}
                </h1>
                <span className={`badge-pill ${isAdmin ? 'admin-badge' : isBusiness ? 'vendor-badge' : 'explorer-badge'}`}>
                  {isAdmin ? '🛡️ Administrator' : isBusiness ? '💼 Business Account' : '🔎 Local Explorer'}
                </span>
                <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
                  🎉 100% Free Account
                </span>
              </div>
              <p className="account-hero-email">{user.email}</p>
            </div>
          </div>

          <div className="account-hero-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '6px' }} /> Sign Out
            </button>
          </div>
        </div>

        {/* SETTINGS SEGMENTED TAB NAVIGATION */}
        <div className="account-nav-tabs">
          <button
            type="button"
            className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fa-solid fa-user" /> Profile & Contact
          </button>

          <button
            type="button"
            className={`account-tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            <i className="fa-solid fa-store" /> {isBusiness ? 'My Business' : 'List Business (Free)'}
          </button>

          <button
            type="button"
            className={`account-tab-btn tab-campaign-bold ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            <i className="fa-solid fa-bullhorn" /> Ad Campaigns & Banners
            <span className="tab-pill-highlight">₦250</span>
          </button>

          <button
            type="button"
            className={`account-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fa-solid fa-shield-halved" /> Security & Preferences
          </button>
        </div>

        {/* TAB 1: PROFILE & CONTACT */}
        {activeTab === 'profile' && (
          <div className="account-card-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Personal Information & Contact</h2>
                <p className="panel-sub">Manage your display name, contact phone, and account details.</p>
              </div>
            </div>

            <div className="settings-fields-stack">
              {/* Name Row */}
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-label">Full Name</span>
                  {!editingName ? (
                    <strong className="settings-value">{profile?.name || 'Not provided'}</strong>
                  ) : (
                    <form onSubmit={handleSaveName} className="settings-inline-form">
                      <input
                        type="text"
                        className="form-control"
                        value={nameVal}
                        onChange={(e) => setNameVal(e.target.value)}
                        placeholder="Enter your full name"
                        autoFocus
                        required
                      />
                      <button type="submit" className="btn btn-primary btn-sm" disabled={savingName}>
                        {savingName ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingName(false)}>
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
                {!editingName && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingName(true)}>
                    <i className="fa-solid fa-pen" style={{ marginRight: '4px' }} /> Edit
                  </button>
                )}
              </div>

              {/* Email Row */}
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-label">Email Address</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong className="settings-value">{user.email}</strong>
                    <span
                      className="badge-pill"
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--accent-emerald)',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Active Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone / WhatsApp Row */}
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-label">WhatsApp Contact Hotline</span>
                  {!editingPhone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong className="settings-value" style={{ color: 'var(--brand-primary)' }}>
                        <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '5px' }} />
                        {displayFormattedPhone(profile?.phone || phoneVal) || 'No phone set'}
                      </strong>
                    </div>
                  ) : (
                    <form onSubmit={handleSavePhone} className="settings-inline-form">
                      <div style={{ minWidth: '220px' }}>
                        <PhoneInput value={phoneVal} onChange={setPhoneVal} required />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={savingPhone}>
                        {savingPhone ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingPhone(false)}>
                        Cancel
                      </button>
                    </form>
                  )}
                  <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px', display: 'block' }}>
                    Buyers will use this number to contact you on WhatsApp.
                  </small>
                </div>
                {!editingPhone && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingPhone(true)}>
                    <i className="fa-solid fa-pen" style={{ marginRight: '4px' }} /> Edit
                  </button>
                )}
              </div>

              {/* Account Role Row */}
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-label">Account Membership Tier</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <strong className="settings-value">
                      {isBusiness ? 'Listed Business Owner' : 'Explorer (Free Search & Discovery)'}
                    </strong>
                    <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
                      Free Forever
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY BUSINESS / STOREFRONT */}
        {activeTab === 'business' && (
          <div className="account-card-panel">
            {isBusiness ? (
              <>
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">My Business Listing</h2>
                    <p className="panel-sub">Manage your public storefront profile, location, and photos.</p>
                  </div>
                  <Link to="/business" className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
                    📊 Open Business Dashboard
                  </Link>
                </div>

                {loadingBiz ? (
                  <div className="center-loading" style={{ padding: '32px' }}>Loading business information…</div>
                ) : business ? (
                  <div className="settings-biz-preview-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      {business.logoUrl ? (
                        <img
                          src={business.logoUrl}
                          alt={business.name}
                          style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                        />
                      ) : (
                        <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'var(--brand-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                          🏪
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                            {business.name}
                          </h3>
                          {business.verified && business.status === 'active' ? (
                            <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
                              <i className="fa-solid fa-circle-check" style={{ marginRight: '3px' }} /> Certificate Verified
                            </span>
                          ) : (
                            <span className="badge-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', fontWeight: 800 }}>
                              <i className="fa-solid fa-hourglass-half" style={{ marginRight: '3px' }} /> Pending CAC Certificate
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                          {business.category || 'General'} • {business.location || business.city || 'Nigeria'}
                        </p>
                        {business.phone && (
                          <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--brand-primary)', fontWeight: 600 }}>
                            <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '4px' }} />
                            {displayFormattedPhone(business.phone)}
                          </div>
                        )}
                        {(!business.verified || business.status === 'pending') && (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href={getBusinessVerificationMailtoUrl({
                                businessName: business.name,
                                email: user.email,
                                phone: business.phone,
                              })}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: 800, fontSize: '12px' }}
                            >
                              <i className="fa-solid fa-envelope" style={{ marginRight: '5px' }} /> Email CAC Proof to {ADMIN_EMAIL}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                      <Link to="/business/setup" className="btn btn-outline btn-sm">
                        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '5px' }} /> Edit Store Details & Photos
                      </Link>
                      <Link to={`/business/${business.id}`} className="btn btn-ghost btn-sm">
                        <i className="fa-solid fa-eye" style={{ marginRight: '5px' }} /> View Store Profile
                      </Link>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm btn-bold-glow"
                        onClick={() => setIsCampaignModalOpen(true)}
                        style={{ marginLeft: 'auto', fontWeight: 800 }}
                      >
                        🚀 Boost with Campaign Banner (₦250)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="settings-empty-state">
                    <span style={{ fontSize: '36px' }}>🏪</span>
                    <h3>Set Up Your Free Business Profile</h3>
                    <p>You have a vendor account! Finish adding your business photos and WhatsApp number to get indexed in search results.</p>
                    <Link to="/business/setup" className="btn btn-primary" style={{ fontWeight: 800 }}>
                      ✨ Create Business Profile Now (100% Free)
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* For Explorer accounts: Show Free Business Listing Upgrade Card */
              <div className="settings-upgrade-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🏪</span>
                  <div>
                    <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
                      🎉 100% Free Forever
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                      List Your Business on Dotch Free
                    </h2>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, maxWidth: '600px' }}>
                  Turn your shop, food spot, tech brand, or freelance service into a verified listed brand. Connect directly with buyers searching across your city with zero commission.
                </p>

                <div className="settings-benefits-list">
                  <div className="benefit-item">✓ Zero registration fees or monthly charges</div>
                  <div className="benefit-item">✓ Upload storefront & product photos</div>
                  <div className="benefit-item">✓ Direct WhatsApp hotline linking</div>
                  <div className="benefit-item">✓ Indexed on local neighborhood map search</div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <Link to="/business/setup" className="btn btn-primary btn-lg" style={{ fontWeight: 800 }}>
                    ✨ Set Up Business Profile Free →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BOLD AD CAMPAIGNS & BANNERS */}
        {activeTab === 'ads' && (
          <div className="account-card-panel bold-campaign-panel">
            <div className="panel-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="campaign-glow-pill">
                    ⚡ Micro-Ad Pricing • ₦250 / 3 Days
                  </span>
                  <span className="campaign-top-badge">
                    High Conversion Spotlight
                  </span>
                </div>
                <h2 className="panel-title bold-title-gradient">Sponsored Campaign Banners</h2>
                <p className="panel-sub">
                  Maximize your sales with prime top hero carousel banners and featured flyer spotlights.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-launch-bold"
                onClick={() => setIsCampaignModalOpen(true)}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: '5px' }} /> Launch New Banner (₦250)
              </button>
            </div>

            {/* Campaign Pricing Cards Showcase — BOLD STYLING */}
            <div className="campaign-packages-showcase-bold">
              {CAMPAIGN_PACKAGES.map((pkg) => (
                <div key={pkg.id} className={`campaign-mini-card-bold ${pkg.highlight ? 'featured' : ''}`}>
                  <div className="mini-card-head-bold">
                    <span className="mini-badge-bold">{pkg.badge}</span>
                    <h3 className="mini-name-bold">{pkg.name}</h3>
                    <div className="mini-price-bold">
                      <span className="price-bold-amount">{pkg.formattedPrice}</span>
                      <small className="price-bold-interval">{pkg.interval}</small>
                    </div>
                  </div>
                  <p className="mini-desc-bold">{pkg.description}</p>
                  <button
                    type="button"
                    className={`btn ${pkg.highlight ? 'btn-primary' : 'btn-outline'} btn-sm btn-block btn-select-pkg`}
                    onClick={() => setIsCampaignModalOpen(true)}
                  >
                    Select {pkg.formattedPrice} →
                  </button>
                </div>
              ))}
            </div>

            {/* WhatsApp Admin Payment Contact Banner */}
            <div className="campaign-admin-wa-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '24px', color: '#25D366' }} />
                <div>
                  <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)', display: 'block' }}>
                    Need the official payment account number?
                  </strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Message Admin directly on WhatsApp at <strong>{BANK_DETAILS.formattedAdminWhatsApp}</strong> for account details and rapid verification.
                  </span>
                </div>
              </div>
              <a
                href={getPaymentWhatsAppUrl({ email: user.email, vendorName: profile?.name })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ fontWeight: 800, whiteSpace: 'nowrap' }}
              >
                Chat Admin
              </a>
            </div>

            {/* User Active & Past Campaigns List */}
            <div style={{ marginTop: '36px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Your Campaigns ({userAds.length})
              </h3>

              {loadingAds ? (
                <div className="center-loading" style={{ padding: '24px' }}>Loading your campaigns…</div>
              ) : userAds.length === 0 ? (
                <div className="settings-empty-state-bold">
                  <span style={{ fontSize: '36px' }}>📢</span>
                  <h3>No Active Ad Campaigns Yet</h3>
                  <p>Promote your products or special offers with a campaign banner for just <strong>₦250 for 3 days</strong>.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-launch-bold"
                    onClick={() => setIsCampaignModalOpen(true)}
                  >
                    🚀 Launch ₦250 Flash Campaign
                  </button>
                </div>
              ) : (
                <div className="settings-campaigns-list">
                  {userAds.map((ad) => {
                    const isAdActive = ad.status === 'active' && (!ad.endDate || new Date(ad.endDate) > new Date())
                    return (
                      <div key={ad.id} className="campaign-row-card-bold">
                        <img
                          src={ad.flyerUrl || ad.imageUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&auto=format&fit=crop'}
                          alt={ad.title}
                          className="campaign-row-img-bold"
                        />
                        <div className="campaign-row-body">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 className="campaign-row-title">{ad.title}</h4>
                            <span
                              className="badge-pill"
                              style={{
                                background: isAdActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.15)',
                                color: isAdActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
                                fontWeight: 800,
                                fontSize: '11px',
                              }}
                            >
                              {isAdActive ? '● Active Live' : 'Ended'}
                            </span>
                          </div>
                          <p className="campaign-row-meta">
                            {ad.businessName} • {ad.targetReach || 'Nationwide'}
                            {ad.pricePromo && <> • <strong style={{ color: 'var(--brand-primary)' }}>{ad.pricePromo}</strong></>}
                          </p>
                          <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            Expires: {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Active'}
                          </small>
                        </div>
                        <div className="campaign-row-cta">
                          <a
                            href={`https://wa.me/${String(ad.phone || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            title="Test WhatsApp Inquiry"
                          >
                            <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '4px' }} />
                            Test Link
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & PREFERENCES */}
        {activeTab === 'security' && (
          <div className="account-card-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Preferences & Security</h2>
                <p className="panel-sub">Manage theme options, password reset, and account security.</p>
              </div>
            </div>

            <div className="settings-fields-stack">
              {/* Theme Preference Row */}
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-label">Display Theme</span>
                  <strong className="settings-value">
                    {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </strong>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={toggleTheme}>
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
              </div>

              {/* Password Reset Row */}
              <div className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-label">Account Password</span>
                  <strong className="settings-value">••••••••••••</strong>
                  <small style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                    Send a password reset link to your registered email ({user.email}).
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handlePasswordReset}
                  disabled={sendingReset}
                >
                  {sendingReset ? 'Sending…' : 'Reset Password'}
                </button>
              </div>

              {/* Admin Portal Shortcut if Admin */}
              {isAdmin && (
                <div className="settings-row" style={{ background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="settings-row-info">
                    <span className="settings-label" style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>
                      🛡️ Administrator Control Panel
                    </span>
                    <strong className="settings-value">
                      Manage all verified listings, campaigns, and platform users.
                    </strong>
                  </div>
                  <Link to="/admin" className="btn btn-primary btn-sm">
                    Open Admin Panel
                  </Link>
                </div>
              )}

              {/* Sign Out Row */}
              <div className="settings-row" style={{ borderBottom: 'none', paddingTop: '20px' }}>
                <div className="settings-row-info">
                  <span className="settings-label">Sign Out Session</span>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Log out of your active account session on this device.
                  </p>
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '5px' }} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Banner Creator Modal (₦250 for 3 days) */}
      <CampaignCreatorModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSuccess={handleCampaignCreated}
        currentUser={user}
        userProfile={profile}
        business={business}
      />
    </div>
  )
}
