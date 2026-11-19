import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireApiKey } from '@/lib/apiKeyAuth'

// Helper to find course by Mongo ID or slug
async function findCourse(payload: any, idOrSlug: string) {
  try {
    const doc = await payload.findByID({
      collection: 'products',
      id: idOrSlug,
      depth: 2,
      overrideAccess: true,
    })
    if (doc) return doc
  } catch {
    // If not a valid ObjectId, search by slug
  }

  const bySlug = await payload.find({
    collection: 'products',
    where: { slug: { equals: idOrSlug } },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })

  return bySlug.docs[0] || null
}

// GET /api/v1/manage/courses/[id]
export const GET = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      course,
    })
  } catch (error: any) {
    console.error('API Error [GET /api/v1/manage/courses/[id]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch course.' },
      { status: 500 },
    )
  }
})

// PUT / PATCH /api/v1/manage/courses/[id]
export const PUT = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    const body = await req.json()
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.priceInBDT !== undefined) {
      updateData.priceInBDT = body.priceInBDT
      updateData.price = body.priceInBDT
      updateData.isFree = body.priceInBDT === 0
    }
    if (body.introductoryVideo !== undefined) updateData.introductoryVideo = body.introductoryVideo
    if (body.status !== undefined) updateData._status = body.status
    if (body.categories !== undefined) updateData.categories = body.categories
    if (body.teachers !== undefined) updateData.teachers = body.teachers
    if (body.description !== undefined) {
      if (typeof body.description === 'string') {
        updateData.description = {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    type: 'text',
                    format: 0,
                    detail: 0,
                    mode: 'normal',
                    style: '',
                    text: body.description,
                    version: 1,
                  },
                ],
                direction: 'ltr',
              },
            ],
            direction: 'ltr',
          },
        }
      } else {
        updateData.description = body.description
      }
    }
    if (body.meta !== undefined) updateData.meta = body.meta
    if (body.subjects !== undefined) updateData.subjects = body.subjects
    if (body.lessons !== undefined) updateData.lessons = body.lessons

    const updated = await payload.update({
      collection: 'products',
      id: course.id,
      data: updateData,
      overrideAccess: true,
      draft: false,
    })

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully.',
      course: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        priceInBDT: updated.priceInBDT,
        status: updated._status,
      },
    })
  } catch (error: any) {
    console.error('API Error [PUT /api/v1/manage/courses/[id]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update course.' },
      { status: 500 },
    )
  }
})

export const PATCH = PUT

// DELETE /api/v1/manage/courses/[id]
export const DELETE = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    await payload.delete({
      collection: 'products',
      id: course.id,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: `Course "${course.title}" (ID: ${course.id}) deleted successfully.`,
    })
  } catch (error: any) {
    console.error('API Error [DELETE /api/v1/manage/courses/[id]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete course.' },
      { status: 500 },
    )
  }
})

