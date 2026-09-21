import { db } from '../firebase'
import {
  doc,
  setDoc,
  collection,
  addDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore'
import { BUSINESS_COLLECTION } from './businessService'

// Cooldown period for profile view throttling (12 hours)
const VIEW_THROTTLE_MS = 12 * 60 * 60 * 1000

/**
 * Record a business profile view in Firestore.
 * 
 * Throttling: Uses client localStorage timestamp to reduce duplicate counts
 * from page reloads. LocalStorage is NOT the analytics database; Firestore is the
 * single source of truth.
 */
export async function recordBusinessView(businessId) {
  if (!businessId || typeof window === 'undefined') return

  // 1. Client-side duplicate check
  const throttleKey = `dotch_view_business_${businessId}`
  try {
    const lastViewStr = localStorage.getItem(throttleKey)
    const now = Date.now()
    if (lastViewStr) {
      const lastView = Number(lastViewStr)
      if (now - lastView < VIEW_THROTTLE_MS) {
        // Throttled: User viewed this business within the cooldown period
        return
      }
    }
    localStorage.setItem(throttleKey, String(now))
  } catch (storageErr) {
    // LocalStorage failure should never block analytics or navigation
  }

  // 2. Persist to Firestore asynchronously (non-blocking)
  if (!db) return

  const timestamp = new Date().toISOString()

  try {
    const bizRef = doc(db, BUSINESS_COLLECTION, businessId)
    // Atomic increment so simultaneous users don't overwrite each other
    await setDoc(
      bizRef,
      {
        profileViews: increment(1),
        lastInteractionAt: timestamp,
      },
      { merge: true }
    )

    // Record lightweight anonymous activity event
    await addDoc(collection(db, BUSINESS_COLLECTION, businessId, 'activity_events'), {
      businessId,
      eventType: 'profile_view',
      timestamp,
    })
  } catch (err) {
    // Non-blocking: Failures must never break the main user experience
    console.warn('Analytics view recording notice (non-fatal):', err.message || err)
  }
}

/**
 * Record an actual click on the "Chat on WhatsApp" button.
 */
export async function recordWhatsAppClick(businessId) {
  if (!businessId || !db) return

  const timestamp = new Date().toISOString()

  try {
    const bizRef = doc(db, BUSINESS_COLLECTION, businessId)
    await setDoc(
      bizRef,
      {
        whatsappClicks: increment(1),
        lastInteractionAt: timestamp,
      },
      { merge: true }
    )

    // Record lightweight anonymous activity event
    await addDoc(collection(db, BUSINESS_COLLECTION, businessId, 'activity_events'), {
      businessId,
      eventType: 'whatsapp_click',
      timestamp,
    })
  } catch (err) {
    console.warn('Analytics WhatsApp click recording notice (non-fatal):', err.message || err)
  }
}

/**
 * Record an actual click on the Phone action.
 */
export async function recordPhoneClick(businessId) {
  if (!businessId || !db) return

  const timestamp = new Date().toISOString()

  try {
    const bizRef = doc(db, BUSINESS_COLLECTION, businessId)
    await setDoc(
      bizRef,
      {
        phoneClicks: increment(1),
        lastInteractionAt: timestamp,
      },
      { merge: true }
    )

    // Record lightweight anonymous activity event
    await addDoc(collection(db, BUSINESS_COLLECTION, businessId, 'activity_events'), {
      businessId,
      eventType: 'phone_click',
      timestamp,
    })
  } catch (err) {
    console.warn('Analytics phone click recording notice (non-fatal):', err.message || err)
  }
}

/**
 * Subscribe to real-time analytics updates for a business document.
 * Returns an unsubscribe function.
 */
export function subscribeToBusinessAnalytics(businessId, onUpdate) {
  if (!businessId || !db) return () => {}

  const bizRef = doc(db, BUSINESS_COLLECTION, businessId)
  return onSnapshot(
    bizRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        onUpdate({
          profileViews: Number(data.profileViews) || 0,
          whatsappClicks: Number(data.whatsappClicks) || 0,
          phoneClicks: Number(data.phoneClicks) || 0,
          lastInteractionAt: data.lastInteractionAt || null,
        })
      }
    },
    (error) => {
      console.warn('Real-time analytics listener notice:', error.message || error)
    }
  )
}

/**
 * Subscribe to recent lightweight activity events for a business in real time.
 * Returns an unsubscribe function.
 */
export function subscribeToRecentEvents(businessId, onUpdate, maxEvents = 5) {
  if (!businessId || !db) return () => {}

  try {
    const q = query(
      collection(db, BUSINESS_COLLECTION, businessId, 'activity_events'),
      orderBy('timestamp', 'desc'),
      limit(maxEvents)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        onUpdate(events)
      },
      (error) => {
        console.warn('Real-time recent events listener notice:', error.message || error)
      }
    )
  } catch (err) {
    console.warn('Could not initialize recent events listener:', err.message || err)
    return () => {}
  }
}

/**
 * Format relative timestamp without fabricating dates.
 * e.g. "Just now", "2 minutes ago", "1 hour ago", "Yesterday", or "No activity yet".
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return 'No activity yet'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return 'No activity yet'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 0 || diffSec < 60) return 'Just now'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin === 1) return '1 minute ago'
  if (diffMin < 60) return `${diffMin} minutes ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/**
 * Helper to display human-readable labels and icons for anonymous event types.
 */
export function formatEventType(eventType) {
  switch (eventType) {
    case 'whatsapp_click':
      return {
        label: 'WhatsApp click',
        icon: 'fa-brands fa-whatsapp',
        color: '#25D366',
        badgeBg: 'rgba(37, 211, 102, 0.12)',
      }
    case 'phone_click':
      return {
        label: 'Phone click',
        icon: 'fa-solid fa-phone',
        color: 'var(--accent-amber, #f59e0b)',
        badgeBg: 'rgba(245, 158, 11, 0.12)',
      }
    case 'profile_view':
    default:
      return {
        label: 'Profile view',
        icon: 'fa-solid fa-eye',
        color: 'var(--brand-primary)',
        badgeBg: 'rgba(37, 99, 235, 0.12)',
      }
  }
}
