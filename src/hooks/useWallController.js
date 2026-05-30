import { useEffect, useRef, useState } from 'react'
import { listenApproved } from '../firebase/posts'

const MAX_VISIBLE = 16 // hard DOM cap (blueprint §4.3: 15–20 visible nodes)
const FETCH_LIMIT = 30 // limitToLast() memory constraint (room for hidden ones)
const IDLE_MS = 60_000 // lull threshold before fallback assets take over
const HEARTBEAT_MS = 10_000 // how often we evaluate the lull timer

/**
 * Drives the projected Live Wall.
 *
 * The wall is a direct mirror of the database: it re-renders on **every** change
 * to `approved_posts` — new posts appear instantly, and posts that get hidden or
 * deleted disappear instantly (`listenApproved` already filters hidden ones).
 * The newest `MAX_VISIBLE` posts are shown, capping the DOM so it can't balloon
 * over hours of operation. Cards are keyed by post id, so React mounts new ones
 * (with the entrance animation) and unmounts removed ones automatically.
 *
 * A heartbeat tracks the last time a *new* post arrived; after 60s of silence
 * it flips to `idle` so the UI can crossfade to fallback assets, and any new
 * post instantly clears `idle` again.
 *
 * @param {string} eventId
 * @returns {{ visible: object[], idle: boolean, totalApproved: number }}
 */
export function useWallController(eventId) {
  const [visible, setVisible] = useState([])
  const [idle, setIdle] = useState(false)
  const [totalApproved, setTotalApproved] = useState(0)

  const lastNewRef = useRef(Date.now())
  const seenRef = useRef(new Set())

  // --- Realtime subscription: the wall IS the snapshot ----------------------
  useEffect(() => {
    if (!eventId) return
    // Reset when the event changes.
    seenRef.current = new Set()
    lastNewRef.current = Date.now()
    setVisible([])
    setIdle(false)
    setTotalApproved(0)

    const unsub = listenApproved(
      eventId,
      (posts) => {
        setTotalApproved(posts.length)

        // Reset the lull timer whenever a genuinely new post id shows up.
        const hasNew = posts.some((p) => !seenRef.current.has(p.id))
        if (hasNew) {
          lastNewRef.current = Date.now()
          setIdle(false) // interrupt handler: live content beats fallback
        }
        seenRef.current = new Set(posts.map((p) => p.id))

        // Show the newest cards first, capped for the DOM (posts arrive oldest-first).
        setVisible(posts.slice(-MAX_VISIBLE).reverse())
      },
      FETCH_LIMIT,
    )

    return unsub
  }, [eventId])

  // --- Lull / heartbeat ------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setIdle(Date.now() - lastNewRef.current > IDLE_MS)
    }, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [])

  return { visible, idle, totalApproved }
}
