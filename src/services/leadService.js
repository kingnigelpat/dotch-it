import { db } from '../firebase'
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  limit,
  serverTimestamp,
} from 'firebase/firestore'

export const BUYER_LEADS_COLLECTION = 'buyer_notify_requests'

/**
 * Record a buyer search alert request when no sellers match their query.
 * Persists to Firestore collection 'buyer_notify_requests' and syncs to localStorage.
 */
export async function recordBuyerNotifyRequest({ contact, query: searchQuery, location = '' }) {
  if (!contact || !contact.trim()) return null

  const newLead = {
    contact: contact.trim(),
    query: searchQuery ? searchQuery.trim() : 'General Inquiry',
    location: location ? location.trim() : 'Anywhere',
    status: 'pending', // 'pending' | 'contacted'
    createdAt: new Date().toISOString(),
  }

  // 1. Save to Firestore so Admin can see it in real-time
  let savedId = null
  if (db) {
    try {
      const ref = await addDoc(collection(db, BUYER_LEADS_COLLECTION), {
        ...newLead,
        serverTime: serverTimestamp(),
      })
      savedId = ref.id
      newLead.id = savedId
    } catch (err) {
      console.warn('Firestore addDoc warning for buyer lead (caching locally):', err)
    }
  }

  // Fallback ID if offline or Firestore delayed
  if (!newLead.id) {
    newLead.id = 'lead_' + Date.now()
  }

  // 2. Cache in localStorage so buyer and admin have immediate access
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('dotch_notify_requests') : null
    const list = raw ? JSON.parse(raw) : []
    list.unshift(newLead)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dotch_notify_requests', JSON.stringify(list.slice(0, 100)))
    }
  } catch (err) {
    console.warn('LocalStorage error caching buyer lead:', err)
  }

  return newLead
}

/**
 * Fetch all buyer notification requests for the Admin Panel
 */
export async function getAllBuyerLeads(max = 100) {
  const leadMap = new Map()

  // 1. Load from Firestore
  if (db) {
    try {
      const col = collection(db, BUYER_LEADS_COLLECTION)
      const q = query(col, limit(max))
      const snap = await getDocs(q)
      snap.docs.forEach((d) => {
        const data = d.data()
        leadMap.set(d.id, { id: d.id, ...data })
      })
    } catch (err) {
      console.warn('Firestore fetch buyer leads error:', err)
    }
  }

  // 2. Merge local storage leads
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('dotch_notify_requests') : null
    if (raw) {
      const list = JSON.parse(raw)
      list.forEach((l) => {
        if (l?.id && !leadMap.has(l.id)) {
          leadMap.set(l.id, l)
        }
      })
    }
  } catch (e) {}

  const sorted = Array.from(leadMap.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()
    return timeB - timeA
  })

  return sorted
}

/**
 * Delete a buyer lead from Firestore and local storage
 */
export async function deleteBuyerLead(id) {
  if (!id) return
  if (db) {
    try {
      await deleteDoc(doc(db, BUYER_LEADS_COLLECTION, id))
    } catch (e) {
      console.warn('Error deleting buyer lead from Firestore:', e)
    }
  }

  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('dotch_notify_requests')
      if (raw) {
        const list = JSON.parse(raw).filter((l) => l.id !== id)
        localStorage.setItem('dotch_notify_requests', JSON.stringify(list))
      }
    }
  } catch (e) {}
}

/**
 * Mark a buyer lead as contacted or resolved
 */
export async function updateBuyerLeadStatus(id, status = 'contacted') {
  if (!id) return
  if (db) {
    try {
      await setDoc(doc(db, BUYER_LEADS_COLLECTION, id), { status }, { merge: true })
    } catch (e) {
      console.warn('Error updating buyer lead status in Firestore:', e)
    }
  }

  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('dotch_notify_requests')
      if (raw) {
        const list = JSON.parse(raw).map((l) => (l.id === id ? { ...l, status } : l))
        localStorage.setItem('dotch_notify_requests', JSON.stringify(list))
      }
    }
  } catch (e) {}
}
