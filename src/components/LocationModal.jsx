import { useState } from 'react'

const REGIONS_DATA = [
  {
    region: 'Nigeria — Major Hubs',
    cities: [
      { name: 'Lagos', areas: ['Victoria Island', 'Lekki Phase 1', 'Ikeja', 'Ikoyi', 'Yaba', 'Surulere', 'Ajah'] },
      { name: 'Abuja', areas: ['Maitama', 'Wuse 2', 'Garki', 'Asokoro', 'Gwarinpa', 'Jabi', 'Central Area'] },
      { name: 'Port Harcourt', areas: ['GRA Phase 2', 'Peter Odili', 'Old GRA', 'Trans Amadi', 'D-Line'] },
      { name: 'Ibadan', areas: ['Bodija', 'Ring Road', 'Jericho', 'Oluyole', 'Samonda', 'Dugbe'] },
      { name: 'Enugu', areas: ['Independence Layout', 'GRA', 'New Haven', 'Ogui', 'Trans-Ekulu'] },
      { name: 'Asaba', areas: ['GRA', 'Okpanam Road', 'Nnebisi Road', 'Summit Road'] },
      { name: 'Kano', areas: ['Nassarawa', 'Bompai', 'Sabon Gari', 'Fagge'] },
      { name: 'Benin City', areas: ['GRA', 'Airport Road', 'Ugbowo', 'Sapele Road'] },
      { name: 'Calabar', areas: ['Calabar Municipal', 'State Housing', 'Marian Road'] },
      { name: 'Owerri', areas: ['Ikenegbu', 'New Owerri', 'World Bank', 'Aladinma'] },
      { name: 'Warri', areas: ['Effurun', 'GRA', 'Airport Road', 'Enerhen'] },
      { name: 'Abeokuta', areas: ['Oke-Mosan', 'Ibikunle', 'Kuto', 'Panseke'] },
    ],
  },
  {
    region: 'Africa & Global',
    cities: [
      { name: 'Accra (Ghana)', areas: ['Osu', 'East Legon', 'Airport Residential', 'Cantonments'] },
      { name: 'Nairobi (Kenya)', areas: ['Westlands', 'Kilimani', 'Karen', 'CBD'] },
      { name: 'Johannesburg (SA)', areas: ['Sandton', 'Rosebank', 'Braamfontein', 'Midrand'] },
      { name: 'London (UK)', areas: ['Central London', 'Camden', 'Greenwich', 'Canary Wharf'] },
      { name: 'Dubai (UAE)', areas: ['Downtown Dubai', 'Marina', 'Deira', 'Business Bay'] },
      { name: 'New York (USA)', areas: ['Manhattan', 'Brooklyn', 'Queens'] },
    ],
  },
]

export default function LocationModal({ isOpen, onClose, currentLocation, onSelectLocation }) {
  const [search, setSearch] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [activeRegionTab, setActiveRegionTab] = useState(REGIONS_DATA[0].region)

  if (!isOpen) return null

  // Flatten all searchable items
  const allLocations = []
  REGIONS_DATA.forEach((reg) => {
    reg.cities.forEach((c) => {
      allLocations.push({ type: 'city', name: c.name, city: c.name, region: reg.region })
      c.areas.forEach((a) => {
        allLocations.push({ type: 'area', name: a, city: c.name, region: reg.region })
      })
    })
  })

  const searchLower = search.trim().toLowerCase()
  const searchResults = searchLower
    ? allLocations.filter(
        (l) =>
          l.name.toLowerCase().includes(searchLower) ||
          l.city.toLowerCase().includes(searchLower) ||
          l.region.toLowerCase().includes(searchLower)
      )
    : []

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
            data.address?.state ||
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

  const selectedRegion = REGIONS_DATA.find((r) => r.region === activeRegionTab) || REGIONS_DATA[0]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Choose Discovery Location</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Filter businesses, stores, and hotels by your city or neighborhood
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search input inside modal */}
        <form onSubmit={handleCustomSubmit} style={{ marginTop: '16px' }}>
          <div
            className="search-input-wrap"
            style={{
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              background: 'var(--bg-muted)',
            }}
          >
            <span style={{ fontSize: '16px' }}>🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search any city, neighborhood or state (e.g. Abuja, Lekki, Accra, Dubai)…"
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
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: 'center', gap: '8px', fontSize: '13px' }}
            onClick={handleDetect}
            disabled={detecting}
          >
            <span>🎯</span>
            <span>{detecting ? 'Detecting GPS…' : 'Use Current Location'}</span>
          </button>
          <button
            type="button"
            className={`btn ${currentLocation === 'Everywhere' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '13px' }}
            onClick={() => {
              onSelectLocation('Everywhere')
              onClose()
            }}
          >
            🌐 All Regions
          </button>
        </div>

        {/* If Searching, show direct match results */}
        {search.trim() ? (
          <div style={{ marginTop: '20px', maxHeight: '320px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Search Matches ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No predefined area found for “{search}”.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    onSelectLocation(search.trim())
                    onClose()
                  }}
                >
                  Search in “{search.trim()}” anyway →
                </button>
              </div>
            ) : (
              <div className="location-grid">
                {searchResults.slice(0, 30).map((item, idx) => (
                  <button
                    key={idx}
                    className={`location-chip ${
                      currentLocation.toLowerCase() === item.name.toLowerCase() ? 'active' : ''
                    }`}
                    onClick={() => {
                      onSelectLocation(item.name)
                      onClose()
                    }}
                  >
                    📍 {item.name}{' '}
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>
                      ({item.type === 'area' ? item.city : item.region.split('—')[0]})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Structured Regional Explorer */
          <div style={{ marginTop: '20px' }}>
            {/* Region Tabs */}
            <div className="location-region-tabs">
              {REGIONS_DATA.map((r) => (
                <button
                  key={r.region}
                  type="button"
                  className={`region-tab-btn ${activeRegionTab === r.region ? 'active' : ''}`}
                  onClick={() => setActiveRegionTab(r.region)}
                >
                  {r.region}
                </button>
              ))}
            </div>

            {/* Cities and Areas List */}
            <div className="location-cities-container" style={{ maxHeight: '280px', overflowY: 'auto', marginTop: '14px', paddingRight: '4px' }}>
              {selectedRegion.cities.map((cityObj) => (
                <div key={cityObj.name} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <button
                      type="button"
                      className={`city-header-btn ${currentLocation.toLowerCase() === cityObj.name.toLowerCase() ? 'active' : ''}`}
                      onClick={() => {
                        onSelectLocation(cityObj.name)
                        onClose()
                      }}
                    >
                      🏙️ <strong>{cityObj.name}</strong> (Entire City)
                    </button>
                  </div>

                  <div className="location-grid">
                    {cityObj.areas.map((area) => {
                      const isSelected =
                        currentLocation.toLowerCase() === area.toLowerCase() ||
                        currentLocation.toLowerCase() === `${area}, ${cityObj.name}`.toLowerCase()
                      return (
                        <button
                          key={area}
                          type="button"
                          className={`location-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            onSelectLocation(area)
                            onClose()
                          }}
                        >
                          📍 {area}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
