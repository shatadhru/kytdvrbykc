import { NextResponse } from 'next/server'
import {
  getAllCategories,
  getSubjectsByCategory,
  getChaptersBySubject,
  type QuestionSubject,
} from '@/lib/questions/questions-db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const categories = getAllCategories()
    const subjects = getSubjectsByCategory()

    // Map chapters to subjects in O(N)
    const subjectsWithChapters = subjects.map((subj: QuestionSubject) => ({
      ...subj,
      chapters: getChaptersBySubject(subj.id),
    }))

    return NextResponse.json(
      {
        categories,
        subjects: subjectsWithChapters,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    )
  } catch (err: any) {
    console.error('Error fetching exam catalog:', err)
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 })
  }
}

