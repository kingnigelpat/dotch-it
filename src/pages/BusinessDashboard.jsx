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
    if (!confirm('Delete this business listing?')) return
    setDeleting(true)
    try {
      await deleteBusiness(business.id)
      setBusiness(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="center-loading">Loading…</div>

  if (!business) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <h2>You don't have a business yet</h2>
          <p>Add your business name, logo and two photos to start getting found.</p>
          <Link to="/business/setup" className="btn btn-primary">
            Set up your business
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header row-between">
        <div>
          <h1>My business</h1>
          <p>This is how finders see you.</p>
        </div>
        <div className="actions">
          <Link to="/business/setup" className="btn btn-outline">
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid">
        <BusinessCard business={business} />
      </div>
    </div>
  )
}
