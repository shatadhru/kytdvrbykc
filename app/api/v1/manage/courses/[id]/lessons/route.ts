import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireApiKey } from '@/lib/apiKeyAuth'
import crypto from 'crypto'

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

// GET /api/v1/manage/courses/[id]/lessons
export const GET = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    const lessons = Array.isArray(course.lessons) ? course.lessons : []

    return NextResponse.json({
      success: true,
      courseId: course.id,
      courseTitle: course.title,
      totalLessons: lessons.length,
      lessons,
    })
  } catch (error: any) {
    console.error('API Error [GET /api/v1/manage/courses/[id]/lessons]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch course lessons.' },
      { status: 500 },
    )
  }
})

// POST /api/v1/manage/courses/[id]/lessons
export const POST = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    const body = await req.json()

    if (!body.lessonTitle) {
      return NextResponse.json(
        { success: false, error: '"lessonTitle" is required.' },
        { status: 400 },
      )
    }

    const existingLessons = Array.isArray(course.lessons) ? [...course.lessons] : []
    const newLessonId = body.id || crypto.randomBytes(12).toString('hex')

    const newLesson: any = {
      id: newLessonId,
      lessonTitle: body.lessonTitle,
      moduleName: body.moduleName || 'General',
      subjectName: body.subjectName || 'General',
      subjectSlug: (body.subjectSlug || body.subjectName || 'general').toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      duration: body.duration || '45m',
      order: typeof body.order === 'number' ? body.order : existingLessons.length + 1,
      isFreePreview: Boolean(body.isFreePreview),
      youtubeVideoIdOrUrl: body.youtubeVideoIdOrUrl || body.youtubeUrl || '',
      classSlideUrl: body.classSlideUrl || '',
      classNoteUrl: body.classNoteUrl || '',
      quranVersePreset: body.quranVersePreset || 'none',
    }

    existingLessons.push(newLesson)

    // Sort by order
    existingLessons.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    const updated = await payload.update({
      collection: 'products',
      id: course.id,
      data: {
        lessons: existingLessons,
      } as any,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson added successfully.',
      lesson: newLesson,
      totalLessons: (updated.lessons as any[])?.length || existingLessons.length,
    }, { status: 201 })
  } catch (error: any) {
    console.error('API Error [POST /api/v1/manage/courses/[id]/lessons]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to add lesson.' },
      { status: 500 },
    )
  }
})

