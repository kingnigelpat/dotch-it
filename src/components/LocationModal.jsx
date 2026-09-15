import { useState, useMemo } from 'react'
import { NIGERIA_LOCATIONS, ALL_STATES, POPULAR_STATES } from '../data/nigeriaLocations'

export default function LocationModal({ isOpen, onClose, currentLocation = 'Lagos', onSelectLocation }) {
  const safeLocation = typeof currentLocation === 'string' ? currentLocation.trim() : 'Lagos'

  // Parse existing location into State and City if available
  const parsed = useMemo(() => {
    if (!safeLocation) return { state: 'Lagos', city: '' }
    const parts = safeLocation.split('-').map((s) => s.trim())
    return {
      state: parts[0] || 'Lagos',
      city: parts[1] || '',
    }
  }, [safeLocation])

  const [step, setStep] = useState(1) // 1: Which State?, 2: Which City?
  const [selectedState, setSelectedState] = useState(parsed.state || 'Lagos')
  const [stateSearch, setStateSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [detecting, setDetecting] = useState(false)

  // Direct global search for any city/area across all Nigeria
  const globalCityMatches = useMemo(() => {
    const q = stateSearch.trim().toLowerCase()
    if (!q || q.length < 2) return []
    const results = []
    NIGERIA_LOCATIONS.forEach((st) => {
      (st.cities || []).forEach((ct) => {
        if (ct.toLowerCase().includes(q)) {
          results.push({ state: st.state, city: ct })
        }
      })
    })
    return results.slice(0, 10)
  }, [stateSearch])

  // Current state object
  const stateData = useMemo(() => {
    const found = NIGERIA_LOCATIONS.find(
      (item) => (item.state || '').toLowerCase() === (selectedState || '').toLowerCase()
    )
    return found || NIGERIA_LOCATIONS[0]
  }, [selectedState])

  // Filter states based on search in Step 1
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase()
    return ALL_STATES.filter((s) => s.toLowerCase().includes(q))
  }, [stateSearch])

  // Filter cities in Step 2
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase()
    return (stateData?.cities || []).filter((c) => c.toLowerCase().includes(q))
  }, [stateData, citySearch])

  // Handlers
  const handleSelectState = (stateName) => {
    setSelectedState(stateName)
    setCitySearch('')
    setStep(2) // Move to Step 2: Which city?
  }

  const handleSelectCity = (cityName) => {
    const formatted = `${selectedState} - ${cityName}`
    if (onSelectLocation) onSelectLocation(formatted)
    if (onClose) onClose()
  }

  const handleSelectEntireState = () => {
    if (onSelectLocation) onSelectLocation(selectedState)
    if (onClose) onClose()
  }

  const handleSelectEverywhere = () => {
    if (onSelectLocation) onSelectLocation('Everywhere')
    if (onClose) onClose()
  }

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
          const detectedCity =
            data.address?.city ||
            data.address?.city_district ||
            data.address?.town ||
            data.address?.suburb ||
            'Ikeja'
          const detectedState = data.address?.state || 'Lagos'

          // Clean state name
          const matchState = NIGERIA_LOCATIONS.find((s) =>
            detectedState.toLowerCase().includes((s.state || '').toLowerCase())
          )

          if (matchState) {
            if (onSelectLocation) onSelectLocation(`${matchState.state} - ${detectedCity}`)
          } else {
            if (onSelectLocation) onSelectLocation(`Lagos - ${detectedCity}`)
          }
          if (onClose) onClose()
        } catch {
          if (onSelectLocation) onSelectLocation('Lagos')
          if (onClose) onClose()
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

  // ALL HOOKS ARE CALLED ABOVE. Only now can we conditionally return null.
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content location-stepper-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header with Step Indicator */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge-pill explorer-badge" style={{ fontSize: '11px', fontWeight: 800 }}>
                {step === 1 ? 'Step 1 of 2: Which State?' : `Step 2 of 2: Which City in ${selectedState}?`}
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {step === 1 ? '1️⃣ Which State are you searching in?' : `2️⃣ Which City / Area in ${selectedState}?`}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Global Action Bar (GPS & Everywhere) */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ flex: 1, minWidth: '160px', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
            onClick={handleDetect}
            disabled={detecting}
          >
            <span>🎯</span>
            <span>{detecting ? 'Detecting GPS…' : 'Use Current GPS'}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${safeLocation === 'Everywhere' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '13px' }}
            onClick={handleSelectEverywhere}
          >
            🌐 All of Nigeria
          </button>
        </div>

        {/* ==================================================================== */}
        {/* STEP 1: WHICH STATE? */}
        {/* ==================================================================== */}
        {step === 1 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
            {/* Search Input for States */}
            <div
              className="search-input-wrap"
              style={{
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 14px',
                background: 'var(--bg-muted)',
                marginBottom: '14px',
              }}
            >
              <span style={{ fontSize: '15px' }}>🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Type state or city (e.g. Lagos, Abuja, Lekki, Port Harcourt)…"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                autoFocus
              />
              {stateSearch && (
                <button type="button" className="search-clear" onClick={() => setStateSearch('')}>
                  ✕
                </button>
              )}
            </div>

            {/* Direct City Matches (if user typed a specific city like "Lekki") */}
            {globalCityMatches.length > 0 && (
              <div style={{ marginBottom: '16px', background: 'var(--brand-light)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  🎯 Direct City Matches:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {globalCityMatches.map((m) => (
                    <button
                      key={`${m.state}-${m.city}`}
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ background: 'var(--bg-surface)', fontSize: '13px', fontWeight: 700 }}
                      onClick={() => handleSelectCity(m.city)}
                    >
                      📍 <strong>{m.city}</strong> ({m.state})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular States Quick Chips */}
            {!stateSearch && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  🔥 Popular States:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {POPULAR_STATES.map((stateName) => {
                    const isCurrent = (parsed.state || '').toLowerCase() === stateName.toLowerCase()
                    return (
                      <button
                        key={stateName}
                        type="button"
                        className={`chip-tag ${isCurrent ? 'chip-tag-active' : ''}`}
                        style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 700 }}
                        onClick={() => handleSelectState(stateName)}
                      >
                        {stateName} →
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All 36 States + FCT Grid */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                {stateSearch ? `Matching States (${filteredStates.length}):` : 'All 36 States + FCT:'}
              </div>

              {filteredStates.length === 0 && globalCityMatches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                  <p>No state matching “{stateSearch}”.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '10px' }}
                    onClick={() => {
                      if (onSelectLocation) onSelectLocation(stateSearch.trim())
                      if (onClose) onClose()
                    }}
                  >
                    Search in “{stateSearch.trim()}” anyway →
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {filteredStates.map((stateName) => {
                    const stObj = NIGERIA_LOCATIONS.find((n) => n.state === stateName)
                    const count = stObj?.cities?.length || 0
                    const isSelected = (parsed.state || '').toLowerCase() === stateName.toLowerCase()

                    return (
                      <button
                        key={stateName}
                        type="button"
                        className={`location-chip ${isSelected ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          textAlign: 'left',
                        }}
                        onClick={() => handleSelectState(stateName)}
                      >
                        <span style={{ fontWeight: 700 }}>{stateName}</span>
                        <span style={{ fontSize: '11px', opacity: 0.65 }}>{count} cities →</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: WHICH CITY IN SELECTED STATE? */}
        {/* ==================================================================== */}
        {step === 2 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
            {/* Back button & State indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '12px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📍</span>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                    Selected State:
                  </div>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                    {selectedState}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setStep(1)
                  setStateSearch('')
                }}
                style={{ fontSize: '12px', fontWeight: 700 }}
              >
                ← Change State
              </button>
            </div>

            {/* City Search Filter */}
            <div
              className="search-input-wrap"
              style={{
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 14px',
                background: 'var(--bg-muted)',
                marginBottom: '14px',
              }}
            >
              <span style={{ fontSize: '15px' }}>🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder={`Search cities or areas in ${selectedState}…`}
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                autoFocus
              />
              {citySearch && (
                <button type="button" className="search-clear" onClick={() => setCitySearch('')}>
                  ✕
                </button>
              )}
            </div>

            {/* Priority Option: Entire State (All Cities) */}
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className={`btn btn-block ${(safeLocation || '').toLowerCase() === (selectedState || '').toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  background: (safeLocation || '').toLowerCase() === (selectedState || '').toLowerCase() ? undefined : 'var(--bg-surface)',
                }}
                onClick={handleSelectEntireState}
              >
                📍 Entire {selectedState} (All Cities)
              </button>
            </div>

            {/* Cities Grid */}
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Cities & Commercial Areas in {selectedState} ({filteredCities.length}):
            </div>

            {filteredCities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                <p>No area named “{citySearch}” in {selectedState}.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '10px' }}
                  onClick={() => handleSelectCity(citySearch.trim())}
                >
                  Use “{selectedState} - {citySearch.trim()}” anyway →
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '8px',
                }}
              >
                {filteredCities.map((cityName) => {
                  const targetFormatted = `${selectedState} - ${cityName}`
                  const isSelected =
                    (safeLocation || '').toLowerCase() === targetFormatted.toLowerCase() ||
                    (safeLocation || '').toLowerCase() === cityName.toLowerCase()

                  return (
                    <button
                      key={cityName}
                      type="button"
                      className={`location-chip ${isSelected ? 'active' : ''}`}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '13.5px',
                      }}
                      onClick={() => handleSelectCity(cityName)}
                    >
                      📍 {cityName}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
