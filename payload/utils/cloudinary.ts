/**
 * Pure Cloudinary URL extraction and validation utilities.
 * Safe to import in both Server Components and Client Components.
 */

/**
 * Safely check if a given string is a Cloudinary asset (direct res.cloudinary link or public ID).
 * Disallows local image links (e.g. /images/..., ./..., relative paths, data URIs).
 */
export function isCloudinarySrc(src: string | null | undefined): boolean {
  if (!src || typeof src !== 'string') return false
  const trimmed = src.trim()
  if (!trimmed) return false

  // Direct Cloudinary URL
  if (trimmed.includes('res.cloudinary.com') || trimmed.includes('cloudinary.com')) {
    return true
  }

  // Reject local files, relative paths, data URIs, or non-Cloudinary external domains
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return false
  }

  // Cloudinary public ID (e.g. "nextload-media/logo" or "sample")
  return true
}

/**
 * Extracts the best available Cloudinary URL from a media field or API response property.
 * Priority: cloudinary.secure_url → secure_url → thumbnailURL (cloudinary) → url (cloudinary) → public_id
 * Returns null if no valid Cloudinary URL found.
 */
export function extractCloudinarySecureUrl(field: any): string | null {
  if (!field) return null
  if (typeof field === 'string') {
    const trimmed = field.trim()
    if (trimmed.startsWith('/api/media/file')) return null
    if (trimmed.includes('res.cloudinary.com') || (!trimmed.startsWith('/') && !trimmed.startsWith('http'))) {
      return trimmed
    }
    return null
  }
  if (typeof field === 'object') {
    if (field.cloudinary?.secure_url && typeof field.cloudinary.secure_url === 'string') {
      return field.cloudinary.secure_url
    }
    if (field.secure_url && typeof field.secure_url === 'string') {
      return field.secure_url
    }
    if (typeof field.thumbnailURL === 'string' && field.thumbnailURL.includes('res.cloudinary.com')) {
      return field.thumbnailURL
    }
    if (typeof field.url === 'string' && field.url.includes('res.cloudinary.com')) {
      return field.url
    }
    if (field.cloudinary?.public_id && typeof field.cloudinary.public_id === 'string') {
      return field.cloudinary.public_id
    }
  }
  return null
}

