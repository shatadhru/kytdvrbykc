import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { encryptVideoUrl } from '@/payload/utils/videoHash'

// Public — no auth required. Never exposes youtubeVideoIdOrUrl.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
      // Only select the fields safe for public consumption
      select: {
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        introductoryVideo: true,
        gallery: true,
        priceInBDT: true,
        teachers: true,
        coordinators: true,
        categories: true,
        meta: true,
        subjects: {
          subjectName: true,
          subjectSlug: true,
          description: true,
        },
        lessons: {
          // youtubeVideoIdOrUrl is intentionally omitted — admin-only access control
          // already blocks it in Payload, but we also never select it here.
          lessonTitle: true,
          moduleName: true,
          subjectName: true,
          subjectSlug: true,
          duration: true,
          order: true,
          isFreePreview: true,
          id: true,
          classSlide: true,
          classNote: true,
          classSlideUrl: true,
          classNoteUrl: true,
          quranVersePreset: true,
          customVerseSurah: true,
          customVerseArabic: true,
          customVerseBangla: true,
        },
      },
    })

    const course: any = result.docs[0]
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    if (course.introductoryVideo) {
      course.introductoryVideo = encryptVideoUrl(course.introductoryVideo, {
        expiresInMs: 4 * 60 * 60 * 1000,
      })
    }

    return NextResponse.json(
      { success: true, course },
      {
        headers: {
          // ISR-friendly: cache 5 min, stale-while-revalidate 1 hour
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
        },
      },
    )
  } catch (error: any) {
    console.error('GET /api/courses/[slug]/overview error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error.' },
      { status: 500 },
    )
  }
}

