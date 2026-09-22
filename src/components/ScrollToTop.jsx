import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop ensures that:
 * 1. The browser window always starts at the top (0, 0) on every route/search change.
 * 2. Automatic browser scroll restoration is disabled ('manual'), preventing the browser
 *    from restoring stale scroll positions down to the footer on page reload or navigation.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Disable automatic browser scroll restoration (fixes jumping to footer on reload)
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Scroll to the very top immediately
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0
  }, [pathname, search])

  return null
}
