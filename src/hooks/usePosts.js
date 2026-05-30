import { useEffect, useState } from 'react'
import { listenAllPosts, listenApproved } from '../firebase/posts'

/**
 * Live feed of every message for the moderation dashboard (newest-first,
 * including hidden posts). The listener is cleanly torn down on unmount /
 * eventId change.
 */
export function useAllPosts(eventId) {
  const [posts, setPosts] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!eventId) return
    const unsub = listenAllPosts(eventId, (list) => {
      setPosts(list)
      setLoaded(true)
    })
    return unsub
  }, [eventId])

  return { posts, loaded }
}

/**
 * Live approved feed, memory-capped via `limitToLast(max)`.
 * Returns posts newest-last.
 */
export function useApprovedPosts(eventId, max = 30) {
  const [posts, setPosts] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!eventId) return
    const unsub = listenApproved(
      eventId,
      (list) => {
        setPosts(list)
        setLoaded(true)
      },
      max,
    )
    return unsub
  }, [eventId, max])

  return { posts, loaded }
}
