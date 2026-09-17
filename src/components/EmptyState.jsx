import { Link } from 'react-router-dom'

export default function EmptyState({ location, query, onSelectEverywhere }) {
  const isLocSpecific = location && location !== 'Everywhere' && location !== 'All of Nigeria' && location !== 'All Locations'

  return (
    <div className="empty-state-box">
      <div className="empty-state-icon">📍</div>
      <h3 className="empty-state-title">
        {query
          ? `No results for “${query}” ${isLocSpecific ? `in ${location}` : ''}`
          : isLocSpecific
          ? `No businesses found in ${location} yet`
          : 'No businesses found'}
      </h3>

      <p className="empty-state-subtitle">
        {query
          ? `We couldn't find any businesses or services matching “${query}” ${isLocSpecific ? `in ${location}` : 'in our directory'}. Try broader keywords or search nationwide.`
          : isLocSpecific
          ? `There are currently no verified listings registered in ${location}. Try searching across All of Nigeria, or be the first vendor to list your business here!`
          : 'Try adjusting your search criteria or selecting a different category.'}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
        {isLocSpecific && onSelectEverywhere && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onSelectEverywhere}
          >
            🌐 Search All of Nigeria
          </button>
        )}
        <Link to="/list-business" className="btn btn-outline btn-sm">
          🏪 List a Business {isLocSpecific ? `in ${location}` : ''} →
        </Link>
      </div>
    </div>
  )
}
