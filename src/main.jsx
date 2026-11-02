import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import './styles/ai-discovery.css'

// Global Error Boundary to catch any render exception and display user-safe recovery UI
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null })
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DOTCH][ErrorBoundary] Application error caught:', {
      name: error?.name || 'Error',
      message: error?.message || String(error),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      route: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: new Date().toISOString(),
    })
  }

  handleRetry = () => {
    try {
      localStorage.removeItem('dotch_cache_v1')
    } catch (e) {}
    this.setState({ hasError: false, error: null })
    if (typeof this.props.onRetry === 'function') {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: this.props.inline ? '50vh' : '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: this.props.inline ? 'transparent' : '#f8fafc',
            color: '#1e293b',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
          }}
        >
          <div style={{
            background: '#ffffff',
            padding: '32px 28px',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚡</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
              We couldn&apos;t refresh your feed. Please try again.
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              A temporary issue occurred while updating your view. Tap Retry below to continue.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                background: '#ee5d36',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(238,93,54,0.3)',
                transition: 'transform 0.15s ease',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Service Worker: Only activate in production to prevent dev-server caching issues
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('⚡ Dotch Service Worker active:', reg.scope)
      })
      .catch((err) => {
        console.warn('Service Worker registration skipped:', err)
      })
  })
} else if ('serviceWorker' in navigator) {
  // Unregister service worker on localhost if active
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

const rootElement = typeof document !== 'undefined' && typeof document.getElementById === 'function'
  ? document.getElementById('root')
  : null

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
