import {
  ref,
  push,
  set,
  update,
  remove,
  query,
  limitToLast,
  onValue,
  serverTimestamp,
} from 'firebase/database'
import { db } from './config'
import { APPROVED, postsNode, postPath, settingsPath } from './paths'
import { deleteImage } from './storage'

/** Sensible defaults so the UI renders even before settings load from RTDB. */
export const DEFAULT_SETTINGS = {
  primaryColor: '#1e3a8a',
  secondaryColor: '#3b82f6',
  maxCharacters: 300,
  rotationSpeedMs: 8000,
}

/** Admin view fetches a generous window of recent messages. */
const ADMIN_LIMIT = 200

/**
 * Subscribes to an event's settings node.
 * @returns {() => void} unsubscribe
 */
export function listenSettings(eventId, cb) {
  if (!db) return () => {}
  const r = ref(db, settingsPath(eventId))
  return onValue(r, (snap) => {
    cb({ ...DEFAULT_SETTINGS, ...(snap.val() || {}) })
  })
}

/**
 * Writes a brand-new submission. Posts are auto-approved: they go straight to
 * `approved_posts` (with `hidden: false`) and appear on the wall immediately.
 * Moderators later hide or delete anything unwanted from the dashboard.
 *
 * @returns {Promise<string>} the generated postId
 */
export async function submitPost({
  eventId,
  userId,
  userName,
  text,
  imageUrl,
  storagePath: imgPath,
}) {
  if (!db) throw new Error('Database is not configured.')

  const listRef = ref(db, postsNode(eventId, APPROVED))
  const newRef = push(listRef)

  await set(newRef, {
    userId,
    userName,
    text,
    imageUrl: imageUrl || null,
    storagePath: imgPath || null,
    hidden: false,
    timestamp: serverTimestamp(),
  })

  return newRef.key
}

/**
 * Live listener for the projected wall feed. Memory-constrained via
 * `limitToLast` and filtered so hidden posts never reach the screen.
 * Returns posts newest-last.
 * @returns {() => void} unsubscribe
 */
export function listenApproved(eventId, cb, max = 30) {
  if (!db) return () => {}
  const r = query(ref(db, postsNode(eventId, APPROVED)), limitToLast(max))
  return onValue(r, (snap) => {
    cb(toSortedArray(snap.val()).filter((p) => !p.hidden))
  })
}

/**
 * Live listener for the moderation dashboard: every message (including hidden
 * ones), newest-first, so staff can review and manage the full stream.
 * @returns {() => void} unsubscribe
 */
export function listenAllPosts(eventId, cb, max = ADMIN_LIMIT) {
  if (!db) return () => {}
  const r = query(ref(db, postsNode(eventId, APPROVED)), limitToLast(max))
  return onValue(r, (snap) => {
    cb(toSortedArray(snap.val()).reverse())
  })
}

/**
 * Hide or un-hide a post. Hidden posts stay in the database (reversible) but are
 * filtered out of the wall feed.
 */
export function setPostHidden(eventId, id, hidden) {
  if (!db) throw new Error('Database is not configured.')
  return update(ref(db, postPath(eventId, APPROVED, id)), { hidden })
}

/**
 * Permanently delete a post and best-effort remove its Storage image. Failing
 * to delete the image (e.g. already gone) does not block the record deletion.
 */
export async function deletePost(eventId, post) {
  if (!db) throw new Error('Database is not configured.')
  await remove(ref(db, postPath(eventId, APPROVED, post.id)))
  if (post.storagePath) {
    await deleteImage(post.storagePath).catch(() => {})
  }
}

/** Converts an RTDB object map into an array sorted ascending by timestamp. */
function toSortedArray(val) {
  if (!val) return []
  return Object.entries(val)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
}
