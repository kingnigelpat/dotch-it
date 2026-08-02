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
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  return signOut(auth)
}

export function watchAuth(onChange) {
  return onAuthStateChanged(auth, onChange)
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}
