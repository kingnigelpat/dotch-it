/**
 * Dotch AI Female Voice Assistant (Ada)
 * Delivers a warm, natural, pleasant female AI voice experience.
 * Supports speaking back recommendations and listening to voice inquiries.
 */

class AiVoiceAssistant {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null
    this.recognition = null
    this.isSupported = Boolean(this.synth)
    this.hasSpokenGreeting = false
    this.cachedVoices = []

    if (this.synth) {
      this.cachedVoices = this.synth.getVoices() || []
      if (typeof window !== 'undefined' && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.cachedVoices = this.synth.getVoices() || []
        }
      }
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-NG'
      }
    }
  }

  /**
   * Specifically finds and returns the best natural, pleasant female English voice
   */
  getFemaleVoice() {
    if (!this.synth) return null
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : (this.synth.getVoices() || [])
    if (!voices || voices.length === 0) return null

    // Target top modern female voices across Windows, Mac, Android, and iOS
    const femaleVoiceNames = [
      'aria', // Windows 11 Natural Female
      'jenny', // Windows Natural Female
      'zira', // Windows 10/11 US Female
      'google uk english female',
      'google us english',
      'samantha', // macOS / iOS Female
      'karen', // Apple Australian Female
      'victoria', // Apple US Female
      'hazel', // Windows UK Female
      'susan', // Windows UK Female
      'moira', // Apple Ireland Female
      'fiona', // Apple Scottish Female
      'tessa', // Apple SA Female
      'female',
    ]

    // 1. Look for explicit English female voice matches
    for (const needle of femaleVoiceNames) {
      const found = voices.find(
        (v) =>
          v.lang &&
          v.lang.startsWith('en') &&
          v.name.toLowerCase().includes(needle)
      )
      if (found) return found
    }

    // 2. Look for any English voice with 'female' in name
    const anyFemaleEn = voices.find(
      (v) => v.lang && v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    )
    if (anyFemaleEn) return anyFemaleEn

    // 3. Fallback to any natural English voice
    const naturalEn = voices.find(
      (v) => v.lang && v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online'))
    )
    if (naturalEn) return naturalEn

    // 4. Default English voice
    return voices.find((v) => v.lang && v.lang.startsWith('en')) || voices[0]
  }

  /**
   * Speaks the signature Dotch greeting in Ada's pleasant female voice
   */
  speakGreeting({ onStart, onEnd } = {}) {
    return this.speak(
      "Hi there, welcome to Dotch! What kind of business or service are you looking for today?",
      { onStart, onEnd }
    )
  }

  speak(text, { onStart, onEnd } = {}) {
    if (!this.synth || !text) return false

    try {
      this.synth.cancel() // Stop any previous utterance

      const utterance = new SpeechSynthesisUtterance(text)
      const femaleVoice = this.getFemaleVoice()

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      // Tuned for a sweet, natural, friendly female tone
      utterance.pitch = 1.08 // Slightly elevated pitch for a warm feminine timbre
      utterance.rate = 0.97 // Slightly relaxed pace for maximum clarity and elegance
      utterance.volume = 1.0

      if (onStart) utterance.onstart = onStart
      if (onEnd) utterance.onend = onEnd
      utterance.onerror = (e) => {
        console.warn('Speech warning:', e)
        if (onEnd) onEnd()
      }

      this.synth.speak(utterance)
      this.hasSpokenGreeting = true
      return true
    } catch (err) {
      console.warn('Speech synthesis failed:', err)
      if (onEnd) onEnd()
      return false
    }
  }

  stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel()
      } catch (e) {}
    }
  }

  /**
   * Starts microphone voice recognition so buyers can talk back
   */
  startListening({ onStart, onResult, onError, onEnd } = {}) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.')
      return false
    }

    try {
      this.recognition.onstart = () => {
        if (onStart) onStart()
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || ''
        if (onResult) onResult(transcript)
      }

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
        if (onError) onError(event.error)
      }

      this.recognition.onend = () => {
        if (onEnd) onEnd()
      }

      this.recognition.start()
      return true
    } catch (err) {
      console.warn('Could not start recognition:', err)
      if (onError) onError(err.message)
      return false
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (e) {}
    }
  }
}

export const aiVoice = new AiVoiceAssistant()
