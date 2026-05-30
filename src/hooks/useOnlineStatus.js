import { useEffect, useState } from 'react'

/**
 * Tracks browser connectivity so the upload form can warn the attendee the
 * moment their mobile connection drops (blueprint §5 — defensive processing).
 *
 * @returns {boolean} true when online
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
