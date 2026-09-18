import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getAllBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '../services/businessService'
import {
  getAllVendors,
  approveVendorPayment,
  revokeVendorPayment,
} from '../services/authService'
import { getSuggestedCategories } from '../services/openrouterService'
import { BANK_DETAILS } from '../config/bankDetails'
import {
  getAllAdsAdmin,
  createAd,
  updateAd,
  deleteAd,
} from '../services/adService'
import { uploadImage, fileToBase64 } from '../services/cloudinaryService'
import { formatTo234, displayFormattedPhone } from '../utils/phoneUtils'
import PhoneInput from '../components/PhoneInput'
import ConfirmDialog from '../components/ConfirmDialog'

const EMPTY_AD_FORM = {
  title: '',
  businessName: '',
  businessId: '',
  category: '',
  badge: 'Admin Spotlight',
  placement: 'hero_banner',
  imageUrl: '',
  flyerUrl: '',
  tagline: '',
  phone: '',
  targetReach: 'Nationwide Delivery',
  pricePromo: '',
  ctaText: 'Chat on WhatsApp',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  status: 'active',
}

const EMPTY_FORM = {
  name: '',
  category: '',
  location: '',
  city: '',
  phone: '',
  price: '',
  description: '',
  logoUrl: '',
  image1Url: '',
  image2Url: '',
  featured: false,
  verified: true,
}

const SEED_BUSINESSES = [
  {
    name: 'Eko Grand Hotel & Suites',
    category: 'Hotel & Travel',
    location: 'Victoria Island, Lagos',
    city: 'Lagos',
    phone: '+2348092772700',
    price: '₦45,000 / night',
    description: 'Luxury rooms, ocean view swimming pool, 24/7 power, and high-speed Wi-Fi in the heart of VI.',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&auto=format&fit=crop',
    featured: true,
    verified: true,
  },
  {
    name: 'Naija Spice Kitchen',
    category: 'Restaurant',
    location: 'Wuse 2, Abuja',
    city: 'Abuja',
    phone: '+2347073544811',
    price: '₦2,500 – ₦8,000',
    description: 'Authentic Nigerian delicacies: Jollof rice, pounded yam, seafood okra, pepper soup, and chilled drinks.',
    logoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop',
    featured: true,
    verified: true,
  },
  {
    name: 'Zinox Tech & Phone Repair Hub',
    category: 'Electronics & Tech',
    location: 'Computer Village, Ikeja, Lagos',
    city: 'Lagos',
    phone: '+2349062083582',
    price: 'Free diagnostic check',
    description: 'Same-day iPhone, Samsung, and MacBook screen and board repairs with genuine replacement parts and warranty.',
    logoUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop',
    featured: true,
    verified: true,
  },
]

export default function AdminPanel() {
  const { user, profile, loading } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const categories = getSuggestedCategories()

  const [activeTab, setActiveTab] = useState('vendors') // 'vendors' or 'businesses'
  const [vendors, setVendors] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const [businesses, setBusinesses] = useState([])
  const [loadingBiz, setLoadingBiz] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Advert & Sponsorship states
  const [ads, setAds] = useState([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [adForm, setAdForm] = useState(EMPTY_AD_FORM)
  const [editingAdId, setEditingAdId] = useState(null)
  const [showAdForm, setShowAdForm] = useState(false)
  const [savingAd, setSavingAd] = useState(false)

  // Shared Confirm Dialog state
  const [confirmState, setConfirmState] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const loadVendors = async () => {
    setLoadingVendors(true)
    try {
      const list = await getAllVendors()
      setVendors(list)
    } finally {
      setLoadingVendors(false)
    }
  }

  const loadAds = async () => {
    setLoadingAds(true)
    try {
      const list = await getAllAdsAdmin()
      setAds(list || [])
    } finally {
      setLoadingAds(false)
    }
  }

  useEffect(() => {
    if (profile?.role === 'admin') {
      getAllBusinesses(100).then((list) => {
        setBusinesses(list)
        setLoadingBiz(false)
      })
      loadVendors()
      loadAds()
    }
  }, [profile])

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadImage(file)
      if (res?.url) {
        setForm(prev => ({ ...prev, [fieldName]: res.url }))
        return
      }
    } catch (err) {
      console.warn('Upload error:', err)
    }
    try {
      const b64 = await fileToBase64(file)
      setForm(prev => ({ ...prev, [fieldName]: b64 }))
    } catch (fallbackErr) {
      console.error('Failed to convert file:', fallbackErr)
    }
  }

  const handleApproveVendor = async (v) => {
    setActionLoadingId(v.uid)
    setError('')
    setSuccess('')
    try {
      const planToSet = v.selectedPlan || 'pro_1m'
      await approveVendorPayment(v.uid, planToSet)
      showSuccess(`Payment approved for ${v.name || v.email}! Their listing creation is now unlocked.`)
      await loadVendors()
    } catch (err) {
      console.error('Failed to approve vendor payment:', err)
      showError('Could not approve payment: ' + (err.message || 'Please try again.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRevokeVendor = (v) => {
    setConfirmState({
      title: `Revoke payment approval for ${v.name || v.email}?`,
      body: `This will lock listing creation and revert ${v.name || v.email}'s vendor status to pending. Their business listing will be hidden until re-approved.`,
      confirmLabel: 'Revoke approval',
      onConfirm: async () => {
        setConfirmLoading(true)
        setActionLoadingId(v.uid)
        setError('')
        setSuccess('')
        try {
          await revokeVendorPayment(v.uid)
          showSuccess(`Listing creation locked for ${v.name || v.email}.`)
          setConfirmState(null)
          await loadVendors()
        } catch (err) {
          console.error('Failed to revoke vendor payment:', err)
          showError('Could not revoke payment: ' + (err.message || 'Please try again.'))
        } finally {
          setActionLoadingId(null)
          setConfirmLoading(false)
        }
      },
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleEdit = (biz) => {
    setForm({
      name: biz.name || '',
      category: biz.category || '',
      location: biz.location || '',
      city: biz.city || '',
      phone: biz.phone || '',
      price: biz.price || '',
      description: biz.description || '',
      logoUrl: biz.logoUrl || '',
      image1Url: biz.image1Url || '',
      image2Url: biz.image2Url || '',
      featured: biz.featured || false,
      verified: biz.verified !== false,
    })
    setEditingId(biz.id)
    setShowForm(true)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  // --- Advert Management Handlers ---
  const handleAdFormChange = (e) => {
    const { name, value } = e.target
    setAdForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveAd = async (e) => {
    e.preventDefault()
    if (!adForm.title.trim() || !adForm.businessName.trim()) {
      setError('Please provide at least an advert title and business name.')
      return
    }
    setSavingAd(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        ...adForm,
        phone: formatTo234(adForm.phone),
      }
      if (editingAdId) {
        await updateAd(editingAdId, payload)
        setSuccess('Advert updated successfully!')
      } else {
        await createAd(payload, user?.uid)
        setSuccess('New advert created and published to homepage!')
      }
      setShowAdForm(false)
      setEditingAdId(null)
      setAdForm(EMPTY_AD_FORM)
      await loadAds()
    } catch (err) {
      setError('Could not save advert: ' + err.message)
    } finally {
      setSavingAd(false)
    }
  }

  const handleEditAd = (ad) => {
    setAdForm({
      title: ad.title || '',
      businessName: ad.businessName || '',
      businessId: ad.businessId || '',
      category: ad.category || '',
      badge: ad.badge || 'Admin Spotlight',
      placement: ad.placement || 'hero_banner',
      imageUrl: ad.imageUrl || '',
      flyerUrl: ad.flyerUrl || '',
      tagline: ad.tagline || '',
      phone: ad.phone || '',
      targetReach: ad.targetReach || 'Nationwide Delivery',
      pricePromo: ad.pricePromo || '',
      ctaText: ad.ctaText || 'Chat on WhatsApp',
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      status: ad.status || 'active',
    })
    setEditingAdId(ad.id)
    setShowAdForm(true)
    setError('')
  }

  const handleDeleteAd = (ad) => {
    setConfirmState({
      title: `Delete advert "${ad.title}"?`,
      body: `This will permanently remove this advert spotlight from the homepage and directory. This action cannot be undone.`,
      confirmLabel: 'Delete advert',
      onConfirm: async () => {
        setConfirmLoading(true)
        setError('')
        setSuccess('')
        try {
          await deleteAd(ad.id)
          showSuccess(`Advert "${ad.title}" deleted.`)
          setConfirmState(null)
          await loadAds()
        } catch (err) {
          console.error('Failed to delete advert:', err)
          showError('Could not delete advert: ' + (err.message || 'Please try again.'))
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const handleToggleAdStatus = async (ad) => {
    const nextStatus = ad.status === 'active' ? 'paused' : 'active'
    setError('')
    setSuccess('')
    try {
      await updateAd(ad.id, { status: nextStatus })
      showSuccess(`Status for "${ad.title}" changed to ${nextStatus}.`)
      await loadAds()
    } catch (err) {
      console.error('Failed to toggle advert status:', err)
      showError('Could not toggle status: ' + (err.message || 'Please try again.'))
    }
  }

  const handleAutoFillAdFromBusiness = (bizId) => {
    const biz = businesses.find((b) => b.id === bizId)
    if (!biz) return
    setAdForm((prev) => ({
      ...prev,
      businessId: biz.id,
      businessName: biz.name || prev.businessName,
      category: biz.category || prev.category,
      phone: biz.phone || prev.phone,
      targetReach: biz.city ? `${biz.city} & Nationwide` : prev.targetReach,
      imageUrl: biz.image1Url || biz.image2Url || biz.logoUrl || prev.imageUrl,
      flyerUrl: biz.image1Url || prev.flyerUrl,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Business name is required.')
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const data = {
        name: form.name.trim(),
        category: form.category,
        location: form.location.trim() || form.city.trim() || 'Lagos',
        city: form.city.trim() || form.location.trim() || 'Lagos',
        phone: formatTo234(form.phone),
        price: form.price.trim(),
        description: form.description.trim(),
        logoUrl: form.logoUrl.trim(),
        image1Url: form.image1Url.trim(),
        image2Url: form.image2Url.trim(),
        featured: form.featured,
        verified: form.verified,
        adminAdded: true,
        subscriptionTier: 'pro_2m', // Admin-added businesses get top visibility
        keywords: [
          form.name.trim().toLowerCase(),
          form.category.toLowerCase(),
          form.city.trim().toLowerCase(),
          form.location.trim().toLowerCase(),
        ].filter(Boolean),
      }

      if (editingId) {
        await updateBusiness(editingId, data)
        setBusinesses((prev) => prev.map((b) => b.id === editingId ? { ...b, ...data } : b))
        setSuccess(`"${data.name}" updated successfully.`)
      } else {
        const created = await createBusiness({ uid: user.uid, data })
        setBusinesses((prev) => [created, ...prev])
        setSuccess(`"${data.name}" added and published successfully.`)
      }
      handleReset()
      setShowForm(false)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save business.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (biz) => {
    setConfirmState({
      title: `Delete "${biz.name}"?`,
      body: `This will permanently remove "${biz.name}" along with all photos, description, and contact info from Dotch-IT search results. This action cannot be undone.`,
      confirmLabel: 'Delete business',
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await deleteBusiness(biz.id)
          setBusinesses((prev) => prev.filter((b) => b.id !== biz.id))
          showSuccess(`"${biz.name}" deleted successfully.`)
          setConfirmState(null)
        } catch (err) {
          console.error('Failed to delete business:', err)
          showError('Could not delete business: ' + (err.message || 'Please try again.'))
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  // Quick Post to Homepage — switches to adverts tab with form open
  const handleQuickPostToHomepage = () => {
    setActiveTab('adverts')
    setEditingAdId(null)
    setAdForm(EMPTY_AD_FORM)
    setShowAdForm(true)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  if (loading) return <div className="center-loading">Loading…</div>
  if (!user || profile?.role !== 'admin') return null

  const pendingVendors = vendors.filter(v => v.paymentStatus !== 'approved' && !v.paymentApproved)
  const activeAdsCount = ads.filter(a => a.status === 'active').length

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight: '8px', color: 'var(--brand-primary)' }} /> Admin Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Full control over business listings, vendor approvals, and homepage ads.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleQuickPostToHomepage}
            title="Create a new homepage ad/spotlight"
          >
            <i className="fa-solid fa-plus" style={{ marginRight: '5px' }} /> Post to Homepage
          </button>
          {activeTab === 'businesses' && (
            <button
              className="btn btn-outline"
              onClick={() => { setShowForm(!showForm); if (showForm) handleReset() }}
            >
              {showForm ? (<><i className="fa-solid fa-xmark" style={{ marginRight: '5px' }} /> Cancel</>) : (<><i className="fa-solid fa-plus" style={{ marginRight: '5px' }} /> Add Business</>)}
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-primary)' }}>{businesses.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <i className="fa-solid fa-building" style={{ marginRight: '4px' }} /> Total Businesses
          </div>
        </div>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-amber, #f59e0b)' }}>{pendingVendors.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <i className="fa-solid fa-hourglass-half" style={{ marginRight: '4px' }} /> Pending Approvals
          </div>
        </div>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald, #10b981)' }}>{activeAdsCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <i className="fa-solid fa-bullhorn" style={{ marginRight: '4px' }} /> Active Ads
          </div>
        </div>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{vendors.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <i className="fa-solid fa-users" style={{ marginRight: '4px' }} /> Total Vendors
          </div>
        </div>
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }} />{success}
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} />{error}
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'vendors' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('vendors')}
          style={{ fontWeight: 700 }}
        >
          <i className="fa-solid fa-credit-card" style={{ marginRight: '5px' }} /> Vendor Approvals ({pendingVendors.length} Pending)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'adverts' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('adverts')}
          style={{ fontWeight: 700 }}
        >
          <i className="fa-solid fa-bullhorn" style={{ marginRight: '5px' }} /> Homepage Ads ({ads.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'businesses' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('businesses')}
          style={{ fontWeight: 700 }}
        >
          <i className="fa-solid fa-building" style={{ marginRight: '5px' }} /> Directory Listings ({businesses.length})
        </button>
      </div>

      {/* TAB 1: VENDOR PAYMENT APPROVALS */}
      {activeTab === 'vendors' && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 className="admin-section-title" style={{ margin: 0 }}>
                Vendor Account Approvals
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
                Verify vendor payment transfers. Once approved, the vendor is unlocked to list their 1 business.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={loadVendors}
              disabled={loadingVendors}
            >
              {loadingVendors ? 'Refreshing…' : (<><i className="fa-solid fa-arrows-rotate" style={{ marginRight: '5px' }} /> Refresh Vendors</>)}
            </button>
          </div>

          <div
            style={{
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.28)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                <i className="fa-solid fa-building-columns" style={{ marginRight: '5px' }} /> Active Bank Account for Vendor Payments:
              </span>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {BANK_DETAILS.bankName} • <strong style={{ color: 'var(--brand-primary)', fontFamily: 'monospace' }}>{BANK_DETAILS.accountNumber}</strong> • {BANK_DETAILS.accountName}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Verify transaction alerts in your Paga app before approving
            </span>
          </div>

          {loadingVendors ? (
            <div className="center-loading">Loading vendor registrations…</div>
          ) : vendors.length === 0 ? (
            <div className="empty-state-box" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No vendor registrations found in database yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vendors.map((v) => {
                const isAppr = v.paymentStatus === 'approved' || v.paymentApproved === true
                const planName = v.selectedPlan === 'pro_2m' ? '2 Months Plan (₦7,999)' : '1 Month Plan (₦5,000)'
                const isBusy = actionLoadingId === v.uid

                return (
                  <div
                    key={v.uid}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span className="avatar-circle vendor-avatar" style={{ width: 42, height: 42, fontSize: 16 }}>
                        {(v.name?.[0] || v.email?.[0] || 'V').toUpperCase()}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{v.name || 'Unnamed Vendor'}</strong>
                          <span className={`badge-pill ${isAppr ? 'explorer-badge' : 'vendor-badge'}`}>
                            {isAppr ? (<><i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }} /> Approved</>) : (<><i className="fa-solid fa-hourglass-half" style={{ marginRight: '4px' }} /> Pending</>)}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          <i className="fa-solid fa-envelope" style={{ marginRight: '4px', opacity: 0.6 }} /> {v.email} • <i className="fa-solid fa-tag" style={{ marginRight: '4px', opacity: 0.6 }} /> {planName}
                          {v.phone && (
                            <> • <i className="fa-brands fa-whatsapp" style={{ marginRight: '3px', color: '#25D366' }} /> <strong style={{ color: 'var(--text-primary)' }}>{displayFormattedPhone(v.phone)}</strong></>
                          )}
                          {v.createdAt?.seconds && (<> • <i className="fa-solid fa-calendar" style={{ marginRight: '4px', opacity: 0.6 }} /> {new Date(v.createdAt.seconds * 1000).toLocaleDateString()}</>)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {!isAppr ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApproveVendor(v)}
                          disabled={isBusy}
                        >
                          {isBusy ? 'Processing…' : (<><i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }} /> Approve & Unlock</>)}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--accent-rose)' }}
                          onClick={() => handleRevokeVendor(v)}
                          disabled={isBusy}
                        >
                          {isBusy ? 'Processing…' : (<><i className="fa-solid fa-lock" style={{ marginRight: '5px' }} /> Revoke Approval</>)}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUSINESSES DIRECTORY MANAGEMENT */}
      {activeTab === 'businesses' && (
        <div>
          {/* Add / Edit Form */}
          {showForm && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              marginBottom: '36px',
              boxShadow: 'var(--shadow-md)',
            }}>
              <h2 className="admin-section-title">
                {editingId ? (<><i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }} /> Edit Business</>) : (<><i className="fa-solid fa-plus" style={{ marginRight: '6px' }} /> Add New Business</>)}
              </h2>

              <div style={{ marginBottom: '20px', padding: '14px 18px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '5px' }} /> Quick-fill popular business templates:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {POPULAR_SAMPLES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setForm(sample.data)
                        setEditingId(null)
                        setError('')
                        setSuccess('')
                      }}
                    >
                      <i className={sample.icon} style={{ marginRight: '5px' }} /> {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label>Business Name *</label>
                    <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Radisson Blu Hotel" required />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input className="form-control" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Lagos, Abuja, Port Harcourt" required />
                  </div>

                  <div className="form-group">
                    <label>Exact Location / Address *</label>
                    <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Victoria Island, Lagos" required />
                  </div>

                  <div className="form-group">
                    <label>WhatsApp / Phone Number</label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(val) => setForm((p) => ({ ...p, phone: val }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Price Range / Tag</label>
                    <input className="form-control" name="price" value={form.price} onChange={handleChange} placeholder="e.g. ₦15,000 - ₦50,000" />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '4px' }}>
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe this business. This helps search ranking."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '4px' }}>
                  <div className="form-group">
                    <label>Logo Photo</label>
                    <input type="file" accept="image/*" className="form-control" style={{ marginBottom: '6px' }} onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                    <input className="form-control" name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="Or enter image URL https://…" />
                    {form.logoUrl && <img src={form.logoUrl} alt="logo" style={{ width: 60, height: 60, borderRadius: 8, marginTop: 6, objectFit: 'cover' }} />}
                  </div>

                  <div className="form-group">
                    <label>Photo 1</label>
                    <input type="file" accept="image/*" className="form-control" style={{ marginBottom: '6px' }} onChange={(e) => handleFileUpload(e, 'image1Url')} />
                    <input className="form-control" name="image1Url" value={form.image1Url} onChange={handleChange} placeholder="Or enter image URL https://…" />
                    {form.image1Url && <img src={form.image1Url} alt="photo1" style={{ width: 100, height: 60, borderRadius: 8, marginTop: 6, objectFit: 'cover' }} />}
                  </div>

                  <div className="form-group">
                    <label>Photo 2</label>
                    <input type="file" accept="image/*" className="form-control" style={{ marginBottom: '6px' }} onChange={(e) => handleFileUpload(e, 'image2Url')} />
                    <input className="form-control" name="image2Url" value={form.image2Url} onChange={handleChange} placeholder="Or enter image URL https://…" />
                    {form.image2Url && <img src={form.image2Url} alt="photo2" style={{ width: 100, height: 60, borderRadius: 8, marginTop: 6, objectFit: 'cover' }} />}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                    <i className="fa-solid fa-star" style={{ color: '#f59e0b' }} /> Featured (shows at top)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                    <input type="checkbox" name="verified" checked={form.verified} onChange={handleChange} />
                    <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-emerald)' }} /> Verified Badge
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : editingId ? (<><i className="fa-solid fa-floppy-disk" style={{ marginRight: '5px' }} /> Save Changes</>) : (<><i className="fa-solid fa-rocket" style={{ marginRight: '5px' }} /> Publish Business</>)}
                  </button>
                  <button className="btn btn-outline" type="button" onClick={handleReset}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Business List */}
          <h2 className="admin-section-title">
            All Businesses ({businesses.length})
          </h2>

          {loadingBiz ? (
            <div className="center-loading">Loading businesses…</div>
          ) : businesses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
              No businesses yet. Click "+ Add Business" above.
            </p>
          ) : (
            <div className="admin-business-list">
              {businesses.map((biz) => (
                <div key={biz.id} className="admin-biz-row">
                  {biz.logoUrl && (
                    <img
                      src={biz.logoUrl}
                      alt={biz.name}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                  <div className="admin-biz-info">
                    <div className="admin-biz-name">{biz.name}</div>
                    <div className="admin-biz-meta">
                      {biz.category} • {biz.city || biz.location || '—'}
                      {biz.phone && (<> • <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '2px' }} /> {displayFormattedPhone(biz.phone)}</>)}
                      {biz.verified && (<> • <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-emerald)', marginRight: '2px' }} /> Verified</>)}
                      {biz.featured && (<> • <i className="fa-solid fa-star" style={{ color: '#f59e0b', marginRight: '2px' }} /> Featured</>)}
                      {biz.adminAdded && (<> • <i className="fa-solid fa-shield-halved" style={{ color: 'var(--brand-primary)', marginRight: '2px' }} /> Admin</>)}
                    </div>
                  </div>
                  <div className="admin-biz-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(biz)}
                    >
                      <i className="fa-solid fa-pen-to-square" style={{ marginRight: '4px' }} /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(biz)}
                    >
                      <i className="fa-solid fa-trash-can" style={{ marginRight: '4px' }} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADVERTS & HOMEPAGE SPOTLIGHTS */}
      {activeTab === 'adverts' && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 className="admin-section-title" style={{ margin: 0 }}>
                Homepage Ads & Spotlights
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
                Create banners, promotional flyers, and featured campaigns displayed on the explorer homepage.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (showAdForm) {
                  setShowAdForm(false)
                  setEditingAdId(null)
                  setAdForm(EMPTY_AD_FORM)
                } else {
                  setEditingAdId(null)
                  setAdForm(EMPTY_AD_FORM)
                  setShowAdForm(true)
                }
              }}
            >
              {showAdForm ? (<><i className="fa-solid fa-xmark" style={{ marginRight: '5px' }} /> Close Form</>) : (<><i className="fa-solid fa-plus" style={{ marginRight: '5px' }} /> Create New Ad</>)}
            </button>
          </div>

          {/* ADVERT FORM */}
          {showAdForm && (
            <div className="admin-form-box" style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>
                {editingAdId ? (<><i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }} /> Edit Advert</>) : (<><i className="fa-solid fa-bullhorn" style={{ marginRight: '6px' }} /> Create New Homepage Advert</>)}
              </h3>

              <form onSubmit={handleSaveAd}>
                {/* Auto-fill from existing businesses */}
                {businesses.length > 0 && !editingAdId && (
                  <div className="form-group" style={{ marginBottom: '16px', background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      <i className="fa-solid fa-bolt" style={{ marginRight: '5px' }} /> Quick Link to Registered Business:
                    </label>
                    <select
                      className="form-input"
                      onChange={(e) => handleAutoFillAdFromBusiness(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>-- Select a registered business to auto-fill details --</option>
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.category || 'General'} - {b.city || 'Nigeria'})
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Auto-populates business name, WhatsApp phone, category, and images.
                    </span>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Advert Title / Main Headline *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={adForm.title}
                      onChange={handleAdFormChange}
                      placeholder="e.g. Luxury Weekend Getaway - 25% Off"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Name *</label>
                    <input
                      type="text"
                      name="businessName"
                      className="form-input"
                      value={adForm.businessName}
                      onChange={handleAdFormChange}
                      placeholder="e.g. Transcorp Hilton Abuja"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Badge Label</label>
                    <select
                      name="badge"
                      className="form-input"
                      value={adForm.badge}
                      onChange={handleAdFormChange}
                    >
                      <option value="Admin Spotlight">Admin Spotlight</option>
                      <option value="Sponsored">Sponsored</option>
                      <option value="Featured Deal">Featured Deal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Homepage Placement</label>
                    <select
                      name="placement"
                      className="form-input"
                      value={adForm.placement}
                      onChange={handleAdFormChange}
                    >
                      <option value="hero_banner">Top Hero Carousel (High Impact)</option>
                      <option value="flyer_card">Flyer Card (Promotional Grid)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Contact Phone Number *</label>
                    <PhoneInput
                      value={adForm.phone}
                      onChange={(val) => setAdForm((p) => ({ ...p, phone: val }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Reach / Coverage</label>
                    <input
                      type="text"
                      name="targetReach"
                      className="form-input"
                      value={adForm.targetReach}
                      onChange={handleAdFormChange}
                      placeholder="e.g. Nationwide Delivery, Lagos Only"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Promo Price / Offer Tag</label>
                    <input
                      type="text"
                      name="pricePromo"
                      className="form-input"
                      value={adForm.pricePromo}
                      onChange={handleAdFormChange}
                      placeholder="e.g. From ₦85,000 or Save 20%"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Button Text</label>
                    <input
                      type="text"
                      name="ctaText"
                      className="form-input"
                      value={adForm.ctaText}
                      onChange={handleAdFormChange}
                      placeholder="e.g. Chat on WhatsApp / Order Now"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Banner Image URL (Landscape - for Hero Carousel)</label>
                    <input
                      type="url"
                      name="imageUrl"
                      className="form-input"
                      value={adForm.imageUrl}
                      onChange={handleAdFormChange}
                      placeholder="https://images.unsplash.com/... (high-res landscape banner)"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Flyer / Poster Graphic URL (Portrait or Square)</label>
                    <input
                      type="url"
                      name="flyerUrl"
                      className="form-input"
                      value={adForm.flyerUrl}
                      onChange={handleAdFormChange}
                      placeholder="https://... (flyer or promotional graphic)"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Promotional Tagline / Description</label>
                    <textarea
                      name="tagline"
                      className="form-input"
                      rows={2}
                      value={adForm.tagline}
                      onChange={handleAdFormChange}
                      placeholder="Short catchy hook describing the offer or product drop..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-input"
                      value={adForm.startDate}
                      onChange={handleAdFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      name="endDate"
                      className="form-input"
                      value={adForm.endDate}
                      onChange={handleAdFormChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" disabled={savingAd}>
                    {savingAd ? 'Saving Advert…' : editingAdId ? 'Update Advert' : (<><i className="fa-solid fa-rocket" style={{ marginRight: '5px' }} /> Publish Advert</>)}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setShowAdForm(false)
                      setEditingAdId(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ADVERTS TABLE & PREVIEW */}
          {loadingAds ? (
            <div className="center-loading">Loading adverts…</div>
          ) : ads.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon"><i className="fa-solid fa-bullhorn" style={{ fontSize: '32px', color: 'var(--brand-primary)' }} /></div>
              <h3>No Adverts Published Yet</h3>
              <p>Click "Create New Ad" above to publish your first spotlight campaign to the homepage.</p>
            </div>
          ) : (
            <div className="admin-business-list">
              {ads.map((ad) => {
                const isExpired = ad.endDate && ad.endDate < new Date().toISOString()
                const isActive = ad.status === 'active' && !isExpired

                return (
                  <div key={ad.id} className="admin-biz-row">
                    <img
                      src={ad.flyerUrl || ad.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop'}
                      alt={ad.title}
                      style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop'
                      }}
                    />

                    <div className="admin-biz-info">
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px' }}>{ad.title}</span>
                        <span className={`badge-pill ${isActive ? 'vendor-badge' : 'explorer-badge'}`} style={{ fontSize: '11px' }}>
                          {isActive ? (<><i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '4px', color: '#22c55e' }} /> Active</>) : isExpired ? (<><i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '4px', color: '#ef4444' }} /> Expired</>) : (<><i className="fa-solid fa-pause" style={{ fontSize: '8px', marginRight: '4px' }} /> Paused</>)}
                        </span>
                        <span className="badge-sparkle" style={{ fontSize: '11px' }}>
                          {ad.badge || 'Admin Spotlight'}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          [{ad.placement === 'hero_banner' ? 'Hero Banner' : 'Flyer Card'}]
                        </span>
                      </div>

                      <div className="admin-biz-meta">
                        <i className="fa-solid fa-building" style={{ marginRight: '4px', opacity: 0.6 }} /> <strong>{ad.businessName}</strong>
                        {ad.targetReach && (<> • <i className="fa-solid fa-location-dot" style={{ marginRight: '3px', opacity: 0.6 }} /> {ad.targetReach}</>)}
                        {ad.phone && (<> • <i className="fa-brands fa-whatsapp" style={{ marginRight: '3px', opacity: 0.6 }} /> {ad.phone}</>)}
                        {ad.pricePromo && (<> • <i className="fa-solid fa-tag" style={{ marginRight: '3px', opacity: 0.6 }} /> {ad.pricePromo}</>)}
                        {ad.endDate && ` • Expiry: ${ad.endDate.split('T')[0]}`}
                      </div>
                    </div>

                    <div className="admin-biz-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleToggleAdStatus(ad)}
                        title={ad.status === 'active' ? 'Pause advert' : 'Activate advert'}
                      >
                        {ad.status === 'active' ? (<><i className="fa-solid fa-pause" style={{ marginRight: '4px' }} /> Pause</>) : (<><i className="fa-solid fa-play" style={{ marginRight: '4px' }} /> Resume</>)}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleEditAd(ad)}
                      >
                        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '4px' }} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteAd(ad)}
                      >
                        <i className="fa-solid fa-trash-can" style={{ marginRight: '4px' }} /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmState)}
        title={confirmState?.title || ''}
        body={confirmState?.body || ''}
        confirmLabel={confirmState?.confirmLabel || 'Delete'}
        cancelLabel="Cancel"
        onConfirm={confirmState?.onConfirm}
        onCancel={() => !confirmLoading && setConfirmState(null)}
        isLoading={confirmLoading}
      />
    </div>
  )
}

