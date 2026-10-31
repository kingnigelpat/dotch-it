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
import { cacheService } from '../utils/cacheService'

export const AD_COLLECTION = 'advertisements'

export const CAMPAIGN_PACKAGES = [
  {
    id: 'flash_3d',
    name: 'Flash Promo Banner',
    days: 3,
    price: 250,
    formattedPrice: '₦250',
    interval: 'for 3 days',
    badge: '⚡ Special Flash • ₦250 / 3 Days',
    placement: 'hero_banner',
    description: 'Perfect for weekend flash sales, special discounts, or new arrivals.',
    features: [
      'Top Hero Carousel & Flyer Showcase',
      'Direct WhatsApp inquiry button (0% commission)',
      'Custom promo tag (e.g. Save 20%, ₦15,000 Special)',
      'Reach thousands of local buyers across Nigeria',
      '3 full days of active rotation',
    ],
    highlight: true,
  },
  {
    id: 'spotlight_7d',
    name: 'Weekly Spotlight',
    days: 7,
    price: 500,
    formattedPrice: '₦500',
    interval: 'for 7 days',
    badge: '🔥 1 Full Week • ₦500',
    placement: 'hero_banner',
    description: 'Keep your products in front of active shoppers all week long.',
    features: [
      'Top Hero Banner + Category Spotlight',
      'High-converting promo flyer poster display',
      'Direct WhatsApp & phone hotline CTA',
      'Active nationwide & city search presence',
      '7 full days of prime rotation',
    ],
    highlight: false,
  },
  {
    id: 'mega_30d',
    name: 'Monthly Mega Growth',
    days: 30,
    price: 2000,
    formattedPrice: '₦2,000',
    interval: 'for 30 days',
    badge: '👑 30 Days Maximum Dominance',
    placement: 'hero_banner',
    description: 'Continuous month-long exposure for serious business expansion.',
    features: [
      'Guaranteed top slot in rotation all month',
      'Both Landscape Hero Banner & Discovery Flyer Card',
      'Direct WhatsApp button for instant leads',
      'Highest visibility weight in searches',
      '30 full days of 24/7 visibility',
    ],
    highlight: false,
  },
]

// Real campaign adverts only — all fake sample adverts have been removed
export const SAMPLE_ADVERTS = []

const CACHE_KEY_ACTIVE_ADS = 'active_ads'
const DELETED_ADS_STORAGE_KEY = 'dotch_deleted_ad_ids'

export function getStoredAdOverride(id) {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(`dotch_ad_${id}`) : null
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function applyAdOverride(ad) {
  if (!ad) return ad
  const override = getStoredAdOverride(ad.id)
  return override ? { ...ad, ...override } : ad
}

export function getDeletedAdIds() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(DELETED_ADS_STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addDeletedAdId(id) {
  if (!id) return
  try {
    if (typeof window !== 'undefined') {
      const list = getDeletedAdIds()
      if (!list.includes(id)) {
        list.push(id)
        localStorage.setItem(DELETED_ADS_STORAGE_KEY, JSON.stringify(list))
      }
    }
  } catch (e) {}

  // Remove from in-memory SAMPLE_ADVERTS immediately
  const idx = SAMPLE_ADVERTS.findIndex((s) => s.id === id)
  if (idx !== -1) {
    SAMPLE_ADVERTS.splice(idx, 1)
  }
}

/**
 * Fetch all currently active, non-expired adverts for public display.
 * Employs client-side caching to prevent unnecessary repeat reads.
 */
export async function getActiveAds() {
  const cached = cacheService.get(CACHE_KEY_ACTIVE_ADS)
  if (cached) return cached

  const deletedIds = new Set(getDeletedAdIds())
  const now = new Date().toISOString()
  let dbAds = []

  if (db) {
    try {
      const col = collection(db, AD_COLLECTION)
      const snap = await getDocs(col)
      snap.docs.forEach((d) => {
        const data = d.data()
        if (data.status === 'deleted' || data.isDeleted) {
          deletedIds.add(d.id)
          addDeletedAdId(d.id)
        } else if (data.status === 'active') {
          dbAds.push({ id: d.id, ...data })
        }
      })
    } catch (err) {
      console.warn('Could not fetch active ads from Firestore, using demo fallback:', err)
    }
  }

  // Apply stored advert overrides during reads
  const validDbAds = dbAds
    .filter((a) => a.status !== 'deleted' && !a.isDeleted && !deletedIds.has(a.id))
    .map(applyAdOverride)

  const dbAdIds = new Set(validDbAds.map((a) => a.id))
  const validSamples = SAMPLE_ADVERTS
    .filter((s) => !dbAdIds.has(s.id) && !deletedIds.has(s.id))
    .map(applyAdOverride)

  const allAds = [...validDbAds, ...validSamples]

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
  const deletedIds = new Set(getDeletedAdIds())
  let dbAds = []

  if (db) {
    try {
      const col = collection(db, AD_COLLECTION)
      const snap = await getDocs(col)
      snap.docs.forEach((d) => {
        const data = d.data()
        if (data.status === 'deleted' || data.isDeleted) {
          deletedIds.add(d.id)
          addDeletedAdId(d.id)
        } else {
          dbAds.push({ id: d.id, ...data })
        }
      })
    } catch (err) {
      console.warn('Could not fetch admin ads from Firestore:', err)
    }
  }

  // Filter out deleted dbAds and apply stored overrides during reads
  const validDbAds = dbAds
    .filter((a) => a.status !== 'deleted' && !a.isDeleted && !deletedIds.has(a.id))
    .map(applyAdOverride)

  const dbAdIds = new Set(validDbAds.map((a) => a.id))
  const remainingSamples = SAMPLE_ADVERTS
    .filter((s) => !dbAdIds.has(s.id) && !deletedIds.has(s.id))
    .map(applyAdOverride)

  return [...validDbAds, ...remainingSamples]
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
  if (!id) return
  const sampleMatch = SAMPLE_ADVERTS.find((s) => s.id === id)
  if (sampleMatch) {
    Object.assign(sampleMatch, data)
  }

  // Cache in localStorage
  try {
    const localKey = `dotch_ad_${id}`
    const existing = JSON.parse(localStorage.getItem(localKey) || '{}')
    localStorage.setItem(localKey, JSON.stringify({ ...existing, ...(sampleMatch || {}), ...data }))
  } catch (e) {}

  // Invalidate active ads cache early
  cacheService.remove(CACHE_KEY_ACTIVE_ADS)

  if (db) {
    try {
      const ref = doc(db, AD_COLLECTION, id)
      await setDoc(ref, {
        ...(sampleMatch || {}),
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    } catch (err) {
      console.error('Firestore updateAd error:', err)
      throw new Error(`Failed to update advert in Firestore: ${err.message}`)
    }
  }
}

/**
 * Delete an advert permanently.
 * Persists one tombstone to Firestore before committing local deletion.
 */
export async function deleteAd(id) {
  if (!id) return

  // 1. Persist tombstone to Firestore first
  if (db) {
    try {
      const ref = doc(db, AD_COLLECTION, id)
      await setDoc(
        ref,
        {
          status: 'deleted',
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    } catch (err) {
      console.warn('Firestore deleteAd tombstone warning (persisting locally):', err)
    }
  }

  // 2. Commit local deletion and remove stored override
  addDeletedAdId(id)
  try {
    localStorage.removeItem(`dotch_ad_${id}`)
  } catch (e) {}

  // 3. Invalidate active ads cache
  cacheService.remove(CACHE_KEY_ACTIVE_ADS)
}

/**
 * Create a new user/business campaign banner advert.
 * Supports the ₦250 for 3 days flash campaign or custom packages.
 */
export async function createCampaignAd({
  title,
  businessName,
  businessId,
  category,
  placement = 'hero_banner',
  badge = 'Sponsored',
  imageUrl,
  flyerUrl,
  tagline,
  phone,
  targetReach = 'Nationwide Delivery',
  pricePromo,
  ctaText = 'Chat on WhatsApp',
  packageId = 'flash_3d',
  userId,
  paymentMethod = 'paystack',
  paymentReference,
}) {
  const pkg = CAMPAIGN_PACKAGES.find((p) => p.id === packageId) || CAMPAIGN_PACKAGES[0]
  const days = pkg.days || 3
  const now = new Date()
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

  const adId = `ad-camp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const newAd = {
    id: adId,
    title,
    businessName,
    businessId: businessId || null,
    category: category || 'General',
    placement: placement || pkg.placement || 'hero_banner',
    badge: badge || 'Sponsored',
    imageUrl: imageUrl || flyerUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop',
    flyerUrl: flyerUrl || imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    tagline: tagline || `${businessName} on Dotch`,
    phone: phone || '',
    targetReach: targetReach || 'Nationwide Delivery',
    pricePromo: pricePromo || '',
    ctaText: ctaText || 'Order on WhatsApp',
    packageId: pkg.id,
    packageName: pkg.name,
    packagePrice: pkg.price,
    ownerUid: userId || 'anonymous',
    createdBy: userId || 'anonymous',
    status: 'active', // Active immediately upon payment
    paymentMethod,
    paymentReference: paymentReference || `ref_${Date.now()}`,
    startDate: now.toISOString(),
    endDate,
    createdAt: now.toISOString(),
  }

  // 1. Save in local cache so it's instantly visible
  try {
    localStorage.setItem(`dotch_ad_${adId}`, JSON.stringify(newAd))
    const userAdsKey = `dotch_user_ads_${userId}`
    const existing = JSON.parse(localStorage.getItem(userAdsKey) || '[]')
    localStorage.setItem(userAdsKey, JSON.stringify([newAd, ...existing]))
  } catch (e) {}

  // 2. Prepend to in-memory SAMPLE_ADVERTS
  SAMPLE_ADVERTS.unshift(newAd)

  // 3. Persist to Firestore if available
  if (db) {
    try {
      const ref = doc(db, AD_COLLECTION, adId)
      await setDoc(ref, newAd)
    } catch (err) {
      console.warn('Firestore createCampaignAd warning (persisted locally):', err)
    }
  }

  // 4. Invalidate cached ads so all users see it immediately
  cacheService.remove(CACHE_KEY_ACTIVE_ADS)
  return newAd
}

/**
 * Fetch all ads owned by a specific user / business.
 */
export async function getUserAds(userId) {
  if (!userId) return []
  let userAds = []

  // Check localStorage first
  try {
    const local = localStorage.getItem(`dotch_user_ads_${userId}`)
    if (local) {
      userAds = JSON.parse(local)
    }
  } catch (e) {}

  // In-memory check
  const inMemory = SAMPLE_ADVERTS.filter((a) => a.ownerUid === userId || a.createdBy === userId)
  const map = new Map()
  userAds.forEach((a) => map.set(a.id, a))
  inMemory.forEach((a) => map.set(a.id, a))

  if (db) {
    try {
      const q = query(collection(db, AD_COLLECTION), where('ownerUid', '==', userId))
      const snap = await getDocs(q)
      snap.docs.forEach((d) => {
        const data = d.data()
        if (data.status !== 'deleted' && !data.isDeleted) {
          map.set(d.id, { id: d.id, ...data })
        }
      })
    } catch (err) {
      console.warn('Could not query user ads from Firestore:', err)
    }
  }

  return Array.from(map.values())
}

