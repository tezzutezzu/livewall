import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

/*
 * Firebase configuration is read from Vite environment variables so that
 * secrets never live in source control. Copy `.env.example` to `.env.local`
 * and fill in the values from your Firebase console.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * True when the build has real Firebase credentials wired in. When false the
 * UI surfaces a friendly "configure Firebase" notice instead of throwing, so
 * the project still boots for first-time setup and design review.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL,
)

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const db = app ? getDatabase(app) : null
export const storage = app ? getStorage(app) : null
export const auth = app ? getAuth(app) : null

let anonAuthPromise = null

/**
 * Silently signs the visitor in anonymously (per the blueprint, this blocks
 * malicious scripting and gives every post a stable userId). Memoized so the
 * sign-in only happens once per session.
 *
 * @returns {Promise<string|null>} the anonymous uid, or null if unconfigured
 */
export function ensureAnonAuth() {
  if (!auth) return Promise.resolve(null)
  if (anonAuthPromise) return anonAuthPromise

  anonAuthPromise = new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub()
        resolve(user.uid)
      }
    })
    signInAnonymously(auth).catch((err) => {
      unsub()
      reject(err)
    })
  })

  return anonAuthPromise
}
