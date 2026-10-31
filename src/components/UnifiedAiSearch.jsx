import { useState, useEffect, useRef } from 'react'
import LocationSelector from './LocationSelector'
import SearchSuggestions from './SearchSuggestions'
import { aiVoice } from '../utils/aiVoiceAssistant'

const PLACEHOLDERS = [
  'Type what you need, e.g. "Sneakers in Lagos"…',
  'Type: "Best restaurant in Abuja" or tap the mic…',
  'Type: "iPhone repair in Ikeja"…',
  'Type: "Custom cakes in Asaba"…',
  'Type: "Luxury salon & spa near me"…',
]

const QUICK_PROMPTS = [
  { icon: '👟', label: 'Sneakers & Shoes', query: 'Sneakers' },
  { icon: '📱', label: 'iPhone & Tech Repair', query: 'iPhone tech repair' },
  { icon: '🎂', label: 'Cakes & Bakery', query: 'Custom cakes bakery' },
  { icon: '🍲', label: 'Local Food & Chow', query: 'Local restaurant food' },
  { icon: '🚗', label: 'Auto Mechanic', query: 'Car auto repair' },
  { icon: '💆', label: 'Beauty & Spa', query: 'Beauty salon spa' },
]

export default function UnifiedAiSearch({
  query,
  setQuery,
  onSearch,
  location,
  setLocation,
  loading,
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('dotch_ai_voice_enabled') === 'true'
    }
    return false
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [])

  // Auto-play Ada's female voice if previously authorized
  useEffect(() => {
    if (voiceEnabled && !aiVoice.hasSpokenGreeting) {
      handlePlayVoice()
    }
  }, [voiceEnabled])

  const handlePlayVoice = () => {
    if (isSpeaking) {
      aiVoice.stopSpeaking()
      setIsSpeaking(false)
      return
    }

    setVoiceEnabled(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dotch_ai_voice_enabled', 'true')
    }

    setIsSpeaking(true)
    aiVoice.speakGreeting({
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    })
  }

  const handleToggleMic = () => {
    if (isListening) {
      aiVoice.stopListening()
      setIsListening(false)
      return
    }

    aiVoice.stopSpeaking()
    setIsSpeaking(false)
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

  const handleSubmit = (e) => {
    e?.preventDefault()
    setFocused(false)
    if (onSearch) onSearch(query)
  }

  const handleSelectPrompt = (promptQuery) => {
    setQuery(promptQuery)
    if (onSearch) onSearch(promptQuery)
  }

  return (
    <div className="unified-ai-hero-container">
      {/* 🔮 Ada Luminous Neural Orb & Persona */}
      <div className="ai-persona-stage">
        <div className="ai-orb-ambient-glow" />

        <div
          className={`ai-neural-orb ${isSpeaking ? 'is-speaking' : ''} ${isListening ? 'is-listening' : ''}`}
          onClick={handlePlayVoice}
          title={isSpeaking ? 'Click to stop voice' : "Click to hear Ada's female voice"}
        >
          <div className="ai-orb-core">
            <i className={isListening ? 'fa-solid fa-microphone-lines' : isSpeaking ? 'fa-solid fa-volume-high' : 'fa-solid fa-sparkles'} />
          </div>
          <div className="ai-orb-pulse-rings" />
        </div>

        <div className="ai-persona-meta">
          <div className="ai-pill-tag">
            <span className="live-pulse-dot" style={{ background: '#ec4899' }} />
            <span>ADA · FEMALE AI DISCOVERY GUIDE</span>
          </div>

          <h1 className="ai-greeting-title">
            &ldquo;What kind of business are you looking for?&rdquo;
          </h1>

          <p className="ai-greeting-caption">
            Type your inquiry below or tap the microphone to talk back
          </p>
        </div>
      </div>

      {/* ⚡ Unified AI Command Capsule */}
      <div className="ai-command-capsule-wrapper">
        <form className={`ai-command-capsule ${focused ? 'is-focused' : ''}`} onSubmit={handleSubmit}>
          {/* AI Sparkle Icon */}
          <span className="ai-capsule-icon">
            <i className="fa-solid fa-wand-magic-sparkles" />
          </span>

          {/* Typing Input */}
          <input
            type="text"
            className="ai-capsule-input"
            placeholder={PLACEHOLDERS[placeholderIndex]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              className="ai-capsule-clear"
              onClick={() => setQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Controls Tray: Location, Voice, Mic, Submit */}
          <div className="ai-capsule-controls">
            {/* Location Selector */}
            {setLocation && (
              <div className="ai-capsule-loc">
                <LocationSelector
                  currentLocation={location}
                  onLocationChange={(newLoc) => setLocation(newLoc)}
                />
              </div>
            )}

            {/* Ada Female Voice Toggle */}
            <button
              type="button"
              className={`ai-ctrl-btn ${isSpeaking ? 'active-voice' : ''}`}
              onClick={handlePlayVoice}
              title={isSpeaking ? "Stop Ada's voice" : "Play Ada's female voice"}
              aria-label="Play Ada voice"
            >
              <i className={isSpeaking ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'} />
              <span className="btn-text-desktop">{isSpeaking ? 'Stop' : 'Voice'}</span>
            </button>

            {/* Talk Back Microphone Button */}
            <button
              type="button"
              className={`ai-ctrl-btn mic-btn ${isListening ? 'active-listening' : ''}`}
              onClick={handleToggleMic}
              title={isListening ? 'Listening… Tap to finish' : 'Talk back with your voice'}
              aria-label="Microphone talk back"
            >
              <i className={isListening ? 'fa-solid fa-microphone-lines fa-fade' : 'fa-solid fa-microphone'} />
              <span className="btn-text-desktop">{isListening ? 'Listening…' : 'Speak'}</span>
            </button>

            {/* Submit Arrow Button */}
            <button
              type="submit"
              className="ai-submit-arrow"
              disabled={loading}
              title="Send to AI Search"
              aria-label="Search"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin" />
              ) : (
                <i className="fa-solid fa-arrow-right" />
              )}
            </button>
          </div>
        </form>

        {/* Autocomplete Suggestions */}
        {focused && (
          <SearchSuggestions
            query={query}
            onSelectSuggestion={(text) => {
              setQuery(text)
              if (onSearch) onSearch(text)
            }}
            onClose={() => setFocused(false)}
          />
        )}
      </div>

      {/* 🌊 Dynamic Ada Soundwave Equalizer (Visible when Ada speaks) */}
      {isSpeaking && (
        <div className="ai-voice-equalizer-wrap">
          <div className="ai-soundwave-bars">
            <span className="eq-bar eq-1" />
            <span className="eq-bar eq-2" />
            <span className="eq-bar eq-3" />
            <span className="eq-bar eq-4" />
            <span className="eq-bar eq-5" />
            <span className="eq-bar eq-6" />
            <span className="eq-bar eq-7" />
          </div>
          <span className="ai-speaking-text">Ada is speaking… &ldquo;What kind of business are you looking for?&rdquo;</span>
          <button
            type="button"
            className="ai-banner-action-btn"
            onClick={handlePlayVoice}
            title="Mute voice"
          >
            Mute
          </button>
        </div>
      )}

      {/* 🎙️ Dynamic Listening Visualizer (Visible when user talks back) */}
      {isListening && (
        <div className="ai-listening-pulse-wrap">
          <div className="ai-listening-ripple">
            <span className="live-pulse-dot" style={{ background: '#10b981', width: '10px', height: '10px' }} />
          </div>
          <span className="ai-listening-text">
            Ada is listening… Speak clearly (e.g. &ldquo;Nike sneakers in Ikeja&rdquo;)
          </span>
          <button
            type="button"
            className="ai-banner-action-btn cancel"
            onClick={handleToggleMic}
            title="Cancel microphone"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 💡 Instant Inquiry Prompt Chips */}
      <div className="ai-prompt-chips-tray">
        <span className="ai-chips-label">Try Asking:</span>
        <div className="ai-chips-list">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-suggestion-chip"
              onClick={() => handleSelectPrompt(item.query)}
            >
              <span className="chip-icon">{item.icon}</span>
              <span className="chip-text">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
