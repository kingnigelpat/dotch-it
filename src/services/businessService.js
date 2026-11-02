import { db } from '../firebase'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import { cacheService } from '../utils/cacheService'
import { NIGERIA_LOCATIONS } from '../data/nigeriaLocations'
import { calculateDistanceKm, getCoordsForLocationString } from './geolocationService'
import { formatTo234 } from '../utils/phoneUtils'
import { parseQueryAndLocation } from '../utils/searchParser'
export const BUSINESS_COLLECTION = 'businesses'

// All fake demo stores removed — only real stores registered by vendors/admin are displayed
export const DEMO_BUSINESSES = []

export const KNOWN_MOCK_NAMES = [
  'apex gadgets & laptops',
  'zainab luxury fabrics & couture',
  'golden crust artisan bakery',
  'autofix pro diagnostics & repair',
  'urban kicks & streetwear',
  'nova solar & energy solutions',
  'glow & co organic skincare & spa',
  'bukka royale african restaurant',
  'prime cuts luxury grooming lounge',
  'nexus smart home & cctv security',
  'eko grand hotel & suites',
  'naija spice kitchen',
  'zinox tech & phone repair hub',
]

export const KNOWN_MOCK_IDS = [
  'apex-gadgets',
  'zainab-luxury-fabrics',
  'golden-crust-bakery',
  'autofix-pro',
  'urban-kicks',
  'nova-solar-energy',
  'glow-natural-skincare',
  'bukka-royale-cuisine',
  'prime-cuts-lounge',
  'nexus-smart-security',
]

/**
 * Returns true if a business is a fake / mock demo business
 */
export function isMockBusiness(b) {
  if (!b) return false
  if (b.isDemo === true || b.isMock === true || b.isFake === true) return true
  if (b.ownerUid === 'demo-vendor' || b.ownerUid === 'seed-admin') return true

  const id = String(b.id || '').toLowerCase()
  if (KNOWN_MOCK_IDS.includes(id)) return true
  if (id.startsWith('mock_') || id.startsWith('sample_') || id.startsWith('demo_')) return true

  const name = String(b.name || '').trim().toLowerCase()
  if (KNOWN_MOCK_NAMES.some((mn) => name.includes(mn) || mn.includes(name))) return true

  return false
}

export async function createBusiness({ uid, data }) {
  // Enforce one account one business
  const existing = await getBusinessByOwner(uid)
  if (existing) {
    throw new Error('One account can only list one business. You already have an active business listing.')
  }
  const ref = doc(collection(db, BUSINESS_COLLECTION))
  const isVerified = Boolean(
    data?.verified === true &&
    data?.certificateStatus === 'verified'
  )
  const now = new Date()
  const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString()
  const payload = {
    ...data,
    phone: formatTo234(data?.phone || ''),
    ownerUid: uid,
    status: 'active',
    verified: isVerified,
    certificateStatus: isVerified ? 'verified' : 'pending_72h',
    createdAt: data?.createdAt || now.toISOString(),
    verificationDeadline: data?.verificationDeadline || deadline,
  }
  if (db) {
    try {
      await setDoc(ref, payload, { merge: true })
    } catch (err) {
      console.warn('Firestore createBusiness warning (cached locally):', err)
    }
  }
  const result = { id: ref.id, ...payload }
  try {
    localStorage.setItem(`dotch_owner_biz_${uid}`, JSON.stringify(result))
    localStorage.setItem(`dotch_biz_${ref.id}`, JSON.stringify(result))
  } catch (e) {}

  cacheService.clear('all_businesses_')
  cacheService.clear('search_')
  return result
}

export async function updateBusiness(id, data) {
  if (!id) return
  const payload = { ...data, updatedAt: new Date().toISOString() }
  if (payload.phone !== undefined) {
    payload.phone = formatTo234(payload.phone)
  }

  // 1. Update in-memory DEMO_BUSINESSES if matched
  const demoMatch = DEMO_BUSINESSES.find((b) => b.id === id)
  if (demoMatch) {
    Object.assign(demoMatch, payload)
  }

  // 2. Cache in localStorage so changes persist offline and across page refreshes
  try {
    const bizKey = `dotch_biz_${id}`
    const existing = JSON.parse(localStorage.getItem(bizKey) || '{}')
    localStorage.setItem(bizKey, JSON.stringify({ ...existing, ...payload }))

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('dotch_owner_biz_')) {
        try {
          const ob = JSON.parse(localStorage.getItem(k) || '{}')
          if (ob.id === id) {
            localStorage.setItem(k, JSON.stringify({ ...ob, ...payload }))
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  // 3. Persist to Firestore with setDoc merge: true
  if (db) {
    try {
      const ref = doc(db, BUSINESS_COLLECTION, id)
      await setDoc(ref, payload, { merge: true })
    } catch (err) {
      console.warn('Firestore updateBusiness warning (persisted locally):', err)
    }
  }

  cacheService.clear('all_businesses_')
  cacheService.clear('search_')
}

export async function getBusiness(id) {
  if (!id) return null

  // Check local cache
  let localBiz = null
  try {
    const raw = localStorage.getItem(`dotch_biz_${id}`)
    if (raw) localBiz = JSON.parse(raw)
  } catch (e) {}

  const demoMatch = DEMO_BUSINESSES.find((b) => b.id === id)
  if (demoMatch) {
    const merged = { ...demoMatch, ...localBiz, phone: formatTo234(localBiz?.phone || demoMatch.phone) }
    return merged
  }

  if (!db) return localBiz

  try {
    const snap = await getDoc(doc(db, BUSINESS_COLLECTION, id))
    if (!snap.exists()) return localBiz
    const data = snap.data()
    const merged = { id: snap.id, ...localBiz, ...data, phone: formatTo234(data?.phone || localBiz?.phone || '') }
    try {
      localStorage.setItem(`dotch_biz_${id}`, JSON.stringify(merged))
    } catch (e) {}
    return merged
  } catch {
    return localBiz
  }
}

export async function getBusinessByOwner(uid) {
  if (!uid) return null
  const ownerKey = `dotch_owner_biz_${uid}`
  let localBiz = null
  try {
    const raw = localStorage.getItem(ownerKey)
    if (raw) localBiz = JSON.parse(raw)
  } catch (e) {}

  if (!db) return localBiz

  try {
    const q = query(
      collection(db, BUSINESS_COLLECTION),
      where('ownerUid', '==', uid),
      limit(1),
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const data = snap.docs[0].data()
      const merged = { id: snap.docs[0].id, ...localBiz, ...data, phone: formatTo234(data?.phone || localBiz?.phone || '') }
      try {
        localStorage.setItem(ownerKey, JSON.stringify(merged))
        localStorage.setItem(`dotch_biz_${merged.id}`, JSON.stringify(merged))
      } catch (e) {}
      return merged
    }
    return localBiz
  } catch {
    return localBiz
  }
}

const DELETED_BIZ_STORAGE_KEY = 'dotch_deleted_biz_ids'

export function getDeletedBizIds() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(DELETED_BIZ_STORAGE_KEY) : null
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addDeletedBizId(id) {
  if (!id) return
  try {
    if (typeof window !== 'undefined') {
      const list = getDeletedBizIds()
      if (!list.includes(id)) {
        list.push(id)
        localStorage.setItem(DELETED_BIZ_STORAGE_KEY, JSON.stringify(list))
      }
    }
  } catch (e) {}

  // Remove from in-memory DEMO_BUSINESSES immediately
  const idx = DEMO_BUSINESSES.findIndex((b) => b.id === id)
  if (idx !== -1) {
    DEMO_BUSINESSES.splice(idx, 1)
  }
}

export async function deleteBusiness(id) {
  if (!id) return

  // 1. Permanently delete document from Firestore
  if (db) {
    try {
      const ref = doc(db, BUSINESS_COLLECTION, id)
      await deleteDoc(ref)
    } catch (err) {
      console.warn('Could not deleteDoc in Firestore, marking as deleted:', err)
      try {
        const ref = doc(db, BUSINESS_COLLECTION, id)
        await setDoc(
          ref,
          { status: 'deleted', isDeleted: true, deletedAt: new Date().toISOString() },
          { merge: true }
        )
      } catch (e) {}
    }
  }

  // 2. Commit local deletion
  addDeletedBizId(id)

  // 3. Remove local cache and remove owner-specific local cache
  try {
    localStorage.removeItem(`dotch_biz_${id}`)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('dotch_owner_biz_')) {
        try {
          const item = JSON.parse(localStorage.getItem(k) || '{}')
          if (item?.id === id) {
            localStorage.removeItem(k)
          }
        } catch {}
      }
    }
  } catch (e) {}

  cacheService.clear('all_businesses_')
  cacheService.clear('search_')
}

/**
 * Permanently purge all mock / demo businesses from Firestore and local cache
 */
export async function purgeMockBusinesses() {
  const purged = []
  if (db) {
    try {
      const col = collection(db, BUSINESS_COLLECTION)
      const snap = await getDocs(col)
      for (const d of snap.docs) {
        const data = d.data()
        const b = { id: d.id, ...data }
        if (isMockBusiness(b)) {
          await deleteDoc(d.ref)
          addDeletedBizId(d.id)
          purged.push(b.name || d.id)
        }
      }
    } catch (err) {
      console.warn('Error purging mock businesses from Firestore:', err)
    }
  }

  // Also purge mock businesses from localStorage
  try {
    if (typeof window !== 'undefined') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i)
        if (k && (k.startsWith('dotch_biz_') || k.startsWith('dotch_owner_biz_'))) {
          try {
            const item = JSON.parse(localStorage.getItem(k) || '{}')
            if (isMockBusiness(item)) {
              localStorage.removeItem(k)
            }
          } catch {}
        }
      }
    }
  } catch (e) {}

  cacheService.clear('all_businesses_')
  cacheService.clear('search_')
  return purged
}

/**
 * Smart location matching function supporting City & State hierarchy in Nigeria
 */
function isLocationMatch(b, targetLocStr) {
  if (!targetLocStr) return true
  const target = targetLocStr.toLowerCase().trim()
  if (['everywhere', 'all of nigeria', 'all locations', 'all', 'near me'].includes(target)) return true

  const bLoc = (b.location || '').toLowerCase()
  const bCity = (b.city || '').toLowerCase()
  const bState = (b.state || '').toLowerCase()
  const combined = `${bLoc} ${bCity} ${bState}`

  // 1. Direct substring match
  if (combined.includes(target)) return true
  if (bCity && bCity.length > 3 && target.includes(bCity)) return true

  // 2. State-to-Cities matching (e.g. Target = "Lagos" or "Lagos State")
  const stateObj = NIGERIA_LOCATIONS.find((stItem) => {
    const sName = stItem.state.toLowerCase()
    return target.includes(sName) || sName.includes(target)
  })

  if (stateObj) {
    const stateName = stateObj.state.toLowerCase()
    if (combined.includes(stateName)) return true
    for (const city of stateObj.cities) {
      const cClean = city.toLowerCase().replace(/\(.*\)/g, '').trim()
      if (cClean && cClean.length > 3 && combined.includes(cClean)) return true
    }
  }

  // 3. City-to-State matching (e.g. Target = "Ikeja")
  for (const stItem of NIGERIA_LOCATIONS) {
    for (const city of stItem.cities) {
      const cClean = city.toLowerCase().replace(/\(.*\)/g, '').trim()
      if (cClean && (target.includes(cClean) || cClean.includes(target))) {
        if (combined.includes(cClean) || combined.includes(stItem.state.toLowerCase())) {
          return true
        }
      }
    }
  }

  return false
}

export async function searchBusinesses({ category, keyword, location, userCoords, max = 50 }) {
  // Parse natural language queries (e.g. "bag in lagos" -> keyword: "bag", location: "Lagos")
  const parsed = parseQueryAndLocation(keyword, location)
  const effectiveKeyword = parsed.keyword
  const effectiveLocation = parsed.location

  const cacheKey = `search_${category || ''}_${effectiveKeyword || ''}_${effectiveLocation || ''}_${userCoords?.lat || ''}_${max}`
  const cached = cacheService.get(cacheKey)
  if (cached) return cached

  const deletedIds = new Set(getDeletedBizIds())
  let dbResults = []
  if (db) {
    try {
      const col = collection(db, BUSINESS_COLLECTION)
      let q = category ? query(col, where('category', '==', category)) : query(col)
      const snap = await getDocs(q)
      snap.docs.forEach((d) => {
        const data = d.data()
        if (data.status === 'deleted' || data.isDeleted) {
          deletedIds.add(d.id)
          addDeletedBizId(d.id)
        } else if (data.status !== 'blocked' && !data.isBlocked) {
          dbResults.push({ id: d.id, ...data, phone: formatTo234(data?.phone || '') })
        }
      })
    } catch (err) {
      console.warn('Firestore fetch fallback:', err)
    }
  }

  // Also include any real business saved in local storage (e.g. newly created by owner offline or pending sync)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('dotch_biz_')) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const item = JSON.parse(raw)
          if (item?.id && !deletedIds.has(item.id) && !dbResults.some((b) => b.id === item.id)) {
            dbResults.push({ ...item, phone: formatTo234(item.phone || '') })
          }
        }
      }
    }
  } catch (e) {}

  // Filter out any deleted, blocked, or mock demo stores
  const validDbResults = dbResults.filter(
    (b) => b.status !== 'deleted' && !b.isDeleted && !deletedIds.has(b.id) && !isMockBusiness(b)
  )
  let filtered = validDbResults

  if (category) {
    const catLower = category.toLowerCase()
    filtered = filtered.filter((b) => {
      if (!b.category) return false
      const bCatLower = b.category.toLowerCase()
      if (bCatLower.includes(catLower) || catLower.includes(bCatLower)) return true
      if (catLower.includes('hotel') && bCatLower.includes('hotel')) return true
      if (catLower.includes('restaurant') && bCatLower.includes('restaurant')) return true
      if (catLower.includes('food') && (bCatLower.includes('food') || bCatLower.includes('bakery') || bCatLower.includes('restaurant'))) return true
      return false
    })
  }

  if (
    effectiveLocation &&
    effectiveLocation !== 'Everywhere' &&
    effectiveLocation !== 'All of Nigeria' &&
    effectiveLocation !== 'All Locations'
  ) {
    filtered = filtered.filter((b) => isLocationMatch(b, effectiveLocation))
  }

  if (effectiveKeyword) {
    const k = effectiveKeyword.toLowerCase()
    const stopWords = new Set(['in', 'at', 'near', 'around', 'and', 'the', 'for', 'with', 'to', 'of', 'on', 'a', 'an'])
    const tokens = k.split(/\s+/).filter((w) => w.length > 1 && !stopWords.has(w))

    filtered = filtered.filter((b) => {
      const bName = (b.name || '').toLowerCase()
      const bCat = (b.category || '').toLowerCase()
      const bDesc = (b.description || '').toLowerCase()
      const bLoc = (b.location || '').toLowerCase()
      const bCity = (b.city || '').toLowerCase()
      const bKeywords = Array.isArray(b.keywords) ? b.keywords.map((kw) => kw.toLowerCase()) : []
      const combinedText = `${bName} ${bCat} ${bDesc} ${bLoc} ${bCity} ${bKeywords.join(' ')}`

      // 1. Direct exact match
      if (combinedText.includes(k)) return true

      // 2. Token match with simple plural/singular support (e.g. bag <-> bags)
      if (tokens.length > 0) {
        return tokens.some((token) => {
          if (combinedText.includes(token)) return true
          if (token.endsWith('s') && combinedText.includes(token.slice(0, -1))) return true
          if (!token.endsWith('s') && combinedText.includes(token + 's')) return true
          return false
        })
      }

      return false
    })
  }

  // Calculate distance if user GPS coordinates or location is available
  const originCoords = userCoords || (location ? getCoordsForLocationString(location) : null)
  if (originCoords) {
    filtered = filtered.map((b) => {
      let bLat = b.lat
      let bLng = b.lng
      if (!bLat || !bLng) {
        const c = getCoordsForLocationString(b.location || b.city)
        if (c) {
          bLat = c.lat
          bLng = c.lng
        }
      }
      if (bLat && bLng) {
        const d = calculateDistanceKm(originCoords.lat, originCoords.lng, bLat, bLng)
        if (d !== null) {
          return { ...b, distanceKm: d, distance: `${d} km away` }
        }
      }
      return b
    })
  }

  // Sort by distance if GPS/location active, else sort by subscription tier
  const tierWeight = { pro_eoy: 5, pro_2m: 4, pro_1m: 3, enterprise_monthly: 3, pro_monthly: 2, starter: 1 }
  filtered.sort((a, b) => {
    if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
      return a.distanceKm - b.distanceKm
    }
    const weightA = tierWeight[a.subscriptionTier] || 0
    const weightB = tierWeight[b.subscriptionTier] || 0
    return weightB - weightA
  })

  const finalResults = filtered.slice(0, max)
  cacheService.set(cacheKey, finalResults, 180)
  return finalResults
}

export async function getAllBusinesses(max = 50) {
  const cacheKey = `all_businesses_${max}`
  const cached = cacheService.get(cacheKey)
  if (cached) return cached

  const deletedIds = new Set(getDeletedBizIds())
  let dbResults = []
  if (db) {
    try {
      const q = query(collection(db, BUSINESS_COLLECTION), limit(max))
      const snap = await getDocs(q)
      snap.docs.forEach((d) => {
        const data = d.data()
        if (data.status === 'deleted' || data.isDeleted) {
          deletedIds.add(d.id)
          addDeletedBizId(d.id)
        } else if (data.status !== 'blocked' && !data.isBlocked) {
          dbResults.push({ id: d.id, ...data, phone: formatTo234(data?.phone || '') })
        }
      })
    } catch {
      // ignore
    }
  }

  // Include locally stored real listings
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('dotch_biz_')) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const item = JSON.parse(raw)
          if (item?.id && !deletedIds.has(item.id) && !dbResults.some((b) => b.id === item.id)) {
            dbResults.push({ ...item, phone: formatTo234(item.phone || '') })
          }
        }
      }
    }
  } catch (e) {}

  const validDbResults = dbResults.filter(
    (b) => b.status !== 'deleted' && !b.isDeleted && !deletedIds.has(b.id) && !isMockBusiness(b)
  )
  const combined = validDbResults
  
  // Sort priority tiers first
  const tierWeight = { pro_eoy: 5, pro_2m: 4, pro_1m: 3, enterprise_monthly: 3, pro_monthly: 2, starter: 1 }
  combined.sort((a, b) => {
    const weightA = tierWeight[a.subscriptionTier] || 0
    const weightB = tierWeight[b.subscriptionTier] || 0
    return weightB - weightA
  })

  const results = combined.slice(0, max)
  cacheService.set(cacheKey, results, 300) // Cache listings for 5 minutes
  return results
}

/**
 * Returns all businesses for Admin view (including pending certificate verifications)
 */
export async function getAllBusinessesAdmin(max = 150) {
  const deletedIds = new Set(getDeletedBizIds())
  let dbResults = []
  if (db) {
    try {
      const q = query(collection(db, BUSINESS_COLLECTION), limit(max))
      const snap = await getDocs(q)
      snap.docs.forEach((d) => {
        const data = d.data()
        if (!deletedIds.has(d.id) && data.status !== 'deleted' && !data.isDeleted) {
          const isMock = isMockBusiness({ id: d.id, ...data })
          dbResults.push({ id: d.id, ...data, isMock, phone: formatTo234(data?.phone || '') })
        }
      })
    } catch {
      // ignore
    }
  }

  const validDbResults = dbResults.filter((b) => b.status !== 'deleted' && !b.isDeleted && !deletedIds.has(b.id))
  return validDbResults
}

export async function updateBusinessSubscription(businessId, { planId, reference, amount }) {
  const durationDays = planId === 'pro_eoy' ? 365 : planId === 'pro_2m' ? 60 : 30
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + durationDays)

  const updateData = {
    subscriptionTier: planId,
    subscriptionStatus: 'active',
    subscriptionReference: reference,
    subscriptionAmount: amount,
    durationDays,
    subscribedAt: new Date().toISOString(),
    subscriptionExpiresAt: expiresAt.toISOString(),
  }

  try {
    const docRef = doc(db, BUSINESS_COLLECTION, businessId)
    await updateDoc(docRef, updateData)
  } catch (err) {
    console.warn('Could not update Firestore subscription doc, fallback local cache:', err)
  }

  return updateData
}

