import { useState, useEffect } from 'react'
import LocationSelector from './LocationSelector'
import SearchSuggestions from './SearchSuggestions'

const PLACEHOLDERS = [
  'Nike shoes around Lagos…',
  'Best restaurants in Asaba…',
  'iPhone repair near me…',
  'Birthday cakes in Lekki…',
  'Who sells basketball shoes in Warri?…',
  'Hair salon in Ikeja…',
]

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  location,
  setLocation,
  loading,
  autoFocus = false,
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e) => {
    e?.preventDefault()
    setFocused(false)
    if (onSearch) onSearch()
  }

  const handleSelectSuggestion = (text) => {
    setQuery(text)
    if (onSearch) onSearch(text)
  }

  return (
    <div className="search-container">
      <form className="search-box" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={PLACEHOLDERS[placeholderIndex]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            autoFocus={autoFocus}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery('')}
              title="Clear text"
            >
              ✕
            </button>
          )}
        </div>

        <div className="search-box-actions">
          <LocationSelector
            currentLocation={location}
            onLocationChange={(newLoc) => setLocation(newLoc)}
          />

          <button
            type="submit"
            className="btn btn-primary search-submit-btn"
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {focused && (
        <SearchSuggestions
          query={query}
          onSelectSuggestion={handleSelectSuggestion}
          onClose={() => setFocused(false)}
        />
      )}
    </div>
  )
}
