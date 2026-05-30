import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from './config'
import { storagePath } from './paths'

/**
 * Uploads a (already-compressed) image blob to Cloud Storage under
 * `{eventId}/pending/{fileName}` and returns both the public download URL and
 * the storage path (kept on the post so moderation can later delete the file).
 *
 * @param {object} args
 * @param {string} args.eventId
 * @param {Blob|File} args.blob   compressed image payload
 * @param {string} args.postId    used to build a collision-free file name
 * @returns {Promise<{imageUrl: string, storagePath: string}>}
 */
export async function uploadPendingImage({ eventId, blob, postId }) {
  if (!storage) throw new Error('Storage is not configured.')

  const ext = (blob.type && blob.type.split('/')[1]) || 'jpg'
  const fileName = `img_${postId}.${ext}`
  const path = storagePath(eventId, 'pending', fileName)
  const objectRef = storageRef(storage, path)

  await uploadBytes(objectRef, blob, { contentType: blob.type || 'image/jpeg' })
  const imageUrl = await getDownloadURL(objectRef)

  return { imageUrl, storagePath: path }
}

/**
 * Deletes a Storage object by its path. Used when a moderator permanently
 * deletes a post. Resolves even if Storage isn't configured.
 *
 * @param {string} path  the stored `storagePath` of the image
 */
export async function deleteImage(path) {
  if (!storage || !path) return
  await deleteObject(storageRef(storage, path))
}
