import { db, auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'

export async function registerUser({ email, password, name, role }) {
  if (!auth || !db) throw new Error('Firebase Authentication is not configured.')
  const userCred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCred.user, { displayName: name })
  await setDoc(doc(db, 'users', userCred.user.uid), {
    uid: userCred.user.uid,
    name,
    email,
    role,
    createdAt: serverTimestamp(),
  })
  return userCred.user
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
  if (!db || !uid) return null
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data() : null
  } catch (err) {
    console.warn('Could not fetch user profile:', err)
    return null
  }
}
