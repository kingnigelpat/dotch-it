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

export const BUSINESS_COLLECTION = 'businesses'

// Rich initial sample businesses including popular Hotels & Restaurants across Nigeria
const DEMO_BUSINESSES = [
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
    phone: '+2348012345678',
    logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&auto=format&fit=crop',
    keywords: ['nike', 'shoes', 'sneakers', 'jordan', 'kicks', 'lagos', 'fashion'],
  },
  {
    id: 'hotel-transcorp-abuja',
    name: 'Transcorp Hilton Abuja',
    category: 'Hotel & Travel',
    description: 'Iconic 5-star luxury hotel in Maitama featuring executive suites, outdoor pool, casino, tennis courts & fine dining.',
    price: '₦180,000 - ₦650,000 / night',
    location: 'Maitama, Abuja',
    city: 'Abuja',
    verified: true,
    rating: '4.9',
    phone: '+2349088880000',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&auto=format&fit=crop',
    keywords: ['hotel', 'transcorp', 'hilton', 'abuja', 'maitama', 'lodging', 'resort', 'luxury', 'stay', 'rooms', '5 star'],
  },
  {
    id: 'hotel-eko-suites-lagos',
    name: 'Eko Hotels & Suites',
    category: 'Hotel & Travel',
    description: 'Iconic 5-star oceanfront hotel in Victoria Island with luxury rooms, convention center, spa & 8 international restaurants.',
    price: '₦150,000 - ₦550,000 / night',
    location: 'Victoria Island, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.9',
    phone: '+23412772700',
    logoUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&auto=format&fit=crop',
    keywords: ['hotel', 'eko hotel', 'suites', 'victoria island', 'lagos', 'vi', 'resort', 'convention', 'lodging', 'stay'],
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
    phone: '+2348099990011',
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
    phone: '+2348033334455',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'nkoyo', 'abuja', 'maitama', 'african dish', 'grill', 'food', 'suya', 'dining'],
  },
  {
    id: 'hotel-radisson-blu-lagos',
    name: 'Radisson Blu Anchorage Hotel',
    category: 'Hotel & Travel',
    description: 'Scenic waterfront luxury hotel along Lagos Lagoon featuring infinity pool, wellness spa, executive lounge & fine dining.',
    price: '₦140,000 - ₦420,000 / night',
    location: 'Victoria Island, Lagos',
    city: 'Lagos',
    verified: true,
    rating: '4.8',
    phone: '+23414610123',
    logoUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&auto=format&fit=crop',
    keywords: ['hotel', 'radisson', 'radisson blu', 'lagos', 'victoria island', 'waterfront', 'spa', 'lodging', 'vi'],
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
    phone: '+2348186868686',
    logoUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'shiro', 'sushi', 'asian', 'fine dining', 'beachfront', 'lagos', 'vi', 'food'],
  },
  {
    id: 'hotel-presidential-ph',
    name: 'Hotel Presidential Port Harcourt',
    category: 'Hotel & Travel',
    description: 'Premier 5-star hotel in Port Harcourt GRA featuring tennis courts, swimming pool, banquet halls & executive luxury suites.',
    price: '₦85,000 - ₦280,000 / night',
    location: 'GRA Phase 2, Port Harcourt',
    city: 'Port Harcourt',
    verified: true,
    rating: '4.7',
    phone: '+2348039001122',
    logoUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&auto=format&fit=crop',
    keywords: ['hotel', 'presidential', 'port harcourt', 'ph', 'gra', 'lodging', 'resort', 'accommodation', 'stay'],
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
    phone: '+2348066667788',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'bole', 'bole king', 'port harcourt', 'ph', 'roasted plantain', 'fish', 'food', 'gra'],
  },
  {
    id: 'hotel-golden-tulip-asaba',
    name: 'Golden Tulip Hotel & Conference Centre',
    category: 'Hotel & Travel',
    description: 'Luxury hotel & event center in Asaba offering fine dining, outdoor pool, modern conference suites and VIP services.',
    price: '₦65,000 - ₦220,000 / night',
    location: 'GRA, Asaba',
    city: 'Asaba',
    verified: true,
    rating: '4.7',
    phone: '+2348051112233',
    logoUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&auto=format&fit=crop',
    keywords: ['hotel', 'golden tulip', 'asaba', 'gra', 'lodging', 'delta', 'resort', 'event center', 'stay'],
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
    phone: '+2348077778899',
    logoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'amala', 'amala sky', 'ibadan', 'bodija', 'gbegiri', 'ewedu', 'goat meat', 'food', 'swallow'],
  },
  {
    id: 'hotel-kakanfo-ibadan',
    name: 'Kakanfo Inn & Conference Centre',
    category: 'Hotel & Travel',
    description: 'Renowned hospitable hotel in Ibadan featuring serene air-conditioned rooms, local & intercontinental cuisine, pool & gym.',
    price: '₦45,000 - ₦150,000 / night',
    location: 'Ring Road, Ibadan',
    city: 'Ibadan',
    verified: true,
    rating: '4.6',
    phone: '+2348022233445',
    logoUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&auto=format&fit=crop',
    keywords: ['hotel', 'kakanfo', 'ibadan', 'ring road', 'bodija', 'lodging', 'oyo', 'conference', 'stay'],
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
    phone: '+2348098765432',
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
    phone: '+2348011223344',
    logoUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop',
    keywords: ['restaurant', 'kilimanjaro', 'enugu', 'fast food', 'jollof', 'fried chicken', 'food', 'rice'],
  },
  {
    id: 'hotel-nike-lake-enugu',
    name: 'Nike Lake Resort Hotel',
    category: 'Hotel & Travel',
    description: 'Picturesque lakefront resort in Enugu featuring lush gardens, swimming pool, tennis court, boat rides & tranquil rooms.',
    price: '₦55,000 - ₦180,000 / night',
    location: 'Abakpa, Enugu',
    city: 'Enugu',
    verified: true,
    rating: '4.7',
    phone: '+2348044445566',
    logoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop',
    keywords: ['hotel', 'nike lake', 'resort', 'enugu', 'lakefront', 'lodging', 'stay', 'vacation'],
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
    phone: '+2348023456789',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&auto=format&fit=crop',
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
    phone: '+2348034567890',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop',
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
    phone: '+2348045678901',
    logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&auto=format&fit=crop',
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
    phone: '+2348056789012',
    logoUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=200&auto=format&fit=crop',
    image1Url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400&auto=format&fit=crop',
    keywords: ['cakes', 'birthday', 'bakery', 'pastries', 'asaba', 'dessert'],
  },
]

export async function createBusiness({ uid, data }) {
  const ref = doc(collection(db, BUSINESS_COLLECTION))
  const payload = {
    ...data,
    ownerUid: uid,
    status: 'active',
    verified: true,
    createdAt: new Date().toISOString(),
  }
  await setDoc(ref, payload)
  return { id: ref.id, ...payload }
}

export async function updateBusiness(id, data) {
  const ref = doc(db, BUSINESS_COLLECTION, id)
  await updateDoc(ref, data)
}

export async function getBusiness(id) {
  const demoMatch = DEMO_BUSINESSES.find((b) => b.id === id)
  if (demoMatch) return demoMatch

  try {
    const snap = await getDoc(doc(db, BUSINESS_COLLECTION, id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch {
    return null
  }
}

export async function getBusinessByOwner(uid) {
  try {
    const q = query(
      collection(db, BUSINESS_COLLECTION),
      where('ownerUid', '==', uid),
      limit(1),
    )
    const snap = await getDocs(q)
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
  } catch {
    return null
  }
}

export async function deleteBusiness(id) {
  try {
    await deleteDoc(doc(db, BUSINESS_COLLECTION, id))
  } catch (err) {
    console.warn('Could not delete firestore business:', err)
  }
}

export async function searchBusinesses({ category, keyword, location, max = 50 }) {
  let dbResults = []
  try {
    const col = collection(db, BUSINESS_COLLECTION)
    let q = category ? query(col, where('category', '==', category)) : query(col)
    const snap = await getDocs(q)
    dbResults = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.warn('Firestore fetch fallback:', err)
  }

  // Merge DB results with demo results
  const all = [...dbResults, ...DEMO_BUSINESSES]

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

  if (location && location !== 'Near me' && location !== 'Everywhere') {
    const locLower = location.toLowerCase()
    const knownCities = ['abuja', 'port harcourt', 'ibadan', 'asaba', 'enugu', 'kano', 'calabar', 'lagos', 'warri', 'benin']
    const kwMentionsOtherCity = keyword && knownCities.some((city) => keyword.toLowerCase().includes(city) && city !== locLower)

    if (!kwMentionsOtherCity) {
      const locMatch = filtered.filter(
        (b) =>
          (b.location && b.location.toLowerCase().includes(locLower)) ||
          (b.city && b.city.toLowerCase().includes(locLower))
      )
      // Use location match if available, otherwise fall back to all if user searched for specific keyword
      if (locMatch.length > 0) {
        filtered = locMatch
      }
    }
  }

  if (keyword) {
    const k = keyword.toLowerCase()
    filtered = filtered.filter(
      (b) =>
        (b.name && b.name.toLowerCase().includes(k)) ||
        (b.category && b.category.toLowerCase().includes(k)) ||
        (b.description && b.description.toLowerCase().includes(k)) ||
        (b.location && b.location.toLowerCase().includes(k)) ||
        (b.city && b.city.toLowerCase().includes(k)) ||
        (b.keywords &&
          Array.isArray(b.keywords) &&
          b.keywords.some((kw) => kw.toLowerCase().includes(k)))
    )
  }

  // If local results are few, dynamically scrape real OpenStreetMap POIs for free!
  if (filtered.length < 5) {
    try {
      const osmPlaces = await fetchOsmBusinesses({
        city: location && location !== 'Near me' ? location : 'Lagos',
        category: category || keyword || 'all',
        limit: 15,
      })
      const existingNames = new Set(filtered.map((b) => b.name.toLowerCase()))
      const newOsm = osmPlaces.filter((o) => !existingNames.has(o.name.toLowerCase()))
      filtered = [...filtered, ...newOsm]
    } catch {
      // ignore osm fallback errors
    }
  }

  return filtered.slice(0, max)
}

export async function getAllBusinesses(max = 50) {
  let dbResults = []
  try {
    const q = query(collection(db, BUSINESS_COLLECTION), limit(max))
    const snap = await getDocs(q)
    dbResults = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // ignore
  }

  const existingIds = new Set(dbResults.map((b) => b.id))
  const combined = [...dbResults, ...DEMO_BUSINESSES.filter((d) => !existingIds.has(d.id))]
  return combined.slice(0, max)
}

