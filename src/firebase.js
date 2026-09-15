import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA6SeHjv96KdWwdeqGoIvFQRclnU5E-2Ug',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'search-4d9c2.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'search-4d9c2',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'search-4d9c2.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '205611120521',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:205611120521:web:f1a030a41c57bb5bcd1358',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-YV4C13VG1H',
}

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
)

let app
let auth = null
let db = null

try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} catch (err) {
  console.warn('Firebase initialization warning:', err)
}

export { auth, db }

