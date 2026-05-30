import imageCompression from 'browser-image-compression'
import { t } from '../i18n/strings'

/**
 * Client-side compression pipeline (blueprint §4.1).
 *
 * Squeezes a raw smartphone capture (typically 4–12 MB) down to a lean payload
 * under ~600 KB before it ever touches the network, using a Web Worker so the
 * UI thread stays responsive. Falls back to the original file if compression
 * fails for any reason — a slightly larger upload beats a broken one.
 *
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function compressImage(file) {
  const options = {
    maxWidthOrHeight: 1200,
    maxSizeMB: 0.6,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: 'image/jpeg',
  }

  try {
    return await imageCompression(file, options)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Image compression failed, uploading original:', err)
    return file
  }
}

const MAX_BYTES = 15 * 1024 * 1024 // reject absurdly large / non-image inputs early

/** Lightweight client-side validation before we attempt any compression. */
export function validateImageFile(file) {
  if (!file) return t.validation.chooseImage
  if (!file.type.startsWith('image/')) return t.validation.notImage
  if (file.size > MAX_BYTES) return t.validation.tooLarge
  return null
}
