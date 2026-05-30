import { useEffect, useState } from 'react'
import { listenSettings, DEFAULT_SETTINGS } from '../firebase/posts'

/**
 * Subscribes to an event's live settings and, as a side effect, applies the
 * event's primary/secondary colors to CSS custom properties so the whole app
 * re-themes itself per event. Cleans up its listener on unmount.
 *
 * @param {string} eventId
 * @returns {{settings: object, loaded: boolean}}
 */
export function useEventSettings(eventId) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!eventId) return
    const unsub = listenSettings(eventId, (s) => {
      setSettings(s)
      setLoaded(true)
    })
    return unsub
  }, [eventId])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--event-primary', settings.primaryColor)
    root.style.setProperty('--event-secondary', settings.secondaryColor)
  }, [settings.primaryColor, settings.secondaryColor])

  return { settings, loaded }
}
