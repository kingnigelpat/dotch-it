import { useState, useMemo } from 'react'
import { NIGERIA_LOCATIONS, ALL_STATES, POPULAR_STATES } from '../data/nigeriaLocations'
import { getBrowserCurrentPosition } from '../services/geolocationService'

export default function LocationModal({ isOpen, onClose, currentLocation = 'Lagos', onSelectLocation }) {
  // Sanitize location: if hyphenated from legacy data, take the first part
  const safeLocation = useMemo(() => {
    if (!currentLocation || typeof currentLocation !== 'string') return 'Lagos'
    const trimmed = currentLocation.trim()
    if (trimmed.includes('-')) {
      return trimmed.split('-')[0].trim()
    }
    return trimmed
  }, [currentLocation])

  const [step, setStep] = useState(1) // 1: Which State?, 2: Which City?
  const [selectedState, setSelectedState] = useState(safeLocation !== 'Everywhere' ? safeLocation : 'Lagos')
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

  // Handlers - Return strictly single location names
  const handleSelectState = (stateName) => {
    setSelectedState(stateName)
    setCitySearch('')
    setStep(2) // Move to Step 2: Choose city or entire state
  }

  const handleSelectCity = (cityName) => {
    if (onSelectLocation) onSelectLocation(cityName)
    if (onClose) onClose()
  }

  const handleSelectEntireState = (stateName) => {
    const st = stateName || selectedState
    if (onSelectLocation) onSelectLocation(st)
    if (onClose) onClose()
  }

  const handleSelectEverywhere = () => {
    if (onSelectLocation) onSelectLocation('Everywhere')
    if (onClose) onClose()
  }

  const handleDetect = async () => {
    setDetecting(true)
    try {
      const pos = await getBrowserCurrentPosition()
      const locationName = pos.city || pos.state || pos.locationName || 'Lagos'
      if (onSelectLocation) onSelectLocation(locationName)
      if (onClose) onClose()
    } catch (err) {
      alert(err.message || 'Could not detect your current location. Please select your city or state from the list.')
    } finally {
      setDetecting(false)
    }
  }

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
                {step === 1 ? 'Step 1 of 2: Select State' : `Step 2 of 2: ${selectedState} State`}
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {step === 1 ? '1️⃣ Which State are you searching in?' : `2️⃣ Select City or Entire ${selectedState} State`}
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
            🌐 All of Nigeria (Everywhere)
          </button>
        </div>

        {/* ==================================================================== */}
        {/* STEP 1: WHICH STATE? */}
        {/* ==================================================================== */}
        {step === 1 && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
            {/* Search Input for States/Cities */}
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
                placeholder="Type state or city (e.g. Delta, Lagos, Abuja, Asaba, Warri)…"
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

            {/* Direct City Matches (if user typed a specific city like "Asaba" or "Lekki") */}
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
                    const isCurrent = safeLocation.toLowerCase() === stateName.toLowerCase()
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
                    onClick={() => handleSelectCity(stateSearch.trim())}
                  >
                    Select “{stateSearch.trim()}” →
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
                    const isSelected = safeLocation.toLowerCase() === stateName.toLowerCase()

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
        {/* STEP 2: WHICH CITY OR ENTIRE STATE? */}
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

            {/* Primary Action: Select Entire State */}
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className={`btn btn-block ${safeLocation.toLowerCase() === selectedState.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  background: safeLocation.toLowerCase() === selectedState.toLowerCase() ? undefined : 'var(--bg-surface)',
                }}
                onClick={() => handleSelectEntireState(selectedState)}
              >
                📍 Select All of {selectedState} State
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

            {/* Cities Grid */}
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Cities in {selectedState} ({filteredCities.length}):
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
                  Select “{citySearch.trim()}” →
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
                  const isSelected = safeLocation.toLowerCase() === cityName.toLowerCase()

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
