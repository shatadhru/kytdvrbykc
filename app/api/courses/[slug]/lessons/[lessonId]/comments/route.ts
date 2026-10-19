import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const { slug, lessonId } = await params
    const payload = await getPayload({ config })

    // 1. Locate product/course
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

    // 2. Fetch comments for this course and lessonId
    const commentsRes = await payload.find({
      collection: 'lesson-comments' as any,
      where: {
        and: [
          { course: { equals: courseId } },
          { lessonId: { equals: lessonId } },
          { status: { not_equals: 'flagged' } },
        ],
      },
      sort: 'createdAt',
      limit: 100,
      depth: 1,
    })

    const rawComments = commentsRes.docs || []

    // 3. Thread comments and replies in O(N) using a Map
    const commentMap = new Map<string, any>()
    const rootComments: any[] = []

    for (const item of rawComments) {
      const commentObj = {
        id: String(item.id),
        content: (item as any).content,
        createdAt: (item as any).createdAt,
        author: {
          id: (item as any).author?.id || (item as any).author,
          name: (item as any).author?.name || 'শিক্ষার্থী',
          image: (item as any).author?.image || null,
          role: (item as any).author?.role || 'student',
        },
        parentId: (item as any).parent
          ? String(typeof (item as any).parent === 'object' ? (item as any).parent?.id : (item as any).parent)
          : null,
        replies: [],
      }
      commentMap.set(commentObj.id, commentObj)
    }

    for (const comment of commentMap.values()) {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId).replies.push(comment)
      } else {
        rootComments.push(comment)
      }
    }

    return NextResponse.json({
      success: true,
      comments: rootComments.reverse(), // Newest discussions on top
      total: rawComments.length,
    })
  } catch (error: any) {
    console.error('GET /api/courses/[slug]/lessons/[lessonId]/comments error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const { slug, lessonId } = await params
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'মন্তব্য করতে অনুগ্রহ করে আগে লগইন করুন।' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { content, parentId } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'অনুগ্রহ করে আপনার মন্তব্য লিখুন।' },
        { status: 400 }
      )
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'মন্তব্য সর্বোচ্চ ২০০০ অক্ষরের মধ্যে হতে হবে।' },
        { status: 400 }
      )
    }

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

    // Create the comment
    const newComment = await payload.create({
      collection: 'lesson-comments' as any,
      data: {
        course: courseId,
        lessonId,
        author: session.user.id,
        content: content.trim(),
        parent: parentId || undefined,
        status: 'approved',
      } as any,
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: String(newComment.id),
        content: (newComment as any).content,
        createdAt: (newComment as any).createdAt,
        author: {
          id: session.user.id,
          name: session.user.name || 'শিক্ষার্থী',
          image: (session.user as any).image || null,
          role: (session.user as any).role || 'student',
        },
        parentId: parentId || null,
        replies: [],
      },
    })
  } catch (error: any) {
    console.error('POST /api/courses/[slug]/lessons/[lessonId]/comments error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to post comment' },
      { status: 500 }
    )
  }
}

