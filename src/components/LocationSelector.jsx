import { useState } from 'react'
import LocationModal from './LocationModal'

export default function LocationSelector({ currentLocation, onLocationChange }) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpen = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
  }

  const handleSelect = (newLoc) => {
    if (onLocationChange) onLocationChange(newLoc)
    setModalOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="location-pill-btn"
        onClick={handleOpen}
        title="Search in a specific location (State - City)"
      >
        <span style={{ color: 'var(--brand-primary)', fontSize: '14px' }}>📍</span>
        <span className="location-pill-text">{currentLocation || 'Lagos'}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>▼</span>
      </button>

      {modalOpen && (
        <LocationModal
          isOpen={true}
          onClose={handleClose}
          currentLocation={currentLocation || 'Lagos'}
          onSelectLocation={handleSelect}
        />
      )}
    </>
  )
}
