import { useState, useEffect } from 'react'
import LocationSelector from './LocationSelector'
import SearchSuggestions from './SearchSuggestions'
import { aiVoice } from '../utils/aiVoiceAssistant'

const PLACEHOLDERS = [
  'Type what you need, e.g. "Sneakers in Lagos"…',
  'Type: "Best restaurants in Abuja" or tap the mic…',
  'Type: "iPhone repair in Ikeja"…',
  'Type: "Custom cakes in Asaba"…',
  'Type: "Luxury salon & spa near me"…',
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
  const [isListening, setIsListening] = useState(false)

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

  const handleToggleVoice = () => {
    if (isListening) {
      aiVoice.stopListening()
      setIsListening(false)
      return
    }

    setIsListening(true)
    aiVoice.startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setIsListening(false)
        if (transcript) {
          setQuery(transcript)
          if (onSearch) onSearch(transcript)
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    })
  }

  return (
    <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <form className="purr-search-box" onSubmit={handleSubmit}>
        {/* Search Icon */}
        <span style={{ color: 'var(--text-muted)', fontSize: '15px', marginRight: '8px' }}>
          <i className="fa-solid fa-magnifying-glass" />
        </span>

        {/* Query Input */}
        <input
          type="text"
          className="purr-search-input"
          placeholder={PLACEHOLDERS[placeholderIndex]}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          autoFocus={autoFocus}
        />

        {/* Clear text button */}
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setQuery('')}
            title="Clear text"
            style={{ marginRight: '4px' }}
          >
            ✕
          </button>
        )}

        {/* Voice Search Microphone Button */}
        <button
          type="button"
          className={`search-voice-btn ${isListening ? 'listening-pulse' : ''}`}
          onClick={handleToggleVoice}
          title={isListening ? 'Listening… speak your search' : 'Search with AI voice'}
          style={{
            background: isListening ? '#ef4444' : 'transparent',
            color: isListening ? '#ffffff' : 'var(--brand-primary)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginRight: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <i className={isListening ? 'fa-solid fa-microphone-lines fa-fade' : 'fa-solid fa-microphone'} />
        </button>

        {/* Integrated Location Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {setLocation && (
            <LocationSelector
              currentLocation={location}
              onLocationChange={(newLoc) => setLocation(newLoc)}
            />
          )}

          {/* Clean Coral Submit Button */}
          <button
            type="submit"
            className="purr-search-btn"
            disabled={loading}
            title="Search"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i className="fa-solid fa-arrow-right" />
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete Search Suggestions */}
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

