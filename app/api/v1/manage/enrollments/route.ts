import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireApiKey } from '@/lib/apiKeyAuth'

// GET /api/v1/manage/enrollments
export const GET = requireApiKey(async (req: NextRequest) => {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const status = searchParams.get('status')
    const studentEmail = searchParams.get('studentEmail')?.trim().toLowerCase()
    const courseId = searchParams.get('courseId')
    const courseSlug = searchParams.get('courseSlug')

    const where: any = {}
    if (status) {
      where.status = { equals: status }
    }

    if (studentEmail) {
      const userRes = await payload.find({
        collection: 'users',
        where: { email: { equals: studentEmail } },
        limit: 1,
        overrideAccess: true,
      })
      if (userRes.docs.length > 0) {
        where.student = { equals: userRes.docs[0].id }
      } else {
        return NextResponse.json({
          success: true,
          totalEnrollments: 0,
          totalPages: 0,
          page: 1,
          limit,
          enrollments: [],
        })
      }
    }

    if (courseId) {
      where.course = { equals: courseId }
    } else if (courseSlug) {
      const courseRes = await payload.find({
        collection: 'products',
        where: { slug: { equals: courseSlug } },
        limit: 1,
        overrideAccess: true,
      })
      if (courseRes.docs.length > 0) {
        where.course = { equals: courseRes.docs[0].id }
      } else {
        return NextResponse.json({
          success: true,
          totalEnrollments: 0,
          totalPages: 0,
          page: 1,
          limit,
          enrollments: [],
        })
      }
    }

    const result = await payload.find({
      collection: 'enrollments' as any,
      where,
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    })

    const enrollments = result.docs.map((e: any) => ({
      id: e.id,
      studentId: typeof e.student === 'object' ? e.student?.id : e.student,
      studentEmail: typeof e.student === 'object' ? e.student?.email : null,
      studentName: typeof e.student === 'object' ? e.student?.name : null,
      courseId: typeof e.course === 'object' ? e.course?.id : e.course,
      courseTitle: typeof e.course === 'object' ? e.course?.title : null,
      courseSlug: typeof e.course === 'object' ? e.course?.slug : null,
      status: e.status,
      enrolledAt: e.enrolledAt,
      completedLessonsCount: Array.isArray(e.completedLessons) ? e.completedLessons.length : 0,
    }))

    return NextResponse.json({
      success: true,
      totalEnrollments: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      enrollments,
    })
  } catch (error: any) {
    console.error('API Error [GET /api/v1/manage/enrollments]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch enrollments.' },
      { status: 500 },
    )
  }
})

// POST /api/v1/manage/enrollments
export const POST = requireApiKey(async (req: NextRequest) => {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()

    const email = body.studentEmail?.trim().toLowerCase()
    const studentId = body.studentId
    const courseId = body.courseId
    const courseSlug = body.courseSlug
    const status = body.status || 'active'

    if (!email && !studentId) {
      return NextResponse.json(
        { success: false, error: 'Either "studentEmail" or "studentId" is required.' },
        { status: 400 },
      )
    }

    if (!courseId && !courseSlug) {
      return NextResponse.json(
        { success: false, error: 'Either "courseId" or "courseSlug" is required.' },
        { status: 400 },
      )
    }

    // 1. Resolve Student
    let resolvedUserId = studentId
    let studentDoc: any = null

    if (email) {
      const userRes = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      })

      if (userRes.docs.length > 0) {
        studentDoc = userRes.docs[0]
        resolvedUserId = studentDoc.id
      } else {
        // Create user account safely
        const createdUser = await payload.create({
          collection: 'users',
          data: {
            name: body.studentName || email.split('@')[0],
            email,
            phone: body.phone || undefined,
            role: 'user',
            emailVerified: true,
          } as any,
          overrideAccess: true,
        })
        studentDoc = createdUser
        resolvedUserId = createdUser.id
      }
    } else if (studentId) {
      studentDoc = await payload.findByID({
        collection: 'users',
        id: studentId,
        overrideAccess: true,
      })
      if (!studentDoc) {
        return NextResponse.json({ success: false, error: 'Student user not found.' }, { status: 404 })
      }
    }

    // 2. Resolve Course
    let resolvedCourseId = courseId
    let courseDoc: any = null

    if (courseSlug) {
      const courseRes = await payload.find({
        collection: 'products',
        where: { slug: { equals: courseSlug } },
        limit: 1,
        overrideAccess: true,
      })
      if (courseRes.docs.length > 0) {
        courseDoc = courseRes.docs[0]
        resolvedCourseId = courseDoc.id
      } else {
        return NextResponse.json({ success: false, error: `Course with slug "${courseSlug}" not found.` }, { status: 404 })
      }
    } else if (courseId) {
      courseDoc = await payload.findByID({
        collection: 'products',
        id: courseId,
        overrideAccess: true,
      })
      if (!courseDoc) {
        return NextResponse.json({ success: false, error: `Course with ID "${courseId}" not found.` }, { status: 404 })
      }
    }

    // 3. Prevent duplicate enrollment
    const existingEnrollment = await payload.find({
      collection: 'enrollments' as any,
      where: {
        and: [
          { student: { equals: resolvedUserId } },
          { course: { equals: resolvedCourseId } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingEnrollment.docs.length > 0) {
      const existing = existingEnrollment.docs[0]
      // Update status if provided
      if (existing.status !== status) {
        const updated = await payload.update({
          collection: 'enrollments' as any,
          id: existing.id,
          data: { status } as any,
          overrideAccess: true,
        })
        return NextResponse.json({
          success: true,
          message: 'Existing enrollment status updated.',
          enrollment: updated,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Student is already enrolled in this course.',
        enrollment: existing,
      })
    }

    // 4. Create enrollment
    const enrollment = await payload.create({
      collection: 'enrollments' as any,
      data: {
        student: resolvedUserId,
        course: resolvedCourseId,
        status,
        enrolledAt: body.enrolledAt || new Date().toISOString(),
        completedLessons: [],
      } as any,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Student successfully enrolled in course.',
      enrollment: {
        id: enrollment.id,
        studentId: resolvedUserId,
        studentEmail: studentDoc?.email,
        courseId: resolvedCourseId,
        courseTitle: courseDoc?.title,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('API Error [POST /api/v1/manage/enrollments]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create enrollment.' },
      { status: 500 },
    )
  }
})

