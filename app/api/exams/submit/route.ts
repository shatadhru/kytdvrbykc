import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { gradeExamSubmission } from '@/lib/questions/questions-db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      chapterId,
      examTitle,
      classLevel,
      subject,
      chapter,
      answers,
      timeTakenSeconds = 0,
    } = body

    if (!chapterId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 })
    }

    // Grade submission on server side
    const gradingResult = gradeExamSubmission(chapterId, answers)

    // Check student session
    let savedToProfile = false
    let submissionId: string | null = null

    try {
      const payload = await getPayload({ config })
      const session = await getServerSession(payload, req.headers)

      if (session?.user?.id) {
        // Save to student's performance records
        const newDoc = await (payload as any).create({
          collection: 'exam-submissions',
          data: {
            examTitle: examTitle || `${subject} - ${chapter}`,
            student: session.user.id,
            studentName: session.user.name || 'শিক্ষার্থী',
            studentEmail: session.user.email || '',
            classLevel: classLevel || 'General',
            subject: subject || 'সাধারণ',
            chapter: chapter || 'সাধারণ',
            totalQuestions: gradingResult.totalQuestions,
            attempted: gradingResult.attempted,
            correctAnswers: gradingResult.correctAnswers,
            incorrectAnswers: gradingResult.incorrectAnswers,
            score: gradingResult.score,
            percentage: gradingResult.percentage,
            timeTakenSeconds: Math.max(0, parseInt(timeTakenSeconds, 10) || 0),
            passed: gradingResult.passed,
            answers: gradingResult.reviews,
          },
        })
        savedToProfile = true
        submissionId = String(newDoc.id)
      }
    } catch (saveErr) {
      console.warn('Could not save exam submission to Payload collection:', saveErr)
    }

    return NextResponse.json({
      success: true,
      result: gradingResult,
      savedToProfile,
      submissionId,
    })
  } catch (err: any) {
    console.error('Error in exam submission:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to process exam submission' },
      { status: 500 },
    )
  }
}

