/*
 * Centralized RTDB path + Storage path builders.
 *
 * The blueprint mandates a deliberately *shallow* data shape:
 *   events/{eventId}/meta
 *   events/{eventId}/settings
 *   events/{eventId}/pending_posts/{postId}
 *   events/{eventId}/approved_posts/{postId}
 *   events/{eventId}/rejected_posts/{postId}
 *
 * Keeping every path in one place avoids typo'd node references scattered
 * across the listeners and write transactions.
 */

export const eventRoot = (eventId) => `events/${eventId}`
export const metaPath = (eventId) => `${eventRoot(eventId)}/meta`
export const settingsPath = (eventId) => `${eventRoot(eventId)}/settings`

export const PENDING = 'pending_posts'
export const APPROVED = 'approved_posts'
export const REJECTED = 'rejected_posts'

export const postsNode = (eventId, node) => `${eventRoot(eventId)}/${node}`
export const postPath = (eventId, node, postId) =>
  `${postsNode(eventId, node)}/${postId}`

/** Storage object path for an image in a given lifecycle stage. */
export const storagePath = (eventId, stage, fileName) =>
  `${eventId}/${stage}/${fileName}`
