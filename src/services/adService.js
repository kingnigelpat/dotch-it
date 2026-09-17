import { db } from '../firebase'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

export const AD_COLLECTION = 'advertisements'

// High-impact initial sample adverts showcasing Nigerian businesses
export const SAMPLE_ADVERTS = [
  {
    id: 'ad-transcorp-getaway',
    title: 'Luxury Weekend Escape - 25% Off Suites',
    businessName: 'Transcorp Hilton Abuja',
    businessId: 'hotel-transcorp-abuja',
    category: 'Hotel & Travel',
    badge: 'Admin Spotlight',
    placement: 'hero_banner',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop',
    flyerUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
    tagline: 'Experience 5-star executive comfort, heated pool access & complimentary breakfast in Maitama.',
    phone: '+2349088880000',
    targetReach: 'Nationwide & International',
    pricePromo: 'From ₦180,000 / night',
    ctaText: 'Reserve on WhatsApp',
    status: 'active',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T23:59:59.000Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad-kicks-hub-flash',
    title: 'Fresh Nike Air Jordan 4 Drop - Same Day Lagos Delivery',
    businessName: 'Kicks Hub Lagos',
    businessId: 'demo-1',
    category: 'Fashion & Footwear',
    badge: 'Sponsored',
    placement: 'hero_banner',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop',
    flyerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    tagline: '100% authentic sneakers with official box & receipt. Nationwide doorstep courier available.',
    phone: '+2348012345678',
    targetReach: 'Nationwide Delivery',
    pricePromo: '₦85,000 - ₦140,000',
    ctaText: 'Order on WhatsApp',
    status: 'active',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T23:59:59.000Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad-slot-gadget-promo',
    title: 'Apple iPhone 15 Pro & MacBook Clearance',
    businessName: 'Slot Systems Ikeja',
    businessId: 'slot-ikeja',
    category: 'Phones & Tech Gadgets',
    badge: 'Featured Deal',
    placement: 'flyer_card',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
    flyerUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop',
    tagline: '1-Year Apple warranty, trade-in options, and complimentary silicone case + screen protector.',
    phone: '+2347007568644',
    targetReach: 'Nationwide Delivery',
    pricePromo: 'Save up to ₦120,000',
    ctaText: 'Chat on WhatsApp',
    status: 'active',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T23:59:59.000Z',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad-terra-kulture-feast',
    title: 'Traditional Asun & Seafood Okra Tasting Night',
    businessName: 'Terra Kulture Restaurant',
    businessId: 'terra-kulture',
    category: 'Restaurant & Dining',
    badge: 'Admin Spotlight',
    placement: 'flyer_card',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
    flyerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    tagline: 'Experience rich Nigerian cultural cuisine with live acoustic afro-soul music every Friday.',
    phone: '+2348104265974',
    targetReach: 'Victoria Island, Lagos',
    pricePromo: 'From ₦8,500',
    ctaText: 'Book Table on WhatsApp',
    status: 'active',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T23:59:59.000Z',
    createdAt: new Date().toISOString(),
  },
]

import { cacheService } from '../utils/cacheService'

const CACHE_KEY_ACTIVE_ADS = 'active_ads'

/**
 * Fetch all currently active, non-expired adverts for public display.
 * Employs client-side caching to prevent unnecessary repeat reads.
 */
export async function getActiveAds() {
  const cached = cacheService.get(CACHE_KEY_ACTIVE_ADS)
  if (cached) return cached

  const now = new Date().toISOString()
  let dbAds = []

  if (db) {
    try {
      const col = collection(db, AD_COLLECTION)
      const q = query(col, where('status', '==', 'active'))
      const snap = await getDocs(q)
      dbAds = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.warn('Could not fetch active ads from Firestore, using demo fallback:', err)
    }
  }

  // Combine DB ads with sample ads (avoiding ID collisions)
  const dbAdIds = new Set(dbAds.map((a) => a.id))
  const validSamples = SAMPLE_ADVERTS.filter((s) => !dbAdIds.has(s.id))
  const allAds = [...dbAds, ...validSamples]

  // Filter out any that have expired or are marked paused/inactive
  const activeAds = allAds.filter((ad) => {
    if (ad.status !== 'active') return false
    if (ad.endDate && ad.endDate < now) return false
    return true
  })

  // Cache result for 3 minutes
  cacheService.set(CACHE_KEY_ACTIVE_ADS, activeAds, 180)
  return activeAds
}

/**
 * Fetch all adverts for Admin Panel management.
 */
export async function getAllAdsAdmin() {
  let dbAds = []
  if (db) {
    try {
      const col = collection(db, AD_COLLECTION)
      const snap = await getDocs(col)
      dbAds = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (err) {
      console.warn('Could not fetch admin ads from Firestore:', err)
    }
  }

  const dbAdIds = new Set(dbAds.map((a) => a.id))
  const remainingSamples = SAMPLE_ADVERTS.filter((s) => !dbAdIds.has(s.id))
  return [...dbAds, ...remainingSamples]
}

/**
 * Create a new advert in Firestore.
 */
export async function createAd(adData, adminUid) {
  if (!db) throw new Error('Database is not initialized')
  const ref = doc(collection(db, AD_COLLECTION))
  const payload = {
    ...adData,
    createdBy: adminUid || 'admin',
    createdAt: new Date().toISOString(),
    status: adData.status || 'active',
  }
  await setDoc(ref, payload)
  // Invalidate active ads cache
  cacheService.remove(CACHE_KEY_ACTIVE_ADS)
  return { id: ref.id, ...payload }
}

/**
 * Update an existing advert in Firestore.
 */
export async function updateAd(id, data) {
  if (!db) throw new Error('Database is not initialized')
  const ref = doc(db, AD_COLLECTION, id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
  // Invalidate active ads cache
  cacheService.remove(CACHE_KEY_ACTIVE_ADS)
}

/**
 * Delete an advert.
 */
export async function deleteAd(id) {
  if (!db) throw new Error('Database is not initialized')
  const ref = doc(db, AD_COLLECTION, id)
  await deleteDoc(ref)
  // Invalidate active ads cache
  cacheService.remove(CACHE_KEY_ACTIVE_ADS)
}
