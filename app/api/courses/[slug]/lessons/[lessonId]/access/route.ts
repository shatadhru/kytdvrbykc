import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { encryptVideoUrl } from '@/utils/videoHash'
import { extractCleanId } from '@/utils/extractId'

// shortcut: no rate-limit here; add one if abuse is detected in prod logs.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> },
) {
  try {
    const { slug, lessonId } = await params
    const payload = await getPayload({ config })

    // 1. Fetch course with ONLY the lessons array (admin context to read the video URL)
    const result = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true, // we perform our own enrollment check below
    })

    const course = result.docs[0]
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    // 2. Locate the requested lesson
    const lesson = (course.lessons ?? []).find((l: any) => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found.' }, { status: 404 })
    }

    // 3. Check access: isFreePreview OR enrolled (paid order containing this product)
    const isFree = Boolean(lesson.isFreePreview)
    let isEnrolled = false
    let userId: string | undefined

    if (!isFree) {
      const session = await getServerSession(payload, req.headers)
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Login required to access this lesson.' },
          { status: 401 },
        )
      }
      userId = session.user.id

      // Look for a paid order from this user that contains this product
      const courseId = extractCleanId(course.id)
      const orders = await payload.find({
        collection: 'orders',
        where: {
          and: [
            { customer: { equals: userId } },
            { paymentStatus: { equals: 'paid' } },
          ],
        },
        limit: 50, // bounded to prevent memory exhaustion
        depth: 1,
      })

      isEnrolled = orders.docs.some((order: any) =>
        (order.items ?? []).some((item: any) => extractCleanId(item.product) === courseId),
      )

      if (!isEnrolled) {
        return NextResponse.json(
          { success: false, error: 'You are not enrolled in this course.' },
          { status: 403 },
        )
      }
    }

    // 4. Video URL must exist
    const rawUrl: string = lesson.youtubeVideoIdOrUrl ?? ''
    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: 'Video not available for this lesson.' },
        { status: 404 },
      )
    }

    // 5. Issue a time-limited AES-256-GCM encrypted token (4 hours, user-bound if authenticated)
    const token = encryptVideoUrl(rawUrl, {
      classId: lessonId,
      userId,          // undefined for free-preview — no user binding
      expiresInMs: 4 * 60 * 60 * 1000,
    })

    return NextResponse.json({
      success: true,
      token,
      lessonId,
      isFreePreview: isFree,
    })
  } catch (error: any) {
    console.error('GET /api/courses/[slug]/lessons/[lessonId]/access error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error.' },
      { status: 500 },
    )
  }
}

