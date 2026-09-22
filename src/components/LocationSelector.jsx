import { useState, useMemo, useRef, useEffect } from 'react'
import { NIGERIA_LOCATIONS } from '../data/nigeriaLocations'
import { getBrowserCurrentPosition } from '../services/geolocationService'
import { useToast } from '../context/ToastContext'

const POPULAR_CITIES = [
  'Lagos',
  'Ikeja',
  'Lekki',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Asaba',
  'Warri',
  'Benin City',
  'Enugu',
  'Kano',
  'Uyo',
  'Owerri',
]

export default function LocationSelector({ currentLocation, onLocationChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [detecting, setDetecting] = useState(false)
  const containerRef = useRef(null)
  const { showError } = useToast()

  // Clean current location display
  const cleanLoc = useMemo(() => {
    if (!currentLocation) return 'All Locations'
    const trimmed = currentLocation.trim()
    const firstPart = trimmed.includes('-') ? trimmed.split('-')[0].trim() : trimmed
    if (firstPart === 'Everywhere' || firstPart === 'All of Nigeria' || firstPart === 'All Locations') {
      return 'All Locations'
    }
    return firstPart
  }, [currentLocation])

  const isEverywhere = cleanLoc === 'All Locations'

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Live filter cities & states based on searchTerm
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return []

    const matches = []
    NIGERIA_LOCATIONS.forEach((st) => {
      // Check state name match
      if (st.state.toLowerCase().includes(q)) {
        matches.push({ name: st.state, type: 'State', parent: 'Nigeria' })
      }
      // Check city matches
      (st.cities || []).forEach((ct) => {
        if (ct.toLowerCase().includes(q)) {
          matches.push({ name: ct, type: 'City', parent: st.state })
        }
      })
    })

    return matches.slice(0, 15)
  }, [searchTerm])

  const handleSelect = (locName) => {
    if (onLocationChange) onLocationChange(locName)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleDetectGPS = async () => {
    setDetecting(true)
    try {
      const pos = await getBrowserCurrentPosition()
      const loc = pos.city || pos.state || pos.locationName || 'Lagos'
      handleSelect(loc)
    } catch (err) {
      console.warn('GPS error:', err)
      showError('Could not detect current GPS. Please choose your city from the list.')
    } finally {
      setDetecting(false)
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* Sleek Minimal Location Pill Button (Purrweb Inspo) */}
      <button
        type="button"
        className={`location-pill-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Select search location"
      >
        <i className="fa-solid fa-location-dot loc-dot-icon" />
        <span>{cleanLoc}</span>
        <i className="fa-solid fa-chevron-down loc-chevron" />
      </button>

      {/* Floating Modern Location Popover */}
      {isOpen && (
        <div className="purr-loc-popover" onMouseDown={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="purr-loc-header">
            <span className="purr-loc-title">
              <i className="fa-solid fa-location-crosshairs" style={{ color: 'var(--brand-primary)' }} />
              Choose Location
            </span>
            <button
              type="button"
              className="purr-loc-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Quick Action Buttons: GPS & Everywhere */}
          <div className="purr-loc-quick-actions">
            <button
              type="button"
              className="purr-loc-action-btn"
              onClick={handleDetectGPS}
              disabled={detecting}
            >
              {detecting ? (
                <i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--brand-primary)' }} />
              ) : (
                <i className="fa-solid fa-crosshairs" style={{ color: 'var(--brand-primary)' }} />
              )}
              <span>{detecting ? 'Locating…' : 'Use My GPS'}</span>
            </button>

            <button
              type="button"
              className={`purr-loc-action-btn ${isEverywhere ? 'active' : ''}`}
              onClick={() => handleSelect('Everywhere')}
              style={isEverywhere ? { background: 'var(--brand-primary)', color: '#fff', borderColor: 'var(--brand-primary)' } : {}}
            >
              <i className="fa-solid fa-globe" />
              <span>All Locations</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="purr-loc-search-wrap">
            <i className="fa-solid fa-magnifying-glass purr-loc-search-icon" />
            <input
              type="text"
              className="purr-loc-search-input"
              placeholder="Search city, area or state…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={true}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtered Search Results or Popular Cities */}
          {searchTerm.trim() ? (
            <div className="purr-loc-list-results">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="purr-loc-result-item"
                    onClick={() => handleSelect(item.name)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--brand-primary)', fontSize: '11px' }} />
                      <span>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {item.parent}
                    </span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No locations matching “{searchTerm}”.
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="purr-loc-section-label">Popular Hubs</div>
              <div className="purr-loc-chips-wrap">
                {POPULAR_CITIES.map((city) => {
                  const isActive = cleanLoc.toLowerCase() === city.toLowerCase()
                  return (
                    <button
                      key={city}
                      type="button"
                      className={`purr-loc-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelect(city)}
                    >
                      {city}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

