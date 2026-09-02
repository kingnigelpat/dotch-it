import { useState } from 'react'

const POPULAR_LOCATIONS = [
  { city: 'Lagos', area: 'Victoria Island' },
  { city: 'Lagos', area: 'Lekki Phase 1' },
  { city: 'Lagos', area: 'Ikeja' },
  { city: 'Lagos', area: 'Ikoyi' },
  { city: 'Abuja', area: 'Maitama' },
  { city: 'Abuja', area: 'Wuse 2' },
  { city: 'Port Harcourt', area: 'GRA Phase 2' },
  { city: 'Asaba', area: 'GRA' },
  { city: 'Ibadan', area: 'Bodija' },
  { city: 'Enugu', area: 'Independence Layout' },
  { city: 'Calabar', area: 'Calabar Municipal' },
  { city: 'Kano', area: 'Nassarawa' },
]

export default function LocationModal({ isOpen, onClose, currentLocation, onSelectLocation }) {
  const [search, setSearch] = useState('')
  const [detecting, setDetecting] = useState(false)

  if (!isOpen) return null

  const filteredLocations = search.trim()
    ? POPULAR_LOCATIONS.filter(
        (l) =>
          l.city.toLowerCase().includes(search.toLowerCase()) ||
          l.area.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_LOCATIONS

  const handleDetect = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await res.json()
          const detected =
            data.address?.suburb ||
            data.address?.city_district ||
            data.address?.city ||
            data.address?.town ||
            'Lagos'
          onSelectLocation(detected)
          onClose()
        } catch {
          onSelectLocation('Lagos')
          onClose()
        } finally {
          setDetecting(false)
        }
      },
      () => {
        alert('Location permission denied or unavailable.')
        setDetecting(false)
      },
      { timeout: 8000 }
    )
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) {
      onSelectLocation(search.trim())
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Choose Search Location</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Find businesses and services near a specific area
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search input inside modal */}
        <form onSubmit={handleCustomSubmit} style={{ marginTop: '16px' }}>
          <div className="search-input-wrap" style={{ border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', background: 'var(--bg-muted)' }}>
            <span style={{ fontSize: '16px' }}>🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search city or neighborhood (e.g. Lekki, Ikeja, Abuja)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Current Location button */}
        <button
          type="button"
          className="btn btn-outline btn-block"
          style={{ marginTop: '14px', justifyContent: 'center', gap: '8px' }}
          onClick={handleDetect}
          disabled={detecting}
        >
          <span>🎯</span>
          <span>{detecting ? 'Detecting your location…' : 'Use my current location'}</span>
        </button>

        {/* Quick select chips */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Popular Areas & Cities
          </div>
          <div className="location-grid">
            <button
              className={`location-chip ${currentLocation === 'Everywhere' ? 'active' : ''}`}
              onClick={() => {
                onSelectLocation('Everywhere')
                onClose()
              }}
            >
              🌐 All Locations
            </button>
            {filteredLocations.map((item, idx) => {
              const label = `${item.area}, ${item.city}`
              const isSelected = currentLocation.toLowerCase() === item.area.toLowerCase() || currentLocation.toLowerCase() === label.toLowerCase()
              return (
                <button
                  key={idx}
                  className={`location-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    onSelectLocation(item.area)
                    onClose()
                  }}
                >
                  📍 {item.area} <span style={{ fontSize: '11px', opacity: 0.7 }}>({item.city})</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
