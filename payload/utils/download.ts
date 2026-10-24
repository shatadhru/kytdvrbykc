/**
 * Helper to build a same-origin download URL for any lesson resource.
 * Routes through /api/download to bypass browser cross-origin download restrictions
 * and force instant attachment download with correct filenames.
 */
export function getDownloadUrl(url?: string | null, name?: string | null): string {
  if (!url || !url.trim()) return '#'
  const trimmed = url.trim()
  if (trimmed.startsWith('/api/download')) return trimmed
  const safeName = (name || 'lecture-material').trim()
  return `/api/download?url=${encodeURIComponent(trimmed)}&name=${encodeURIComponent(safeName)}`
}

