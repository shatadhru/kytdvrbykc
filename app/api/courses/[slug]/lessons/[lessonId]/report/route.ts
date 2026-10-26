import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'

const VALID_ISSUE_TYPES = [
  'video_error',
  'audio_issue',
  'material_issue',
  'content_mistake',
  'other',
] as const

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const { slug, lessonId } = await params
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    // 1. Enforce student authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'রিপোর্ট সাবমিট করতে অনুগ্রহ করে প্রথমে লগইন করুন।' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { issueType, description, lessonTitle } = body

    // 2. Validate issue type
    if (!issueType || !VALID_ISSUE_TYPES.includes(issueType)) {
      return NextResponse.json(
        { success: false, error: 'সঠিক সমস্যার ধরন নির্বাচন করুন।' },
        { status: 400 }
      )
    }

    // 3. Validate description
    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'সমস্যার বিবরণ কমপক্ষে ৫ অক্ষরের হতে হবে।' },
        { status: 400 }
      )
    }

    if (description.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'সমস্যার বিবরণ সর্বোচ্চ ২০০০ অক্ষরের মধ্যে হতে হবে।' },
        { status: 400 }
      )
    }

    // 4. Rate-limit / brute-force spam mitigation (max 3 reports in 5 minutes per user)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const recentReports = await payload.find({
      collection: 'lesson-reports' as any,
      where: {
        and: [
          { student: { equals: session.user.id } },
          { createdAt: { greater_than: fiveMinutesAgo } },
        ],
      },
      limit: 5,
      depth: 0,
    })

    if (recentReports.totalDocs >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'আপনি অতি সম্প্রতি একাধিক রিপোর্ট জমা দিয়েছেন। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।',
        },
        { status: 429 }
      )
    }

    // 5. Locate course
    const courseRes = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    if (!courseRes.docs || courseRes.docs.length === 0) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const courseDoc = courseRes.docs[0]

    // 6. Create report document
    await payload.create({
      collection: 'lesson-reports' as any,
      data: {
        course: courseDoc.id,
        lessonId,
        lessonTitle: (lessonTitle || 'লেকচার').trim(),
        student: session.user.id,
        studentName: session.user.name || 'শিক্ষার্থী',
        studentEmail: session.user.email || '',
        issueType,
        description: description.trim(),
        status: 'pending',
      } as any,
    })

    return NextResponse.json({
      success: true,
      message: 'আপনার রিপোর্টটি সফলভাবে গ্রহণ করা হয়েছে। টিম দ্রুত বিষয়টি খতিয়ে দেখবে।',
    })
  } catch (error: any) {
    console.error('POST /api/courses/[slug]/lessons/[lessonId]/report error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit report' },
      { status: 500 }
    )
  }
}

