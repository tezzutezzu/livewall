/**
 * Builds the public attendee join URL for an event — the target encoded in the
 * QR code on the Live Wall and the printed table tents.
 *
 * The public base is taken from `VITE_PUBLIC_BASE_URL` so the projected wall
 * shows the real deployed domain (e.g. https://dailysound-board.web.app) rather
 * than the machine's `localhost` origin. Falls back to the current origin when
 * the env var isn't set (handy in local dev).
 *
 * @param {string} eventId
 * @returns {string}
 */
export function joinUrl(eventId) {
  const base =
    import.meta.env.VITE_PUBLIC_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base.replace(/\/$/, '')}/join/${eventId}`
}
