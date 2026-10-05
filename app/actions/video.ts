'use server'

import { decryptVideoHash } from '@/payload/utils/videoHash'

/**
 * Server Action: Replaces the anti-piracy video hash back into the playable URL.
 * Runs strictly on the server to prevent exposing keys or raw URLs in client bundles.
 */
export async function resolveVideoHash(
  hash: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!hash) {
    return { success: false, error: 'No video hash provided.' }
  }

  // If a standard URL was passed directly (e.g. preview/dev), return it
  if (hash.startsWith('http://') || hash.startsWith('https://') || hash.startsWith('/')) {
    return { success: true, url: hash }
  }

  const result = decryptVideoHash(hash)
  if (!result.success) {
    return { success: false, error: result.error }
  }

  return { success: true, url: result.url }
}
