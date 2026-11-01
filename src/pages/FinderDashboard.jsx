import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BusinessCard from '../components/BusinessCard'
import { getAllSellers } from '../services/aiDiscoveryService'
import { isMockBusiness } from '../services/businessService'

const CATEGORIES = [
  'All',
  'Tech & Gadgets',
  'Fashion & Apparel',
  'Bakery & Food',
  'Automotive',
  'Footwear & Streetwear',
  'Solar & Renewable Energy',
  'Health & Beauty',
  'Restaurants & Catering',
  'Services & Salons',
  'Security & Automation',
]

/**
 * Marketplace & Business Catalog (/browse)
 * 
 * Clean, direct listing of all verified Nigerian businesses.
 * No AI voice, no speech synthesis, no voice assistant — just a clean business directory.
 */
export default function FinderDashboard() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialCat = searchParams.get('cat') || 'All'
  const initialQ = searchParams.get('q') || ''

  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterText, setFilterText] = useState(initialQ)
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [selectedCity, setSelectedCity] = useState('All')

  // Load all businesses on mount
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getAllSellers()
      .then((data) => {
        if (isMounted) {
          setBusinesses(data || [])
        }
      })
      .catch((err) => {
        console.warn('Error loading businesses:', err)
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Filter businesses by search text, category, and city
  const filteredBusinesses = useMemo(() => {
    const q = filterText.trim().toLowerCase()
    return businesses.filter((b) => {
      if (isMockBusiness(b)) return false

      // Category match
      if (selectedCategory !== 'All') {
        const bCat = (b.category || '').toLowerCase()
        const targetCat = selectedCategory.toLowerCase()
        if (!bCat.includes(targetCat) && !targetCat.includes(bCat)) {
          return false
        }
      }

      // City filter
      if (selectedCity !== 'All') {
        const bLoc = `${b.location || ''} ${b.city || ''} ${b.state || ''}`.toLowerCase()
        if (!bLoc.includes(selectedCity.toLowerCase())) {
          return false
        }
      }

      // Text search match (name, description, city, tags)
      if (q) {
        const bName = (b.name || '').toLowerCase()
        const bDesc = (b.description || '').toLowerCase()
        const bLoc = `${b.location || ''} ${b.city || ''} ${b.state || ''}`.toLowerCase()
        const bTags = Array.isArray(b.tags)
          ? b.tags.map((t) => String(t).toLowerCase())
          : (b.keywords || []).map((k) => String(k).toLowerCase())

        const matches =
          bName.includes(q) ||
          bDesc.includes(q) ||
          bLoc.includes(q) ||
          bTags.some((t) => t.includes(q))

        if (!matches) return false
      }

      return true
    })
  }, [businesses, filterText, selectedCategory, selectedCity])

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (cat !== 'All') next.set('cat', cat)
      else next.delete('cat')
      return next
    })
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setFilterText(val)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val.trim()) next.set('q', val.trim())
      else next.delete('q')
      return next
    })
  }

  return (
    <div className="marketplace-catalog-page purr-container" style={{ padding: '24px 16px 80px 16px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          to="/discover"
          className="btn btn-outline btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left" />
          <span>AI Search Engine</span>
        </Link>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            to={user ? (profile?.role === 'vendor' || profile?.role === 'business' ? '/business' : '/business/setup') : '/list-business'}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
          >
            <i className="fa-solid fa-store" style={{ marginRight: '6px' }} />
            List Your Business
          </Link>
        </div>
      </div>

      {/* Directory Title & Subtitle */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          Browse All Businesses
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '580px', margin: '0 auto' }}>
          Explore genuine, verified Nigerian stores, vendors, and services with zero middlemen.
        </p>
      </div>

      {/* Search & Filter Bar (Text Only, No Voice) */}
      <div style={{ maxWidth: '680px', margin: '0 auto 20px auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)', marginRight: '12px', fontSize: '15px' }} />
          <input
            type="text"
            value={filterText}
            onChange={handleSearchChange}
            placeholder="Filter businesses by name, keyword, or city..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text-primary)',
              padding: '8px 0',
            }}
          />
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '14px',
              }}
              title="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '24px',
          scrollbarWidth: 'none',
          justifyContent: 'flex-start',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                background: isActive ? 'var(--brand-primary)' : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Results Count Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', padding: '0 4px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'Business' : 'Businesses'} Listed
        </span>
        {selectedCategory !== 'All' && (
          <button
            type="button"
            onClick={() => handleCategoryChange('All')}
            style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
          >
            Show All Categories
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--brand-primary)' }}>
          <i className="fa-solid fa-circle-notch fa-spin fa-2x" />
          <div style={{ marginTop: '14px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Loading businesses across Nigeria…
          </div>
        </div>
      )}

      {/* Business Cards Grid */}
      {!loading && filteredBusinesses.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredBusinesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}

      {/* Empty Filter State */}
      {!loading && filteredBusinesses.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '520px',
            margin: '20px auto',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏪</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No businesses match your filter
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Try resetting your search filter or selecting a different category.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFilterText('')
              setSelectedCategory('All')
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
