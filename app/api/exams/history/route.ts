import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json({ submissions: [], stats: null, authenticated: false })
    }

    const { docs } = await (payload as any).find({
      collection: 'exam-submissions',
      where: {
        student: {
          equals: session.user.id,
        },
      },
      sort: '-createdAt',
      limit: 50,
    })

    // Calculate aggregated student performance metrics
    const totalExams = docs.length
    let totalQuestions = 0
    let totalCorrect = 0
    let passedCount = 0
    let totalScoreSum = 0

    for (const d of docs) {
      totalQuestions += Number(d.totalQuestions || 0)
      totalCorrect += Number(d.correctAnswers || 0)
      totalScoreSum += Number(d.percentage || 0)
      if (d.passed) passedCount++
    }

    const avgPercentage = totalExams > 0 ? Math.round(totalScoreSum / totalExams) : 0
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    return NextResponse.json({
      authenticated: true,
      submissions: docs,
      stats: {
        totalExams,
        totalQuestions,
        totalCorrect,
        passedCount,
        avgPercentage,
        overallAccuracy,
      },
    })
  } catch (err: any) {
    console.error('Error fetching exam history:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to load exam history' },
      { status: 500 },
    )
  }
}

