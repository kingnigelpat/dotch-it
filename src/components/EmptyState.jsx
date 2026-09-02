const NEARBY_LOCATIONS = [
  { name: 'Ikeja', distance: '4.2 km' },
  { name: 'Yaba', distance: '7.1 km' },
  { name: 'Surulere', distance: '9.4 km' },
  { name: 'Lekki', distance: '12.0 km' },
  { name: 'Victoria Island', distance: '14.5 km' },
]

export default function EmptyState({ location, query, onSelectNearby }) {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon">📍</div>
      <h3 className="empty-state-title">
        Nothing exact around {location || 'your area'}
      </h3>
      <p className="empty-state-subtitle">
        We couldn't find an exact seller matching “{query}” in {location || 'your selected location'}.
      </p>

      <div style={{ marginTop: '20px' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Try searching nearby areas:
        </p>

        <div className="nearby-chips-wrap">
          {NEARBY_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              className="chip-tag"
              onClick={() => onSelectNearby(loc.name)}
            >
              📍 {loc.name} · <span style={{ color: 'var(--text-muted)' }}>{loc.distance}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
