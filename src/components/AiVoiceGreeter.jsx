import { useState, useEffect } from 'react'
import { aiVoice } from '../utils/aiVoiceAssistant'

export default function AiVoiceGreeter({ onVoiceQuery }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceAllowed, setVoiceAllowed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('dotch_ai_voice_enabled') === 'true'
    }
    return false
  })

  const isSupported = aiVoice.isSupported

  useEffect(() => {
    if (voiceAllowed && !aiVoice.hasSpokenGreeting) {
      handlePlayGreeting()
    }
  }, [voiceAllowed])

  const handlePlayGreeting = () => {
    setIsSpeaking(true)
    aiVoice.speakGreeting({
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    })
  }

  const handleAllowVoice = () => {
    setVoiceAllowed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dotch_ai_voice_enabled', 'true')
    }
    handlePlayGreeting()
  }

  const handleSpeakSearch = () => {
    setIsListening(true)
    aiVoice.stopSpeaking()
    setIsSpeaking(false)

    aiVoice.startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setIsListening(false)
        if (transcript && onVoiceQuery) {
          onVoiceQuery(transcript)
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    })
  }

  if (!isSupported) return null

  return (
    <div className="ai-voice-greeter-box">
      <div className="ai-voice-avatar-col">
        <div className={`ai-orb ${isSpeaking ? 'ai-orb-speaking' : isListening ? 'ai-orb-listening' : ''}`}>
          <i className={isListening ? 'fa-solid fa-microphone-lines' : isSpeaking ? 'fa-solid fa-volume-high' : 'fa-solid fa-wand-magic-sparkles'} />
          <div className="ai-orb-ring" />
        </div>
      </div>

      <div className="ai-voice-content-col">
        <div className="ai-voice-badge">
          <span className="live-pulse-dot" style={{ background: '#ec4899' }} />
          <span>Ada · Female AI Discovery Guide</span>
        </div>

        <p className="ai-voice-question">
          &ldquo;What kind of business are you looking for?&rdquo;
        </p>

        <div className="ai-voice-actions">
          {!voiceAllowed ? (
            <button
              type="button"
              className="btn btn-sm btn-primary ai-voice-btn"
              onClick={handleAllowVoice}
              title="Click to hear Ada's pleasant female AI voice"
            >
              <i className="fa-solid fa-volume-high" style={{ marginRight: '6px' }} />
              Play Female Voice
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn-sm ${isSpeaking ? 'btn-danger' : 'btn-outline'} ai-voice-btn`}
              onClick={isSpeaking ? () => { aiVoice.stopSpeaking(); setIsSpeaking(false); } : handlePlayGreeting}
            >
              <i className={isSpeaking ? 'fa-solid fa-stop' : 'fa-solid fa-rotate-right'} style={{ marginRight: '6px' }} />
              {isSpeaking ? 'Stop Voice' : "Replay Ada's Voice"}
            </button>
          )}

          <button
            type="button"
            className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-outline'} ai-voice-btn`}
            onClick={isListening ? () => { aiVoice.stopListening(); setIsListening(false); } : handleSpeakSearch}
            title="Tap to talk back using your microphone"
          >
            <i className={isListening ? 'fa-solid fa-circle-stop' : 'fa-solid fa-microphone'} style={{ marginRight: '6px' }} />
            {isListening ? 'Listening… Tap to Finish' : 'Talk Back (Speak)'}
          </button>
        </div>

        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          💬 <span style={{ opacity: 0.85 }}>You can talk back with your mic or type in the search bar below</span>
        </div>
      </div>

      {isSpeaking && (
        <div className="ai-waveform-container" title="Ada is speaking">
          <span className="wave-bar bar-1" style={{ background: '#ec4899' }} />
          <span className="wave-bar bar-2" style={{ background: '#3b82f6' }} />
          <span className="wave-bar bar-3" style={{ background: '#ec4899' }} />
          <span className="wave-bar bar-4" style={{ background: '#3b82f6' }} />
          <span className="wave-bar bar-5" style={{ background: '#ec4899' }} />
        </div>
      )}
    </div>
  )
}
