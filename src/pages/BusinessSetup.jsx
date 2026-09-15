import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  createBusiness,
  updateBusiness,
  getBusinessByOwner,
} from '../services/businessService'
import { uploadImage } from '../services/cloudinaryService'
import { getSuggestedCategories } from '../services/openrouterService'

function ImagePicker({ label, file, url, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="file"
        accept="image/*"
        className="form-control"
        onChange={(e) => onChange(e.target.files[0])}
      />
      {url && (
        <img
          src={url}
          alt={label}
          style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', marginTop: '8px' }}
        />
      )}
      {!url && file && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Selected: {file.name}</p>}
    </div>
  )
}

export default function BusinessSetup() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const categories = getSuggestedCategories()

  const isApproved = profile?.paymentStatus === 'approved' || profile?.paymentApproved === true || profile?.role === 'admin'
  const [editingId, setEditingId] = useState(null)
  const [currentTier, setCurrentTier] = useState(profile?.subscriptionTier || profile?.selectedPlan || 'pro_1m')
  const [isBlocked, setIsBlocked] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [img1, setImg1] = useState(null)
  const [img1Url, setImg1Url] = useState('')
  const [img2, setImg2] = useState(null)
  const [img2Url, setImg2Url] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const isFreePlan = currentTier === 'starter' || !currentTier

  useEffect(() => {
    getBusinessByOwner(user.uid).then((b) => {
      if (b) {
        setEditingId(b.id)
        setCurrentTier(b.subscriptionTier || 'starter')
        setIsBlocked(Boolean(b.isBlocked))
        setName(b.name || '')
        setCategory(b.category || '')
        setLocation(b.location || b.city || '')
        setPhone(b.phone || '')
        setPrice(b.price || '')
        setDescription(b.description || '')
        setLogoUrl(b.logoUrl || '')
        setImg1Url(b.image1Url || '')
        setImg2Url(b.image2Url || '')
      }
    })
  }, [user.uid])

  // GATE: Business posting is unavailable until admin approves payment
  if (!isApproved && !editingId) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
        <div className="empty-state-box" style={{ padding: '36px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
          <span className="badge-pill vendor-badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
            Payment Verification Required
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Business Listing Locked
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 20px' }}>
            Posting a business listing is unavailable until our admin verifies your payment. Please visit your vendor dashboard to submit proof of payment.
          </p>
          <Link to="/business" className="btn btn-primary btn-lg">
            Go to Vendor Dashboard →
          </Link>
        </div>
      </div>
    )
  }

  const upload = async (file) => {
    if (!file) return ''
    const res = await uploadImage(file)
    return res.url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isBlocked) {
      return setError('⛔ Your business account is currently blocked for policy violation. Please contact support or upgrade to a paid tier.')
    }

    if (!name.trim()) return setError('Business name is required.')

    // FREE TIER RESTRICTION ENFORCEMENT
    if (isFreePlan) {
      if (logo || img1 || img2) {
        return setError('❌ Photo uploads of your place/product are disabled on the unpaid tier. Upgrade to the ₦5,000 (1 Mo) or ₦7,999 (2 Mos) plan to add photos.')
      }
      if (phone.trim()) {
        return setError('❌ Phone / WhatsApp contact numbers are disabled on the unpaid tier. Upgrade to the ₦5,000 (1 Mo) or ₦7,999 (2 Mos) plan so buyers, tourists, and researchers can call or message you.')
      }
      if (location.trim()) {
        setError('⚠️ Location listing is not permitted on the unpaid tier. Upgrade to ₦5,000 for 1 month or ₦7,999 for 2 months to list your place and location.')
        return
      }
    }

    setUploading(true)
    setSaving(true)
    try {
      let l = logoUrl, i1 = img1Url, i2 = img2Url
      if (!isFreePlan) {
        const [upLogo, upImg1, upImg2] = await Promise.all([
          upload(logo),
          upload(img1),
          upload(img2),
        ])
        l = upLogo || logoUrl
        i1 = upImg1 || img1Url
        i2 = upImg2 || img2Url
      }

      const data = {
        name: name.trim(),
        category,
        location: isFreePlan ? 'Unspecified (Free Tier)' : location.trim() || 'Lagos',
        city: isFreePlan ? 'Unspecified' : location.trim() || 'Lagos',
        phone: isFreePlan ? '' : phone.trim(),
        price: price.trim(),
        description: description.trim(),
        logoUrl: isFreePlan ? '' : l,
        image1Url: isFreePlan ? '' : i1,
        image2Url: isFreePlan ? '' : i2,
        verified: !isFreePlan,
        subscriptionTier: currentTier,
        isBlocked: false,
        keywords: [
          name.trim().toLowerCase(),
          category.toLowerCase(),
          !isFreePlan ? location.trim().toLowerCase() : '',
        ].filter(Boolean),
      }

      if (editingId) {
        await updateBusiness(editingId, data)
      } else {
        await createBusiness({ uid: user.uid, data })
      }
      navigate('/business')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not save business listing.')
    } finally {
      setUploading(false)
      setSaving(false)
    }
  }

  if (isBlocked) {
    return (
      <div className="setup-card" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⛔</div>
        <h1 style={{ fontSize: '22px', color: '#ef4444', marginBottom: '8px' }}>Account Suspended / Blocked</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          This business listing was flagged because a location was registered on the unverified Free tier.
          Free tier allows business name indexing only.
        </p>
        <Link to="/subscription" className="btn btn-primary btn-lg">
          ⚡ Upgrade to 1 Month (₦5,000) or 2 Months (₦7,999) to Unblock →
        </Link>
      </div>
    )
  }

  return (
    <div className="setup-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h1 style={{ fontSize: '24px' }}>
          {editingId ? 'Edit Business Listing' : 'List your business on Dotch'}
        </h1>
        <span
          className={`badge-pill ${
            currentTier === 'pro_2m'
              ? 'badge-vip'
              : currentTier === 'pro_1m'
              ? 'badge-pro'
              : 'badge-pill'
          }`}
        >
          {currentTier === 'pro_2m'
            ? '🔥 2 Months Active (₦7,999)'
            : currentTier === 'pro_1m'
            ? '⚡ 1 Month Active (₦5,000)'
            : '🌱 Free Tier (Name Only)'}
        </span>
      </div>

      {isFreePlan && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#fca5a5',
          }}
        >
          <strong>⚠️ Unpaid Tier Restrictions (Firebase Enforced):</strong>
          <ul style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: 1.5 }}>
            <li>Photos of your place or product are <strong>locked</strong>.</li>
            <li>Phone and WhatsApp numbers are <strong>locked</strong>.</li>
            <li>Location and city discovery are <strong>locked</strong>.</li>
          </ul>
          <Link to="/subscription" style={{ color: 'var(--brand-primary)', fontWeight: 700, display: 'inline-block', marginTop: '6px' }}>
            ⚡ Upgrade: ₦5,000 (1 Month) or ₦7,999 (2 Months) to unlock photos, location & phone →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

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
          <label>
            City / Location {isFreePlan && <span style={{ color: '#ef4444' }}>(Locked on Free Tier)</span>}
          </label>
          <input
            className="form-control"
            value={isFreePlan ? '' : location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={isFreePlan ? 'Upgrade to add location (Lekki, Abuja, etc.)' : 'e.g. Lekki Phase 1, Lagos'}
            disabled={isFreePlan}
          />
          {isFreePlan && (
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '3px', display: 'block' }}>
              Requires ₦5,000 Standard or ₦10,000 Corporate plan.
            </small>
          )}
        </div>

        <div className="form-group">
          <label>
            WhatsApp / Phone Number {isFreePlan && <span style={{ color: '#ef4444' }}>(Locked on Free Tier)</span>}
          </label>
          <input
            className="form-control"
            value={isFreePlan ? '' : phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isFreePlan ? 'Upgrade to add phone & WhatsApp link' : 'e.g. +2348012345678'}
            disabled={isFreePlan}
          />
          {isFreePlan && (
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '3px', display: 'block' }}>
              Requires ₦5,000 Standard or ₦10,000 Corporate plan.
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Price Range (Optional)</label>
          <input
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. ₦10,000 - ₦50,000"
          />
        </div>

        <div className="form-group">
          <label>Description & Services Offered</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what products/services you sell. This helps AI find your business."
            rows={3}
          />
        </div>

        {/* Image upload controls - only accessible on paid tiers */}
        {!isFreePlan ? (
          <>
            <ImagePicker label="Business Logo" file={logo} url={logoUrl} onChange={setLogo} />
            <ImagePicker label="Product / Facility Photo 1" file={img1} url={img1Url} onChange={setImg1} />
            <ImagePicker label="Product / Facility Photo 2" file={img2} url={img2Url} onChange={setImg2} />
          </>
        ) : (
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-muted)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🖼️ 🔒</div>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
              Photo Uploads Locked on Free Tier
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Upgrade to Standard (₦5k/mo) or Corporate (₦10k/mo) to showcase your logo, menu, rooms, and products.
            </p>
          </div>
        )}

        <button className="btn btn-primary btn-block" disabled={uploading || saving} style={{ marginTop: '16px' }}>
          {uploading ? 'Uploading images…' : saving ? 'Saving…' : editingId ? 'Save listing' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}
