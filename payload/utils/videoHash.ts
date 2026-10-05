import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getSecretKey(): Buffer {
  const secret = process.env.PAYLOAD_SECRET || 'nextload-lms-super-secure-fallback-secret-2026'
  return crypto.createHash('sha256').update(secret).digest()
}

export interface VideoTokenPayload {
  url: string
  classId?: string
  userId?: string
  exp: number // Expiration timestamp (ms)
}

/**
 * 10,000% Piracy Protection:
 * Encrypts a raw video URL/ID into an authenticated, time-limited, tamper-proof AES-256-GCM hash.
 * 
 * @param url The raw YouTube or HLS video URL/ID
 * @param options.classId Optional class ID to tie the token to a specific class
 * @param options.userId Optional user ID to tie the token to a specific student
 * @param options.expiresInMs Expiration duration in ms (default: 4 hours)
 */
export function encryptVideoUrl(
  url: string,
  options?: {
    classId?: string
    userId?: string
    expiresInMs?: number
  }
): string {
  if (!url) return ''

  const key = getSecretKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const payload: VideoTokenPayload = {
    url,
    classId: options?.classId,
    userId: options?.userId,
    exp: Date.now() + (options?.expiresInMs ?? 4 * 60 * 60 * 1000), // 4 hours default
  }

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ])

  const tag = cipher.getAuthTag()

  // Format: iv + tag + ciphertext encoded as URL-safe base64
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url')
}

/**
 * Replaces the secure hash back into the playable video URL.
 * Automatically checks authenticity, tamper protection, expiration, and user binding.
 * 
 * @param hash The encrypted video hash
 * @param options.currentUserId Current user ID to prevent token sharing
 * @param options.classId Target class ID
 */
export function decryptVideoHash(
  hash: string,
  options?: {
    currentUserId?: string
    classId?: string
  }
): { success: true; url: string } | { success: false; error: string } {
  try {
    if (!hash) {
      return { success: false, error: 'Empty token.' }
    }

    const key = getSecretKey()
    const buffer = Buffer.from(hash, 'base64url')

    if (buffer.length < IV_LENGTH + TAG_LENGTH + 1) {
      return { success: false, error: 'Invalid token structure.' }
    }

    const iv = buffer.subarray(0, IV_LENGTH)
    const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const ciphertext = buffer.subarray(IV_LENGTH + TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8')

    const data: VideoTokenPayload = JSON.parse(decrypted)

    // Check expiration
    if (data.exp && Date.now() > data.exp) {
      return { success: false, error: 'Video token has expired. Please refresh the page.' }
    }

    // Anti-account sharing: If token is bound to a specific user, ensure same user is requesting
    if (data.userId && options?.currentUserId && data.userId !== options.currentUserId) {
      return { success: false, error: 'Unauthorized: This video token was issued to a different account.' }
    }

    // Ensure token belongs to the requested class
    if (data.classId && options?.classId && data.classId !== options.classId) {
      return { success: false, error: 'Video token does not match this class.' }
    }

    return { success: true, url: data.url }
  } catch {
    return { success: false, error: 'Invalid or tampered video hash.' }
  }
}
