import { getSuggestedCategories } from '../services/openrouterService'

const POPULAR_SEARCHES = [
  { icon: '🏨', text: 'Popular hotels in Nigeria', cat: 'Hotel & Travel' },
  { icon: '🍽️', text: 'Top restaurants & fine dining', cat: 'Restaurant' },
  { icon: '👟', text: 'Nike shoes near me', cat: 'Fashion & Clothing' },
  { icon: '📱', text: 'iPhone & phone repair', cat: 'Electronics & Tech' },
  { icon: '💇‍♀️', text: 'Hair salon & barbershop', cat: 'Beauty & Salon' },
  { icon: '🎂', text: 'Birthday cakes & bakery', cat: 'Food & Drink' },
  { icon: '🔧', text: 'Mechanic & auto repair', cat: 'Auto Repair' },
]

export default function SearchSuggestions({ query, onSelectSuggestion, onClose }) {
  const categories = getSuggestedCategories()

  const filteredCategories = query.trim()
    ? categories.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : categories.slice(0, 4)

  const filteredPopular = query.trim()
    ? POPULAR_SEARCHES.filter((p) => p.text.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : POPULAR_SEARCHES.slice(0, 4)

  return (
    <div className="search-suggestions-dropdown" onMouseDown={(e) => e.preventDefault()}>
      {filteredPopular.length > 0 && (
        <div>
          <div className="suggestion-section-title">Popular Searches</div>
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
                <span className="suggestion-icon">{item.icon}</span>
                <span>{item.text}</span>
              </div>
              <span className="suggestion-category">{item.cat}</span>
            </div>
          ))}
        </div>
      )}

      {filteredCategories.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="suggestion-section-title">Categories</div>
          {filteredCategories.map((cat, idx) => (
            <div
              key={idx}
              className="suggestion-item"
              onClick={() => {
                onSelectSuggestion(cat)
                onClose()
              }}
            >
              <div className="suggestion-left">
                <span className="suggestion-icon">📂</span>
                <span>{cat}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Browse category</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
