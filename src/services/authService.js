import { db, auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { formatTo234 } from '../utils/phoneUtils'

export async function registerUser({ email, password, name, phone = '', role, plan }) {
  if (!auth || !db) throw new Error('Firebase Authentication is not configured.')
  const userCred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCred.user, { displayName: name })
  
  const isVendor = role === 'vendor' || role === 'business'
  await setDoc(doc(db, 'users', userCred.user.uid), {
    uid: userCred.user.uid,
    name,
    email,
    phone: formatTo234(phone),
    role,
    paymentStatus: isVendor ? 'pending' : 'none',
    paymentApproved: false,
    selectedPlan: plan || (isVendor ? 'pro_1m' : 'free'),
    createdAt: serverTimestamp(),
  })

  // Trigger Firebase email verification in background
  try {
    await sendEmailVerification(userCred.user)
  } catch (verifyErr) {
    console.warn('Initial email verification request error:', verifyErr)
  }

  return userCred.user
}

export async function sendVerificationEmail(targetUser) {
  const u = targetUser || auth?.currentUser
  if (!u) throw new Error('No authenticated user found.')
  return sendEmailVerification(u)
}

export async function updateUserProfile(uid, data) {
  if (!uid) return
  const payload = { ...data }
  if (payload.phone !== undefined) {
    payload.phone = formatTo234(payload.phone)
  }

  // 1. Immediately cache in localStorage so updates survive reloads and offline state
  const localKey = `dotch_user_profile_${uid}`
  try {
    let existing = {}
    const raw = localStorage.getItem(localKey)
    if (raw) existing = JSON.parse(raw)
    const merged = { ...existing, ...payload }
    localStorage.setItem(localKey, JSON.stringify(merged))
  } catch (e) {
    console.warn('Could not cache user profile to localStorage:', e)
  }

  // 2. Persist to Firestore using setDoc with merge: true (handles existing and new docs)
  if (db) {
    try {
      const userRef = doc(db, 'users', uid)
      await setDoc(
        userRef,
        {
          ...payload,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (err) {
      console.warn('Firestore profile update warning (persisted locally):', err)
    }
  }
}


export async function getAllVendors() {
  if (!db) return []
  try {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['vendor', 'business'])
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return { uid: d.id, ...data, phone: formatTo234(data.phone || '') }
    })
  } catch (err) {
    console.warn('Could not fetch vendors with query, fallback to all users:', err)
    try {
      const allSnap = await getDocs(collection(db, 'users'))
      return allSnap.docs
        .map((d) => {
          const data = d.data()
          return { uid: d.id, ...data, phone: formatTo234(data.phone || '') }
        })
        .filter((u) => u.role === 'vendor' || u.role === 'business')
    } catch {
      return []
    }
  }
}

export async function approveVendorPayment(uid, planTier = 'pro_1m') {
  if (!db) return
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    paymentStatus: 'approved',
    paymentApproved: true,
    subscriptionTier: planTier,
    approvedAt: serverTimestamp(),
  })
}

export async function revokeVendorPayment(uid) {
  if (!db) return
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    paymentStatus: 'pending',
    paymentApproved: false,
    revokedAt: serverTimestamp(),
  })
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export async function loginUser(email, password) {
  if (!auth) throw new Error('Firebase Authentication is not configured.')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  if (!auth) return
  return signOut(auth)
}

export function watchAuth(onChange) {
  if (!auth) {
    onChange(null)
    return () => {}
  }
  return onAuthStateChanged(auth, onChange)
}

export async function getUserProfile(uid) {
  if (!uid) return null
  const localKey = `dotch_user_profile_${uid}`
  let localData = null
  try {
    const raw = localStorage.getItem(localKey)
    if (raw) localData = JSON.parse(raw)
  } catch (e) {}

  if (!db) return localData

  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const data = snap.data()
      const merged = {
        ...localData,
        ...data,
        phone: formatTo234(data.phone || localData?.phone || ''),
      }
      try {
        localStorage.setItem(localKey, JSON.stringify(merged))
      } catch (e) {}
      return merged
    }
    return localData
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore, using local cache:', err)
    return localData
  }
}

export function friendlyAuthError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Wrong email or password.'
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a minute.'
    case 'auth/email-already-in-use':
      return 'That email is already registered.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is currently unavailable. Please contact support.'
    default:
      return 'Something went wrong. Please try again or contact support.'
  }
}

