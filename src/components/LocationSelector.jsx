import { useState } from 'react'
import LocationModal from './LocationModal'

export default function LocationSelector({ currentLocation, onLocationChange }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="location-pill-btn"
        onClick={() => setModalOpen(true)}
        title="Search in a specific location"
      >
        <span style={{ color: 'var(--brand-primary)' }}>📍</span>
        <span className="location-pill-text">{currentLocation || 'Lagos'}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>▼</span>
      </button>

      <LocationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={onLocationChange}
      />
    </>
  )
}
