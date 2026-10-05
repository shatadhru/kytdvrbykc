/**
 * Safely extracts a clean string ID from any Payload / MongoDB relationship, ObjectId, or document.
 * 
 * Prevents BSONError: "Cannot create Buffer from the passed potentialBuffer"
 * which occurs in MongoDB / BSON when accessing .id on raw BSON ObjectIds
 * (ObjectId.id returns a 12-byte binary Buffer/Uint8Array in BSON v6, NOT a string).
 */
export function extractCleanId(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  if (typeof value === 'object' && value !== null) {
    // 1. BSON ObjectId instance (always call toHexString() first)
    if (
      'toHexString' in value &&
      typeof (value as { toHexString: () => string }).toHexString === 'function'
    ) {
      return (value as { toHexString: () => string }).toHexString()
    }

    // 2. Populated Payload document with a string ID
    if ('id' in value && typeof (value as { id: unknown }).id === 'string') {
      return (value as { id: string }).id
    }

    // 3. Document with _id (Mongoose document or raw MongoDB document)
    if ('_id' in value && (value as { _id: unknown })._id) {
      return extractCleanId((value as { _id: unknown })._id)
    }

    // 4. Custom toString() implementation (e.g. ObjectId.toString())
    if (typeof (value as { toString?: () => string }).toString === 'function') {
      const str = (value as { toString: () => string }).toString()
      if (str && str !== '[object Object]') {
        return str
      }
    }
  }

  const str = String(value)
  return str === '[object Object]' || str === 'undefined' || str === 'null' ? '' : str
}
