import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
  featured: true,
  verified: true,
}

const POPULAR_SAMPLES = [
  {
    label: '🏨 Sample 5-Star Hotel',
    data: {
      name: 'Radisson Blu Anchorage Hotel',
      category: 'Hotel & Travel',
      city: 'Lagos',
      location: 'Ozumba Mbadiwe Ave, Victoria Island, Lagos',
      phone: '+2347080610000',
      price: '₦140,000 - ₦420,000 / night',
      description: 'Waterfront luxury hotel overlooking the Lagos Lagoon with contemporary rooms, infinity pool, fitness center & terrace dining.',
      logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop',
      image1Url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&auto=format&fit=crop',
      image2Url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&auto=format&fit=crop',
      featured: true,
      verified: true,
    },
  },
  {
    label: '🍽️ Sample Restaurant',
    data: {
      name: 'Terra Kulture Restaurant',
      category: 'Restaurant',
      city: 'Lagos',
      location: 'Plot 1376 Tiamiyu Savage St, Victoria Island, Lagos',
      phone: '+2348104265974',
      price: '₦6,000 - ₦25,000',
      description: 'Premier Nigerian cultural restaurant serving famous spicy goat meat Asun, native Jollof, Yam porridge & seafood okra.',
      logoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&auto=format&fit=crop',
      image1Url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop',
      image2Url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop',
      featured: true,
      verified: true,
    },
  },
  {
    label: '📱 Sample Tech Store',
    data: {
      name: 'Slot Systems Ikeja',
      category: 'Phones & Tech Gadgets',
      city: 'Lagos',
      location: 'Computer Village, Otigba St, Ikeja, Lagos',
      phone: '+2347007568644',
      price: '₦45,000 - ₦1,800,000',
      description: 'Official retailer for genuine Apple iPhones, Samsung Galaxy, MacBooks, Dell laptops, accessories, warranties & repairs.',
      logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop',
      image1Url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&auto=format&fit=crop',
      image2Url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop',
      featured: true,
      verified: true,
    },
  },
]

export default function AdminPanel() {
  const { user, profile, loading } = useAuth()
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

  const loadVendors = async () => {
    setLoadingVendors(true)
    try {
      const list = await getAllVendors()
      setVendors(list)
    } finally {
      setLoadingVendors(false)
    }
  }

  useEffect(() => {
    if (profile?.role === 'admin') {
      getAllBusinesses(100).then((list) => {
        setBusinesses(list)
        setLoadingBiz(false)
      })
      loadVendors()
    }
  }, [profile])

  const handleApproveVendor = async (v) => {
    setActionLoadingId(v.uid)
    setError('')
    setSuccess('')
    try {
      const planToSet = v.selectedPlan || 'pro_1m'
      await approveVendorPayment(v.uid, planToSet)
      setSuccess(`✅ Payment approved for ${v.name || v.email}! Their listing creation is now unlocked.`)
      await loadVendors()
    } catch (err) {
      setError('Could not approve payment: ' + err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRevokeVendor = async (v) => {
    if (!window.confirm(`Revoke payment approval and lock listing creation for ${v.name || v.email}?`)) return
    setActionLoadingId(v.uid)
    setError('')
    setSuccess('')
    try {
      await revokeVendorPayment(v.uid)
      setSuccess(`🔒 Listing creation locked for ${v.name || v.email}.`)
      await loadVendors()
    } catch (err) {
      setError('Could not revoke payment: ' + err.message)
    } finally {
      setActionLoadingId(null)
    }
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
    setError('')
    setSuccess('')
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
        phone: form.phone.trim(),
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
        setSuccess(`✅ "${data.name}" updated successfully.`)
      } else {
        const created = await createBusiness({ uid: user.uid, data })
        setBusinesses((prev) => [created, ...prev])
        setSuccess(`✅ "${data.name}" added and published successfully.`)
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

  const handleDelete = async (biz) => {
    if (!window.confirm(`Delete "${biz.name}"? This cannot be undone.`)) return
    try {
      await deleteBusiness(biz.id)
      setBusinesses((prev) => prev.filter((b) => b.id !== biz.id))
    } catch (err) {
      alert('Could not delete: ' + err.message)
    }
  }

  if (loading) return <div className="center-loading">Loading…</div>
  if (!user || profile?.role !== 'admin') return null

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            🛡️ Admin Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage all business listings. Changes reflect immediately on the search engine.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="admin-badge">Admin Only</span>
          {activeTab === 'businesses' && (
            <button
              className="btn btn-primary"
              onClick={() => { setShowForm(!showForm); if (showForm) handleReset() }}
            >
              {showForm ? '✕ Cancel' : '+ Add Business'}
            </button>
          )}
        </div>
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>
      )}

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'vendors' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('vendors')}
          style={{ fontWeight: 700 }}
        >
          💳 Vendor Payment Approvals ({vendors.filter(v => v.paymentStatus !== 'approved' && !v.paymentApproved).length} Pending)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'businesses' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('businesses')}
          style={{ fontWeight: 700 }}
        >
          🏢 Manage Directory Listings ({businesses.length})
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
              {loadingVendors ? 'Refreshing…' : '🔄 Refresh Vendors'}
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
                🏦 Active Bank Account for Vendor Payments:
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
                            {isAppr ? '✓ Approved (Can List)' : '⏳ Pending Payment (Locked)'}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          📧 {v.email} • 🏷️ {planName}
                          {v.createdAt?.seconds && ` • 📅 ${new Date(v.createdAt.seconds * 1000).toLocaleDateString()}`}
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
                          {isBusy ? 'Processing…' : '✅ Approve Payment & Unlock'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--accent-rose)' }}
                          onClick={() => handleRevokeVendor(v)}
                          disabled={isBusy}
                        >
                          {isBusy ? 'Processing…' : '🔒 Revoke Approval'}
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
                {editingId ? '✏️ Edit Business' : '➕ Add New Business'}
              </h2>

              <div style={{ marginBottom: '20px', padding: '14px 18px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  💡 Quick-fill popular business templates:
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
                      {sample.label}
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
                    <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +2348012345678" />
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
                    <label>Logo Image URL</label>
                    <input className="form-control" name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="https://…" />
                    {form.logoUrl && <img src={form.logoUrl} alt="logo" style={{ width: 60, height: 60, borderRadius: 8, marginTop: 6, objectFit: 'cover' }} />}
                  </div>

                  <div className="form-group">
                    <label>Photo 1 URL</label>
                    <input className="form-control" name="image1Url" value={form.image1Url} onChange={handleChange} placeholder="https://…" />
                    {form.image1Url && <img src={form.image1Url} alt="photo1" style={{ width: 100, height: 60, borderRadius: 8, marginTop: 6, objectFit: 'cover' }} />}
                  </div>

                  <div className="form-group">
                    <label>Photo 2 URL</label>
                    <input className="form-control" name="image2Url" value={form.image2Url} onChange={handleChange} placeholder="https://…" />
                    {form.image2Url && <img src={form.image2Url} alt="photo2" style={{ width: 100, height: 60, borderRadius: 8, marginTop: 6, objectFit: 'cover' }} />}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                    ⭐ Featured (shows at top)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                    <input type="checkbox" name="verified" checked={form.verified} onChange={handleChange} />
                    ✅ Verified Badge
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : editingId ? '💾 Save Changes' : '🚀 Publish Business'}
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
                      {biz.verified && ' • ✅ Verified'}
                      {biz.featured && ' • ⭐ Featured'}
                      {biz.adminAdded && ' • 🛡️ Admin Added'}
                    </div>
                  </div>
                  <div className="admin-biz-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(biz)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(biz)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
