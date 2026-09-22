import { getSuggestedCategories } from '../services/openrouterService'

const POPULAR_SEARCHES = [
  { icon: 'fa-solid fa-hotel', text: 'Popular hotels in Nigeria', cat: 'Hotels', color: '#3b82f6' },
  { icon: 'fa-solid fa-utensils', text: 'Top restaurants & fine dining', cat: 'Dining', color: '#ee5d36' },
  { icon: 'fa-solid fa-shirt', text: 'Nike shoes near me', cat: 'Fashion', color: '#8b5cf6' },
  { icon: 'fa-solid fa-mobile-screen', text: 'iPhone & gadget repair', cat: 'Tech', color: '#10b981' },
  { icon: 'fa-solid fa-scissors', text: 'Hair salon & barbershop', cat: 'Beauty', color: '#ec4899' },
  { icon: 'fa-solid fa-car', text: 'Mechanic & auto parts', cat: 'Auto', color: '#f59e0b' },
]

const CATEGORY_ICON_MAP = {
  'Hotel': 'fa-solid fa-hotel',
  'Restaurant': 'fa-solid fa-utensils',
  'Tech': 'fa-solid fa-mobile-screen',
  'Electronic': 'fa-solid fa-laptop',
  'Fashion': 'fa-solid fa-shirt',
  'Beauty': 'fa-solid fa-scissors',
  'Food': 'fa-solid fa-bowl-food',
  'Drink': 'fa-solid fa-mug-hot',
  'Auto': 'fa-solid fa-car',
  'Nightlife': 'fa-solid fa-martini-glass',
}

function getCategoryIcon(cat) {
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (cat.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return 'fa-solid fa-tag'
}

export default function SearchSuggestions({ query, onSelectSuggestion, onClose }) {
  const categories = getSuggestedCategories()

  const filteredCategories = query.trim()
    ? categories.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : categories.slice(0, 6)

  const filteredPopular = query.trim()
    ? POPULAR_SEARCHES.filter((p) => p.text.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : POPULAR_SEARCHES.slice(0, 4)

  return (
    <div className="search-suggestions-dropdown" onMouseDown={(e) => e.preventDefault()}>
      {/* Section 1: Popular Searches */}
      {filteredPopular.length > 0 && (
        <div style={{ padding: '8px 0 6px 0' }}>
          <div className="suggestion-section-title">
            <i className="fa-solid fa-fire" style={{ color: 'var(--brand-primary)', marginRight: '6px' }} />
            Popular Searches
          </div>
          {filteredPopular.map((item, idx) => (
            <div
              key={idx}
              className="suggestion-item"
              onClick={() => {
                onSelectSuggestion(item.text)
                onClose()
              }}
            >
              <div className="suggestion-left">
                <div
                  className="suggestion-icon-circle"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  <i className={item.icon} />
                </div>
                <span className="suggestion-text">{item.text}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="suggestion-category">{item.cat}</span>
                <i className="fa-solid fa-arrow-right suggestion-arrow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Quick Categories Pills */}
      {filteredCategories.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '10px 16px 14px 16px' }}>
          <div className="suggestion-section-title" style={{ padding: '0 0 10px 0' }}>
            <i className="fa-solid fa-compass" style={{ color: 'var(--accent-petrol)', marginRight: '6px' }} />
            Browse Categories
          </div>

          <div className="suggestion-chips-grid">
            {filteredCategories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip-btn"
                onClick={() => {
                  onSelectSuggestion(cat)
                  onClose()
                }}
              >
                <i className={getCategoryIcon(cat)} style={{ color: 'var(--brand-primary)', fontSize: '12px' }} />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

