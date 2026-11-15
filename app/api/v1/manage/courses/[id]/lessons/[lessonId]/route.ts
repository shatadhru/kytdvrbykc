import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireApiKey } from '@/lib/apiKeyAuth'

async function findCourse(payload: any, idOrSlug: string) {
  try {
    const doc = await payload.findByID({
      collection: 'products',
      id: idOrSlug,
      depth: 1,
      overrideAccess: true,
    })
    if (doc) return doc
  } catch {}

  const bySlug = await payload.find({
    collection: 'products',
    where: { slug: { equals: idOrSlug } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return bySlug.docs[0] || null
}

// GET /api/v1/manage/courses/[id]/lessons/[lessonId]
export const GET = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string; lessonId: string }> }) => {
  try {
    const { id, lessonId } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    const lessons = Array.isArray(course.lessons) ? course.lessons : []
    const lesson = lessons.find((l: any) => String(l.id) === String(lessonId))

    if (!lesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found in this course.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      courseId: course.id,
      courseTitle: course.title,
      lesson,
    })
  } catch (error: any) {
    console.error('API Error [GET /api/v1/manage/courses/[id]/lessons/[lessonId]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch lesson.' },
      { status: 500 },
    )
  }
})

// PUT / PATCH /api/v1/manage/courses/[id]/lessons/[lessonId]
export const PUT = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string; lessonId: string }> }) => {
  try {
    const { id, lessonId } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    const lessons = Array.isArray(course.lessons) ? [...course.lessons] : []
    const index = lessons.findIndex((l: any) => String(l.id) === String(lessonId))

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Lesson not found in this course.' }, { status: 404 })
    }

    const body = await req.json()
    const target = lessons[index]

    const updatedLesson = {
      ...target,
      ...(body.lessonTitle !== undefined && { lessonTitle: body.lessonTitle }),
      ...(body.moduleName !== undefined && { moduleName: body.moduleName }),
      ...(body.subjectName !== undefined && { subjectName: body.subjectName }),
      ...(body.subjectSlug !== undefined && { subjectSlug: body.subjectSlug }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isFreePreview !== undefined && { isFreePreview: Boolean(body.isFreePreview) }),
      ...(body.youtubeVideoIdOrUrl !== undefined && { youtubeVideoIdOrUrl: body.youtubeVideoIdOrUrl }),
      ...(body.youtubeUrl !== undefined && { youtubeVideoIdOrUrl: body.youtubeUrl }),
      ...(body.classSlideUrl !== undefined && { classSlideUrl: body.classSlideUrl }),
      ...(body.classNoteUrl !== undefined && { classNoteUrl: body.classNoteUrl }),
      ...(body.quranVersePreset !== undefined && { quranVersePreset: body.quranVersePreset }),
    }

    lessons[index] = updatedLesson
    lessons.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    await payload.update({
      collection: 'products',
      id: course.id,
      data: {
        lessons,
      } as any,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson updated successfully.',
      lesson: updatedLesson,
    })
  } catch (error: any) {
    console.error('API Error [PUT /api/v1/manage/courses/[id]/lessons/[lessonId]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update lesson.' },
      { status: 500 },
    )
  }
})

export const PATCH = PUT

// DELETE /api/v1/manage/courses/[id]/lessons/[lessonId]
export const DELETE = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string; lessonId: string }> }) => {
  try {
    const { id, lessonId } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    const lessons = Array.isArray(course.lessons) ? [...course.lessons] : []
    const filtered = lessons.filter((l: any) => String(l.id) !== String(lessonId))

    if (filtered.length === lessons.length) {
      return NextResponse.json({ success: false, error: 'Lesson not found in this course.' }, { status: 404 })
    }

    await payload.update({
      collection: 'products',
      id: course.id,
      data: {
        lessons: filtered,
      } as any,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: `Lesson (ID: ${lessonId}) deleted successfully from course "${course.title}".`,
      remainingLessons: filtered.length,
    })
  } catch (error: any) {
    console.error('API Error [DELETE /api/v1/manage/courses/[id]/lessons/[lessonId]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete lesson.' },
      { status: 500 },
    )
  }
})

