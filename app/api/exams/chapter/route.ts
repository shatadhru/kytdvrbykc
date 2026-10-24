import { NextRequest, NextResponse } from 'next/server'
import {
  getChapterById,
  getSubjectById,
  getExamQuestions,
  getCqQuestions,
} from '@/lib/questions/questions-db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const chapterId = searchParams.get('chapterId')
    const mode = searchParams.get('mode') || 'mcq' // 'mcq' | 'cq'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)))
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const topic = searchParams.get('topic') || undefined

    if (!chapterId) {
      return NextResponse.json({ error: 'Missing chapterId' }, { status: 400 })
    }

    const chapter = getChapterById(chapterId)
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    const subject = getSubjectById(chapter.subject_id)

    if (mode === 'mcq') {
      const questions = getExamQuestions(chapterId, limit)
      return NextResponse.json({
        chapter,
        subject,
        mode: 'mcq',
        totalQuestions: questions.length,
        allocatedMinutes: Math.max(10, questions.length), // Standard 1 min per question
        questions,
      })
    } else {
      const { total, questions } = getCqQuestions(chapterId, page, limit, topic)
      return NextResponse.json({
        chapter,
        subject,
        mode: 'cq',
        totalQuestions: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        questions,
      })
    }
  } catch (err: any) {
    console.error('Error fetching chapter questions:', err)
    return NextResponse.json({ error: 'Failed to load chapter questions' }, { status: 500 })
  }
}

