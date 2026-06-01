import { useEffect, useState } from 'react'
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from '../firebase/config'
import Spinner from './Spinner'
import Button from './Button'
import { t } from '../i18n/strings'

const ALLOWED_EMAIL = 'danilo@tezzutezzu.com'

/**
 * Secure client-side Google Authentication Gate.
 * restircts access to all routes wrapped by this gate to only 'danilo@tezzutezzu.com'.
 */
export default function AdminGate({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Listen for Firebase authentication state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      setAuthError(null)
    })

    return unsub
  }, [])

  // Trigger Google popup sign in flow
  const handleLogin = async () => {
    if (!auth) return
    setLoading(true)
    setAuthError(null)
    try {
      const provider = new GoogleAuthProvider()
      // Force Google to show account selection screen
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Google Login Error:', err)
      setAuthError(err.message || 'Impossibile completare l\'accesso.')
      setLoading(false)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    if (!auth) return
    setLoading(true)
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Logout Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink-950 px-4">
        <Spinner label={t.adminGate.loading} />
      </div>
    )
  }

  // 2. User not logged in
  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink-950 px-4 relative overflow-hidden">
        {/* Radial background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-800/90 p-8 shadow-2xl backdrop-blur relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-2xl border border-white/10 shadow-inner">
            🔐
          </div>
          <h1 className="mb-2 text-2xl font-black tracking-tight text-white">
            {t.adminGate.title}
          </h1>
          <p className="mb-6 text-sm text-white/50 leading-relaxed">
            {t.adminGate.subtitle}
          </p>
          
          {authError && (
            <p className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="flex w-full items-center justify-center rounded-xl bg-white text-ink-950 font-bold px-5 py-3.5 shadow-lg transition hover:bg-white/90 active:scale-98 cursor-pointer"
          >
            <svg className="mr-3 h-5 w-5 select-none" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t.adminGate.loginWithGoogle}
          </button>
        </div>
      </div>
    )
  }

  // 3. Logged in but NOT authorized
  if (user.email !== ALLOWED_EMAIL) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink-950 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-ink-800/90 p-8 shadow-2xl backdrop-blur relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-2xl border border-rose-500/20 text-rose-400 shadow-inner">
            ⚠️
          </div>
          <h1 className="mb-2 text-2xl font-black tracking-tight text-rose-400">
            {t.adminGate.deniedTitle}
          </h1>
          <p className="mb-6 text-sm text-white/60 leading-relaxed">
            {t.adminGate.deniedSubtitle(user.email)}
          </p>

          <Button variant="reject" onClick={handleLogout} className="w-full py-3">
            🚪 {t.adminGate.signOut}
          </Button>
        </div>
      </div>
    )
  }

  // 4. Logged in and perfectly authorized
  return children
}
