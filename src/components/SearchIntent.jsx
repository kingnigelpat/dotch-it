export default function SearchIntent({ intent, location, query }) {
  if (!intent && !query) return null

  return (
    <div className="intent-badge">
      <span className="intent-badge-icon">✨</span>
      <span>Looking for:</span>
      <span className="intent-badge-tag">
        {intent || query}
      </span>
      {location && (
        <>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>📍 {location}</span>
        </>
      )}
    </div>
  )
}
