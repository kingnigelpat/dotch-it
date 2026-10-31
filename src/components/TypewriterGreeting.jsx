import { useState, useEffect } from 'react'

/**
 * Smooth Typewriter Greeting Animation for the AI
 */
export default function TypewriterGreeting({ text = '', speed = 30 }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingDone, setIsTypingDone] = useState(false)

  useEffect(() => {
    let index = 0
    setDisplayedText('')
    setIsTypingDone(false)

    if (!text) return

    const interval = setInterval(() => {
      index++
      setDisplayedText(text.slice(0, index))
      if (index >= text.length) {
        clearInterval(interval)
        setIsTypingDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <div className="ai-typewriter-container" aria-live="polite">
      <h2 className="ai-greeting-text">
        {displayedText}
        {!isTypingDone && <span className="ai-cursor-blink">|</span>}
      </h2>
    </div>
  )
}
