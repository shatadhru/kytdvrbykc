import type { Payload } from 'payload'

function cleanId(val: any): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null) {
    if (val.id) return String(val.id)
    if (val._id) return String(val._id)
  }
  return String(val)
}

/**
 * Creates enrollment records for all course items in a paid order.
 * Idempotent: will not create duplicate enrollments if one already exists.
 */
export async function createEnrollmentsForOrder(payload: Payload, order: any): Promise<void> {
  if (!order || order.paymentStatus !== 'paid' || !order.customer) return

  const studentId = cleanId(order.customer)
  if (!studentId) return

  const items = Array.isArray(order.items) ? order.items : []
  const orderId = cleanId(order.id || order._id)

  for (const item of items) {
    const courseId = cleanId(item.product)
    if (!courseId) continue

    try {
      // Check if active enrollment already exists
      const existing = await payload.find({
        collection: 'enrollments' as any,
        where: {
          and: [
            { student: { equals: studentId } },
            { course: { equals: courseId } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'enrollments' as any,
          data: {
            student: studentId,
            course: courseId,
            order: orderId || undefined,
            status: 'active',
            enrolledAt: new Date().toISOString(),
          } as any,
        })
      }
    } catch (err) {
      console.error(`[Enrollment] Failed to create enrollment for student ${studentId} in course ${courseId}:`, err)
    }
  }
}

/**
 * Verifies if a user is enrolled in a given course.
 * First checks the dedicated enrollments collection.
 * If not found, falls back to checking completed paid orders and automatically creates the missing enrollment record.
 */
export async function checkUserEnrollment(
  payload: Payload,
  userId: string | undefined | null,
  courseId: string | undefined | null
): Promise<boolean> {
  const cleanUserId = cleanId(userId)
  const cleanCourseId = cleanId(courseId)

  if (!cleanUserId || !cleanCourseId) return false

  try {
    // 1. Primary check: Dedicated enrollments collection
    const enrollmentRes = await payload.find({
      collection: 'enrollments' as any,
      where: {
        and: [
          { student: { equals: cleanUserId } },
          { course: { equals: cleanCourseId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (enrollmentRes.docs.length > 0) {
      return true
    }

    // 2. Fallback check: Paid orders (auto-sync to enrollments)
    const ordersRes = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { customer: { equals: cleanUserId } },
          { paymentStatus: { equals: 'paid' } },
        ],
      },
      limit: 50,
      depth: 1,
    })

    const matchingOrder = ordersRes.docs.find((order: any) =>
      (order.items ?? []).some((item: any) => cleanId(item.product) === cleanCourseId)
    )

    if (matchingOrder) {
      // Auto-migrate: create enrollment document so future checks hit the enrollments collection directly
      await createEnrollmentsForOrder(payload, matchingOrder)
      return true
    }

    return false
  } catch (err) {
    console.error(`[Enrollment] Error checking enrollment for student ${cleanUserId}:`, err)
    return false
  }
}
