export type SlugifyArgs = {
  data?: Record<string, unknown>
  req?: unknown
  valueToSlugify?: unknown
}

/**
 * Unicode-safe slugify function supporting Bengali and international characters.
 * Fixes Payload's default slugify which strips non-ASCII characters via `/[^\w-]+/g`,
 * causing Bengali titles to become empty strings and failing validation.
 */
export const unicodeSlugify = ({ valueToSlugify, data }: SlugifyArgs): string => {
  const raw = String(
    valueToSlugify ||
    data?.title ||
    data?.name ||
    ''
  ).trim()

  if (!raw) {
    const fallbackId = data?.id
    return fallbackId ? String(fallbackId) : `slug-${Date.now().toString(36)}`
  }

  const slug = raw
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/^-+|-+$/g, '')

  if (!slug) {
    const fallbackId = data?.id
    return fallbackId ? String(fallbackId) : `slug-${Date.now().toString(36)}`
  }

  return slug
}
