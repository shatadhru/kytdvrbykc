import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireApiKey } from '@/lib/apiKeyAuth'

// GET /api/v1/manage/courses
export const GET = requireApiKey(async (req: NextRequest) => {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    if (status) {
      where._status = { equals: status }
    }
    if (search) {
      where.or = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const result = await payload.find({
      collection: 'products',
      where,
      page,
      limit,
      depth: 1,
      overrideAccess: true,
      select: {
        id: true,
        title: true,
        slug: true,
        priceInBDT: true,
        thumbnail: true,
        thumbnailUrl: true,
        introductoryVideo: true,
        _status: true,
        createdAt: true,
        updatedAt: true,
        subjects: true,
        lessons: true,
      },
    })

    const courses = result.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      price: doc.priceInBDT ?? doc.price ?? 0,
      status: doc._status,
      thumbnail:
        (typeof doc.thumbnail === 'object' ? doc.thumbnail?.url || doc.thumbnail?.externalUrl : null) ||
        doc.thumbnailUrl ||
        (typeof doc.thumbnail === 'string' && doc.thumbnail.startsWith('http') ? doc.thumbnail : null) ||
        null,
      introductoryVideo: doc.introductoryVideo || '',
      totalLessons: Array.isArray(doc.lessons) ? doc.lessons.length : 0,
      totalSubjects: Array.isArray(doc.subjects) ? doc.subjects.length : 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      totalCourses: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      courses,
    })
  } catch (error: any) {
    console.error('API Error [GET /api/v1/manage/courses]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch courses.' },
      { status: 500 },
    )
  }
})

// POST /api/v1/manage/courses
export const POST = requireApiKey(async (req: NextRequest) => {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Both "title" and "slug" are required.' },
        { status: 400 },
      )
    }

    const cleanSlug = body.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check slug collision
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: cleanSlug } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { success: false, error: `A course with slug "${cleanSlug}" already exists.` },
        { status: 409 },
      )
    }

    // Resolve or create thumbnail media
    let thumbnailId = body.thumbnailId
    if (!thumbnailId && body.thumbnailUrl) {
      // Find or create media doc for this URL
      const existingMedia = await payload.find({
        collection: 'media',
        where: { alt: { equals: body.title } },
        limit: 1,
        overrideAccess: true,
      })

      if (existingMedia.docs.length > 0) {
        thumbnailId = existingMedia.docs[0].id
      } else {
        const createdMedia = await payload.create({
          collection: 'media',
          data: {
            alt: body.title,
            url: body.thumbnailUrl,
          } as any,
          overrideAccess: true,
        })
        thumbnailId = createdMedia.id
      }
    }

    // Fallback thumbnail if none provided
    if (!thumbnailId) {
      const fallbackMedia = await payload.find({
        collection: 'media',
        limit: 1,
        overrideAccess: true,
      })
      if (fallbackMedia.docs.length > 0) {
        thumbnailId = fallbackMedia.docs[0].id
      }
    }

    const price = typeof body.priceInBDT === 'number' ? body.priceInBDT : (typeof body.price === 'number' ? body.price : 0)

    const courseData: any = {
      title: body.title,
      slug: cleanSlug,
      priceInBDT: price,
      price: price,
      isCourse: true,
      isFree: price === 0,
      introductoryVideo: body.introductoryVideo || '',
      _status: body.status || 'published',
      meta: {
        title: body.metaTitle || body.title,
        description: body.metaDescription || (typeof body.description === 'string' ? body.description.slice(0, 160) : ''),
      },
    }

    if (thumbnailId) {
      courseData.thumbnail = thumbnailId
    }

    if (Array.isArray(body.subjects) && body.subjects.length > 0) {
      courseData.subjects = body.subjects
    }

    if (Array.isArray(body.lessons) && body.lessons.length > 0) {
      courseData.lessons = body.lessons
    }

    const created = await payload.create({
      collection: 'products',
      data: courseData,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Course created successfully.',
      course: {
        id: created.id,
        title: created.title,
        slug: created.slug,
        priceInBDT: created.priceInBDT,
        status: created._status,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('API Error [POST /api/v1/manage/courses]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create course.' },
      { status: 500 },
    )
  }
})

