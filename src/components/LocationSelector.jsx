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

  // Sanitize any legacy hyphenated location values
  const cleanLoc = (currentLocation || '').includes('-')
    ? currentLocation.split('-')[0].trim()
    : currentLocation

  const isEverywhere = !cleanLoc || cleanLoc === 'Everywhere' || cleanLoc === 'All of Nigeria' || cleanLoc === 'All Locations'

  return (
    <>
      <button
        type="button"
        className="location-pill-btn"
        onClick={handleOpen}
        title="Select search location (City or State)"
      >
        <span style={{ color: 'var(--brand-primary)', fontSize: '14px' }}>
          {isEverywhere ? '🌐' : '📍'}
        </span>
        <span className="location-pill-text">
          {isEverywhere ? 'All Locations' : cleanLoc}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>▼</span>
      </button>

      {modalOpen && (
        <LocationModal
          isOpen={true}
          onClose={handleClose}
          currentLocation={cleanLoc || 'Everywhere'}
          onSelectLocation={handleSelect}
        />
      )}
    </>
  )
}
