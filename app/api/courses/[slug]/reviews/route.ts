import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { checkUserEnrollment } from '@/utils/enrollment'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })

    // Locate product
    const courseRes = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    if (!courseRes.docs || courseRes.docs.length === 0) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const courseId = courseRes.docs[0].id

    // Fetch approved reviews for this course
    const reviewsRes = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { product: { equals: courseId } },
          { approved: { not_equals: false } },
        ],
      },
      sort: '-createdAt',
      limit: 100,
      depth: 1,
    })

    const reviews = reviewsRes.docs || []
    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 5.0

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews,
      averageRating,
    })
  } catch (error: any) {
    console.error('GET /api/courses/[slug]/reviews error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'রিভিউ দিতে অনুগ্রহ করে আগে লগইন করুন।' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, body: reviewBody, rating } = body

    if (!reviewBody || typeof reviewBody !== 'string' || reviewBody.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'অনুগ্রহ করে আপনার রিভিউ বা মতামত লিখুন।' },
        { status: 400 }
      )
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5))

    // Locate product
    const courseRes = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    if (!courseRes.docs || courseRes.docs.length === 0) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const courseId = courseRes.docs[0].id
    const isEnrolled = await checkUserEnrollment(payload, session.user.id, String(courseId))

    // Create review
    const newReview = await payload.create({
      collection: 'reviews',
      data: {
        product: courseId,
        title: (title || 'কোর্স পর্যালোচনা').trim(),
        body: reviewBody.trim(),
        rating: numRating,
        author: session.user.name || 'শিক্ষার্থী',
        authorEmail: session.user.email || undefined,
        verified: isEnrolled,
        approved: true, // auto-approve so students see their reviews immediately
      },
    })

    return NextResponse.json({
      success: true,
      review: newReview,
    })
  } catch (error: any) {
    console.error('POST /api/courses/[slug]/reviews error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit review' },
      { status: 500 }
    )
  }
}

