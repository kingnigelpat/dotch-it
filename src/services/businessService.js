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

export const BUSINESS_COLLECTION = 'businesses'

export async function createBusiness({ uid, data }) {
  const ref = doc(collection(db, BUSINESS_COLLECTION))
  const payload = {
    ...data,
    ownerUid: uid,
    status: 'active',
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
  const snap = await getDoc(doc(db, BUSINESS_COLLECTION, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getBusinessByOwner(uid) {
  const q = query(
    collection(db, BUSINESS_COLLECTION),
    where('ownerUid', '==', uid),
    limit(1),
  )
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function deleteBusiness(id) {
  await deleteDoc(doc(db, BUSINESS_COLLECTION, id))
}

export async function searchBusinesses({ category, keyword, max = 30 }) {
  const col = collection(db, BUSINESS_COLLECTION)
  const clauses = [orderBy('createdAt', 'desc'), limit(max)]

  let q
  if (category) {
    q = query(col, where('category', '==', category), ...clauses)
  } else {
    q = query(col, ...clauses)
  }

  let snap
  try {
    snap = await getDocs(q)
  } catch {
    // Firestore needs a composite index for where + orderBy.
    // Fall back to ordering in memory so search still works.
    q = category ? query(col, where('category', '==', category)) : query(col)
    snap = await getDocs(q)
  }

  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  if (keyword) {
    const k = keyword.toLowerCase()
    results = results.filter(
      (b) =>
        (b.name && b.name.toLowerCase().includes(k)) ||
        (b.category && b.category.toLowerCase().includes(k)) ||
        (b.description && b.description.toLowerCase().includes(k)) ||
        (b.keywords &&
          Array.isArray(b.keywords) &&
          b.keywords.some((kw) => kw.toLowerCase().includes(k))),
    )
  }

  return results.slice(0, max)
}

export async function getAllBusinesses(max = 50) {
  const q = query(collection(db, BUSINESS_COLLECTION), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
