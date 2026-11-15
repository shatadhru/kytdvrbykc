import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { extractCleanId } from '@/utils/extractId'

// shortcut: toggle lesson completion on student's enrollment record
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const { slug, lessonId } = await params
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Login required' }, { status: 401 })
    }

    const userId = session.user.id

    // 1. Fetch course to get course ID and total lessons
    const courseRes = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    const course = courseRes.docs[0]
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const courseId = extractCleanId(course.id)
    const directLessons = Array.isArray((course as any).lessons) ? (course as any).lessons.length : 0
    const subjectLessons = Array.isArray((course as any).subjects)
      ? (course as any).subjects.reduce((sum: number, s: any) => sum + (Array.isArray(s?.lessons) ? s.lessons.length : 0), 0)
      : 0
    const totalLessons = Math.max(1, directLessons > 0 ? directLessons : subjectLessons)

    // 2. Find active enrollment
    const enrollmentRes = await payload.find({
      collection: 'enrollments' as any,
      where: {
        and: [
          { student: { equals: userId } },
          { course: { equals: courseId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let enrollment = enrollmentRes.docs[0] as any

    // If no enrollment document yet, create one if user is enrolled
    if (!enrollment) {
      // Check if user has paid order as fallback
      const ordersRes = await payload.find({
        collection: 'orders',
        where: {
          and: [
            { customer: { equals: userId } },
            { paymentStatus: { equals: 'paid' } },
          ],
        },
        limit: 20,
        depth: 0,
        overrideAccess: true,
      })

      const hasPaidOrder = ordersRes.docs.some((order: any) =>
        (order.items ?? []).some((item: any) => extractCleanId(item.product) === courseId)
      )

      if (!hasPaidOrder) {
        return NextResponse.json({ success: false, error: 'Not enrolled in this course' }, { status: 403 })
      }

      enrollment = await payload.create({
        collection: 'enrollments' as any,
        data: {
          student: userId,
          course: courseId,
          status: 'active',
          completedLessons: [],
        } as any,
        overrideAccess: true,
      })
    }

    // 3. Update completed lessons list
    const currentCompleted = new Set<string>(
      Array.isArray(enrollment.completedLessons) ? enrollment.completedLessons : []
    )

    const body = await req.json().catch(() => ({}))
    const forceState = typeof body.completed === 'boolean' ? body.completed : null

    let isCompleted: boolean
    if (forceState !== null) {
      if (forceState) currentCompleted.add(lessonId)
      else currentCompleted.delete(lessonId)
      isCompleted = forceState
    } else {
      if (currentCompleted.has(lessonId)) {
        currentCompleted.delete(lessonId)
        isCompleted = false
      } else {
        currentCompleted.add(lessonId)
        isCompleted = true
      }
    }

    const completedArray = Array.from(currentCompleted)
    const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedArray.length / totalLessons) * 100)) : 0

    await payload.update({
      collection: 'enrollments' as any,
      id: enrollment.id,
      data: {
        completedLessons: completedArray,
      } as any,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      completed: isCompleted,
      completedLessons: completedArray,
      progressPercent,
    })
  } catch (err: any) {
    console.error('Error updating lesson completion:', err)
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, completedLessons: [], progressPercent: 0 })
    }

    const courseRes = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    const course = courseRes.docs[0]
    if (!course) {
      return NextResponse.json({ success: false, completedLessons: [], progressPercent: 0 }, { status: 404 })
    }

    const courseId = extractCleanId(course.id)
    const directLessons = Array.isArray((course as any).lessons) ? (course as any).lessons.length : 0
    const subjectLessons = Array.isArray((course as any).subjects)
      ? (course as any).subjects.reduce((sum: number, s: any) => sum + (Array.isArray(s?.lessons) ? s.lessons.length : 0), 0)
      : 0
    const totalLessons = Math.max(1, directLessons > 0 ? directLessons : subjectLessons)

    const enrollmentRes = await payload.find({
      collection: 'enrollments' as any,
      where: {
        and: [
          { student: { equals: session.user.id } },
          { course: { equals: courseId } },
          { status: { equals: 'active' } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const enrollment = enrollmentRes.docs[0] as any
    const completedLessons = Array.isArray(enrollment?.completedLessons) ? enrollment.completedLessons : []
    const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedLessons.length / totalLessons) * 100)) : 0

    return NextResponse.json({
      success: true,
      completedLessons,
      progressPercent,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

