import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  createBusiness,
  updateBusiness,
  getBusinessByOwner,
} from '../services/businessService'
import { updateUserProfile } from '../services/authService'
import { uploadImage, fileToBase64 } from '../services/cloudinaryService'
import { getSuggestedCategories } from '../services/openrouterService'
import { formatTo234 } from '../utils/phoneUtils'
import PhoneInput from '../components/PhoneInput'

function ImagePicker({ label, file, url, onChange, disabled }) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const displaySrc = preview || url

  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="file"
        accept="image/*"
        className="form-control"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0])
          }
        }}
      />
      {displaySrc && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={displaySrc}
            alt={label}
            style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            {preview ? 'Selected photo preview' : 'Current photo'}
          </small>
        </div>
      )}
    </div>
  )
}

export default function BusinessSetup() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categories = getSuggestedCategories()

  const planFromQuery = searchParams.get('plan')
  const isApproved = profile?.paymentStatus === 'approved' || profile?.paymentApproved === true || profile?.role === 'admin'

  const [editingId, setEditingId] = useState(null)
  const [currentTier, setCurrentTier] = useState(planFromQuery || profile?.subscriptionTier || profile?.selectedPlan || 'pro_1m')
  const [isBlocked, setIsBlocked] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [img1, setImg1] = useState(null)
  const [img1Url, setImg1Url] = useState('')
  const [img2, setImg2] = useState(null)
  const [img2Url, setImg2Url] = useState('')
  const [error, setError] = useState('')
  const [uploadWarning, setUploadWarning] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    getBusinessByOwner(user.uid).then((b) => {
      if (b) {
        setEditingId(b.id)
        setCurrentTier(b.subscriptionTier || currentTier)
        setIsBlocked(Boolean(b.isBlocked))
        setName(b.name || '')
        setCategory(b.category || '')
        setLocation(b.location || b.city || '')
        setPhone(b.phone || profile?.phone || '')
        setPrice(b.price || '')
        setDescription(b.description || '')
        setLogoUrl(b.logoUrl || '')
        setImg1Url(b.image1Url || '')
        setImg2Url(b.image2Url || '')
      }
    })
  }, [user?.uid])

  const safeUpload = async (file, fieldName) => {
    if (!file) return ''
    try {
      const res = await uploadImage(file)
      if (res && res.url) return res.url
    } catch (err) {
      console.warn(`Cloudinary upload warning for ${fieldName}:`, err)
    }
    try {
      // 100% Guaranteed local image encoding fallback
      const base64Url = await fileToBase64(file)
      return base64Url
    } catch (fallbackErr) {
      console.error(`Failed to process photo for ${fieldName}:`, fallbackErr)
      return ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setUploadWarning('')

    if (isBlocked) {
      return setError('⛔ Your business account is currently blocked. Please contact support.')
    }

    if (!name.trim()) return setError('Business name is required.')
    if (!category) return setError('Please select a business category.')
    if (!location.trim()) return setError('Please enter your business location (city/neighborhood).')
    if (!phone.trim()) return setError('Please enter your WhatsApp/phone contact number.')

    setUploading(true)
    setSaving(true)

    try {
      // Safe non-crashing Cloudinary uploads for logo and product images
      let uploadedLogo = logoUrl
      let uploadedImg1 = img1Url
      let uploadedImg2 = img2Url

      if (logo) {
        const url = await safeUpload(logo, 'Logo')
        if (url) uploadedLogo = url
      }
      if (img1) {
        const url = await safeUpload(img1, 'Product Photo 1')
        if (url) uploadedImg1 = url
      }
      if (img2) {
        const url = await safeUpload(img2, 'Product Photo 2')
        if (url) uploadedImg2 = url
      }

      const formattedPhone = formatTo234(phone)

      const businessData = {
        name: name.trim(),
        category,
        location: location.trim(),
        city: location.trim(),
        phone: formattedPhone,
        price: price.trim(),
        description: description.trim(),
        logoUrl: uploadedLogo,
        image1Url: uploadedImg1,
        image2Url: uploadedImg2,
        verified: Boolean(isApproved),
        status: isApproved ? 'active' : 'pending',
        paymentStatus: isApproved ? 'approved' : 'pending',
        subscriptionTier: currentTier,
        isBlocked: false,
        keywords: [
          name.trim().toLowerCase(),
          category.toLowerCase(),
          location.trim().toLowerCase(),
        ].filter(Boolean),
      }

      if (editingId) {
        await updateBusiness(editingId, businessData)
      } else {
        await createBusiness({ uid: user.uid, data: businessData })
      }

      // Update user profile to reflect business role and selected plan
      await updateUserProfile(user.uid, {
        role: 'business',
        selectedPlan: currentTier,
        phone: formattedPhone,
        paymentStatus: isApproved ? 'approved' : (profile?.paymentStatus || 'pending'),
      })

      if (refreshProfile) await refreshProfile()

      // Direct to business portal / payment flow
      navigate('/business')
    } catch (err) {
      console.error('Error saving business listing:', err)
      setError(err.message || 'Could not save business listing. Please try again.')
    } finally {
      setUploading(false)
      setSaving(false)
    }
  }

  if (isBlocked) {
    return (
      <div className="setup-card" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}><i className="fa-solid fa-ban" style={{ color: '#ef4444' }} /></div>
        <h1 style={{ fontSize: '22px', color: '#ef4444', marginBottom: '8px' }}>Account Suspended / Blocked</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          This business listing was flagged for a policy review. Please contact support.
        </p>
        <Link to="/subscription" className="btn btn-primary btn-lg">
          View Subscription Plans →
        </Link>
      </div>
    )
  }

  return (
    <div className="setup-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>
            {editingId ? 'Edit Business Listing' : 'Set Up Your Business Profile'}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Provide your business information and photos so local customers can discover you on Dotch.
          </p>
        </div>
        <span className="badge-pill badge-vip">
          <i className="fa-solid fa-fire" style={{ marginRight: '4px' }} /> End of Year Promo Plan (₦5,000)
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        {uploadWarning && <div className="alert alert-warning" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>{uploadWarning}</div>}

        <div className="form-group">
          <label>Business Name *</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kicks Hub Lagos or Eko Hotel & Suites"
            required
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Choose a category…</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>City & Neighborhood *</label>
          <input
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lekki Phase 1, Lagos or Maitama, Abuja"
            required
          />
        </div>

        <div className="form-group">
          <label>WhatsApp / Phone Contact Number *</label>
          <PhoneInput
            value={phone}
            onChange={(val) => setPhone(val)}
            required
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Customers will tap to chat directly with you on WhatsApp using this number.
          </small>
        </div>

        <div className="form-group">
          <label>Price Range or Typical Pricing (Optional)</label>
          <input
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. ₦10,000 - ₦50,000 or ₦150,000 / night"
          />
        </div>

        <div className="form-group">
          <label>Description & Services Offered</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what products or services you offer, brand highlights, and working hours."
            rows={3}
          />
        </div>

        {/* Photos & Brand Media */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            <i className="fa-solid fa-images" style={{ marginRight: '6px' }} /> Photos & Brand Media
          </h3>
          <ImagePicker label="Business Logo" file={logo} url={logoUrl} onChange={setLogo} disabled={uploading || saving} />
          <ImagePicker label="Product / Place Photo 1" file={img1} url={img1Url} onChange={setImg1} disabled={uploading || saving} />
          <ImagePicker label="Product / Place Photo 2" file={img2} url={img2Url} onChange={setImg2} disabled={uploading || saving} />
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={uploading || saving}
          style={{ marginTop: '20px' }}
        >
          {uploading ? (
            <>
              <span className="btn-spinner" aria-hidden="true" style={{ marginRight: '8px' }} />
              <span>Uploading…</span>
            </>
          ) : saving ? (
            <>
              <span className="btn-spinner" aria-hidden="true" style={{ marginRight: '8px' }} />
              <span>Saving…</span>
            </>
          ) : editingId ? (
            'Save Changes'
          ) : isApproved ? (
            'Publish Business Listing'
          ) : (
            'Save & Continue to Payment →'
          )}
        </button>
      </form>
    </div>
  )
}
