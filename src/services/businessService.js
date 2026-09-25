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
import { fetchOsmBusinesses } from './osmService'
import { cacheService } from '../utils/cacheService'
import { NIGERIA_LOCATIONS } from '../data/nigeriaLocations'
import { calculateDistanceKm, getCoordsForLocationString } from './geolocationService'
import { formatTo234 } from '../utils/phoneUtils'
import { parseQueryAndLocation } from '../utils/searchParser'

export const BUSINESS_COLLECTION = 'businesses'

// Rich initial sample businesses including popular Hotels & Restaurants across Nigeria
export const DEMO_BUSINESSES = [
  {
    id: 'demo-1',
    name: 'Kicks Hub Lagos',
    category: 'Fashion & Clothing',
    description: 'Original Nike, Adidas & Jordan sneakers. Fast delivery across Lagos & nationwide.',
    price: '₦85,000 - ₦140,000',
    location: 'Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+2347073544811',
    logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop',
    keywords: ['nike', 'shoes', 'sneakers', 'jordan', 'kicks', 'lagos', 'fashion'],
  },
  {
    id: 'slot-ikeja-gadgets',
    name: 'Slot Systems Ikeja',
    category: 'Electronics',
    description: 'Official iPhones, Samsungs, MacBooks & tech accessories with manufacturer warranty & instant Lagos delivery.',
    price: '₦120,000 - ₦1,850,000',
    location: 'Computer Village, Ikeja, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+2349062083582',
    logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&auto=format&fit=crop',
    keywords: ['iphone', 'macbook', 'slot', 'tech', 'ikeja', 'computer village', 'gadgets', 'phones'],
  },
  {
    id: 'luxe-beauty-spa',
    name: 'Luxe Beauty & Spa Lounge',
    category: 'Beauty',
    description: 'Premium organic facial treatment, hair braiding, luxury manicures & full body massage therapy.',
    price: '₦15,000 - ₦75,000',
    location: 'Lekki Phase 1, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+2348035541199',
    logoUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop',
    keywords: ['beauty', 'spa', 'massage', 'nails', 'hair', 'lekki', 'lagos', 'facial'],
  },
  {
    id: 'rest-yellow-chilli-lagos',
    name: 'Yellow Chilli Restaurant & Bar',
    category: 'Restaurant',
    description: 'Gourmet pan-African fine dining serving legendary Jollof Rice, Seafood Okro, Prawns & signature cocktails.',
    price: '₦8,000 - ₦30,000',
    location: 'Victoria Island, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+2348133934758',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'yellow chilli', 'african food', 'jollof', 'lagos', 'vi', 'dining', 'food', 'okro'],
  },
  {
    id: 'rest-nkoyo-abuja',
    name: 'Nkoyo Restaurant & Grill',
    category: 'Restaurant',
    description: 'Authentic Nigerian cuisine, spicy grills, and aromatic herbal dishes served in an elegant ethnic wooden lounge.',
    price: '₦7,500 - ₦25,000',
    location: 'Maitama, Abuja',
    city: 'Abuja',
    verified: true,
    rating: '4.8',
    phone: '+2348153221279',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'nkoyo', 'abuja', 'maitama', 'african dish', 'grill', 'food', 'suya', 'dining'],
  },
  {
    id: 'autochek-workshop-abuja',
    name: 'Autochek Certified Auto Workshop',
    category: 'Auto',
    description: 'Computerized diagnostic scan, wheel balancing, engine overhaul & genuine OEM auto spare parts.',
    price: '₦15,000 - ₦180,000',
    location: 'Wuse 2, Abuja',
    city: 'Abuja',
    verified: true,
    rating: '4.8',
    phone: '+2347080610000',
    logoUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&auto=format&fit=crop',
    keywords: ['auto', 'mechanic', 'car repair', 'diagnostics', 'wuse', 'abuja', 'spare parts'],
  },
  {
    id: 'rest-shiro-lagos',
    name: 'Shiro Lagos Fine Dining & Lounge',
    category: 'Restaurant',
    description: 'Pan-Asian fine dining right on the beach featuring fresh sushi, dim sum, teppanyaki & breathtaking ocean sunsets.',
    price: '₦15,000 - ₦60,000',
    location: 'Landmark Beach, Victoria Island, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+2348186298888',
    logoUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'shiro', 'sushi', 'asian', 'fine dining', 'beachfront', 'lagos', 'vi', 'food'],
  },
  {
    id: 'royal-threads-ph',
    name: 'Royal Threads Clothing & Accessories',
    category: 'Fashion & Clothing',
    description: 'Bespoke native agbada, tailored suits, Ankara dresses & designer accessories for men & women.',
    price: '₦25,000 - ₦150,000',
    location: 'GRA Phase 2, Port Harcourt',
    city: 'Port Harcourt',
    verified: true,
    rating: '4.8',
    phone: '+2348055559500',
    logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&auto=format&fit=crop',
    keywords: ['fashion', 'suits', 'native', 'agbada', 'port harcourt', 'ph', 'gra', 'clothing'],
  },
  {
    id: 'rest-bole-king-ph',
    name: 'Bole King Restaurant & Lounge',
    category: 'Restaurant',
    description: 'Famous Port Harcourt bole (roasted plantain) & roasted fish experience served with fiery pepper sauce & fresh palm wine.',
    price: '₦4,500 - ₦18,000',
    location: 'GRA Phase 2, Port Harcourt',
    city: 'Port Harcourt',
    verified: true,
    rating: '4.9',
    phone: '+2348179670902',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'bole', 'bole king', 'port harcourt', 'ph', 'roasted plantain', 'fish', 'food', 'gra'],
  },
  {
    id: 'hubmart-supermarket-asaba',
    name: 'Hubmart Supermarket & Bakery',
    category: 'Supermarket & Grocery',
    description: 'Fresh groceries, imported snacks, fresh bread, household essentials & wholesale provisions.',
    price: '₦1,000 - ₦50,000',
    location: 'GRA, Asaba',
    city: 'Asaba',
    verified: true,
    rating: '4.7',
    phone: '+2348115599988',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400&auto=format&fit=crop',
    keywords: ['supermarket', 'groceries', 'bakery', 'asaba', 'delta', 'provisions'],
  },
  {
    id: 'rest-amala-sky-ibadan',
    name: 'Amala Sky Restaurant (Bodija)',
    category: 'Restaurant',
    description: 'Legendary Ibadan indigenous Amala, silky Gbegiri, Ewedu, Ogunfe (goat meat) and bush meat cooked to perfection.',
    price: '₦2,500 - ₦10,000',
    location: 'Bodija, Ibadan',
    city: 'Ibadan',
    verified: true,
    rating: '4.9',
    phone: '+2347073544811',
    logoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'amala', 'amala sky', 'ibadan', 'bodija', 'gbegiri', 'ewedu', 'goat meat', 'food', 'swallow'],
  },
  {
    id: 'central-tech-ibadan',
    name: 'Central Laptop & Phone Hub',
    category: 'Electronics',
    description: 'Sales and fast repairs of HP, Dell, MacBook, iPhone & Samsung smartphones with warranty.',
    price: '₦45,000 - ₦650,000',
    location: 'Ring Road, Ibadan',
    city: 'Ibadan',
    verified: true,
    rating: '4.7',
    phone: '+2349060757189',
    logoUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop',
    keywords: ['tech', 'laptops', 'phones', 'repair', 'ibadan', 'ring road', 'electronics'],
  },
  {
    id: 'rest-hardrock-lagos',
    name: 'Hard Rock Cafe Lagos',
    category: 'Restaurant',
    description: 'World-famous music-themed restaurant with live performance stage, legendary burgers, ribs & oceanfront lounge.',
    price: '₦10,000 - ₦45,000',
    location: 'Oniru, Victoria Island, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.8',
    phone: '+2349081988888',
    logoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'hard rock', 'cafe', 'burgers', 'cocktails', 'live music', 'lagos', 'oniru', 'food'],
  },
  {
    id: 'rest-theplace-lekki',
    name: 'The Place Restaurant & Bar',
    category: 'Restaurant',
    description: 'Top Nigerian food joint known for delicious local dishes, grilled chicken, fiery asun, fried rice and great music.',
    price: '₦3,500 - ₦15,000',
    location: 'Lekki, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.8',
    phone: '+2347086990485',
    logoUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'the place', 'lekki', 'lagos', 'asun', 'jollof', 'grill', 'food', 'chicken'],
  },
  {
    id: 'rest-kilimanjaro-enugu',
    name: 'Kilimanjaro Restaurant',
    category: 'Restaurant',
    description: 'Popular Nigerian fast casual restaurant serving steaming Jollof, Fried Rice, Crispy Chicken, Asun & pastries.',
    price: '₦3,000 - ₦12,000',
    location: 'Polo Park Mall, Enugu',
    city: 'Enugu',
    verified: true,
    rating: '4.7',
    phone: '+2348100393579',
    logoUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'kilimanjaro', 'enugu', 'fast food', 'jollof', 'fried chicken', 'food', 'rice'],
  },
  {
    id: 'demo-2',
    name: 'Gourmet Slice Pizza & Grill',
    category: 'Restaurant',
    description: 'Authentic wood-fired pizzas, gourmet burgers, and fresh pasta in Lekki.',
    price: '₦7,500 - ₦22,000',
    location: 'Lekki, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.8',
    phone: '+2347073544811',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
    keywords: ['pizza', 'restaurant', 'food', 'burgers', 'lekki', 'dinner'],
  },
  {
    id: 'demo-3',
    name: 'iFix Tech & Gadget Repair',
    category: 'Electronics & Tech',
    description: 'Certified iPhone, Samsung & MacBook screen replacement and hardware repair.',
    price: '₦15,000 - ₦95,000',
    location: 'Ikeja, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '5.0',
    phone: '+2347073544811',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop',
    keywords: ['iphone', 'repair', 'screen', 'apple', 'phone', 'ikeja', 'macbook'],
  },
  {
    id: 'demo-4',
    name: 'Royal Crown Barbershop & Spa',
    category: 'Beauty & Salon',
    description: 'Premium haircutting, beard grooming, facial massage, and executive lounge.',
    price: '₦6,000 - ₦25,000',
    location: 'Victoria Island, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+2347073544811',
    logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop',
    keywords: ['barber', 'barbershop', 'haircut', 'salon', 'grooming', 'vi'],
  },
  {
    id: 'demo-5',
    name: 'Sweet Artisan Cakes & Bakery',
    category: 'Food & Drink',
    description: 'Custom birthday cakes, wedding cakes, pastries and dessert tables.',
    price: '₦25,000 - ₦180,000',
    location: 'Asaba',
    city: 'Asaba',
    verified: true,
    rating: '4.8',
    phone: '+2347073544811',
    logoUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
    keywords: ['cakes', 'birthday', 'bakery', 'pastries', 'asaba', 'dessert'],
  },
  {
    id: 'demo-bags-lagos',
    name: 'Luxe Leather & Handbag Gallery Lagos',
    category: 'Fashion & Clothing',
    description: 'Luxury designer handbags, leather tote bags, shoulder bags, travel duffels & corporate briefcases. Express delivery across Lagos & nationwide.',
    price: '₦28,000 - ₦145,000',
    location: 'Lekki Phase 1, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+2347073544811',
    logoUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop',
    keywords: ['bag', 'bags', 'handbag', 'handbags', 'tote', 'leather', 'purse', 'fashion', 'accessories', 'lagos', 'lekki'],
  },
]

export async function createBusiness({ uid, data }) {
  // Enforce one account one business
  const existing = await getBusinessByOwner(uid)
  if (existing) {
    throw new Error('One account can only list one business. You already have an active business listing.')
  }
  const ref = doc(collection(db, BUSINESS_COLLECTION))
  const payload = {
    ...data,
    phone: formatTo234(data?.phone || ''),
    ownerUid: uid,
    status: 'active',
    verified: true,
    createdAt: new Date().toISOString(),
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

  // 1. Persist one tombstone in Firestore
  if (db) {
    try {
      const ref = doc(db, BUSINESS_COLLECTION, id)
      await setDoc(
        ref,
        { status: 'deleted', isDeleted: true, deletedAt: new Date().toISOString() },
        { merge: true }
      )
    } catch (err) {
      console.warn('Could not persist tombstone in Firestore:', err)
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
        } else if (data.status === 'active' || data.paymentStatus === 'approved' || data.verified === true) {
          dbResults.push({ id: d.id, ...data, phone: formatTo234(data?.phone || '') })
        }
      })
    } catch (err) {
      console.warn('Firestore fetch fallback:', err)
    }
  }

  // Merge DB results with demo results (excluding any deleted IDs)
  const validDbResults = dbResults.filter((b) => b.status !== 'deleted' && !b.isDeleted && !deletedIds.has(b.id))
  const all = [
    ...validDbResults,
    ...DEMO_BUSINESSES.filter((d) => !deletedIds.has(d.id) && d.status !== 'deleted'),
  ]

  let filtered = all

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

  // If local results are few, attempt to find real Overpass OpenStreetMap POIs ONLY for the requested location.
  if (
    filtered.length < 5 &&
    effectiveLocation &&
    effectiveLocation !== 'Everywhere' &&
    effectiveLocation !== 'All of Nigeria' &&
    effectiveLocation !== 'All Locations'
  ) {
    try {
      const targetCity = effectiveLocation.trim()
      const osmPlaces = await fetchOsmBusinesses({
        city: targetCity,
        category: category || effectiveKeyword || 'all',
        limit: 15,
      })
      const validOsm = (osmPlaces || []).filter((o) => isLocationMatch(o, targetCity))
      const existingNames = new Set(filtered.map((b) => b.name.toLowerCase()))
      const newOsm = validOsm.filter((o) => !existingNames.has(o.name.toLowerCase()))
      filtered = [...filtered, ...newOsm]
    } catch {
      // ignore osm fallback errors
    }
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
        } else if (data.status === 'active' || data.paymentStatus === 'approved' || data.verified === true) {
          dbResults.push({ id: d.id, ...data, phone: formatTo234(data?.phone || '') })
        }
      })
    } catch {
      // ignore
    }
  }

  const validDbResults = dbResults.filter((b) => b.status !== 'deleted' && !b.isDeleted && !deletedIds.has(b.id))
  const existingIds = new Set(validDbResults.map((b) => b.id))
  const combined = [
    ...validDbResults,
    ...DEMO_BUSINESSES.filter((d) => !existingIds.has(d.id) && !deletedIds.has(d.id) && d.status !== 'deleted'),
  ]
  
  // Sort priority tiers first
  combined.sort((a, b) => {
    const weightA = tierWeight[a.subscriptionTier] || 0
    const weightB = tierWeight[b.subscriptionTier] || 0
    return weightB - weightA
  })

  const results = combined.slice(0, max)
  cacheService.set(cacheKey, results, 300) // Cache listings for 5 minutes
  return results
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

