import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBusinessByOwner, deleteBusiness } from '../services/businessService'
import BusinessCard from '../components/BusinessCard'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getBusinessByOwner(user.uid)
      .then(setBusiness)
      .finally(() => setLoading(false))
  }, [user.uid])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your business listing?')) return
    setDeleting(true)
    try {
      await deleteBusiness(business.id)
      setBusiness(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="center-loading">Loading business dashboard…</div>

  if (!business) {
    return (
      <div className="empty-state-box">
        <div className="empty-state-icon">🏪</div>
        <h2 className="empty-state-title">You don't have an active business listing yet</h2>
        <p className="empty-state-subtitle">
          List your business on Dotch to start getting local customers today.
        </p>
        <Link to="/business/setup" className="btn btn-primary btn-lg">
          Create business listing
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/business/setup" className="btn btn-outline">
            ✏️ Edit Listing
          </Link>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
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
