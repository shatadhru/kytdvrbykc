import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getChapterById,
  getSubjectById,
  getExamQuestions,
} from '@/lib/questions/questions-db'
import { McqExamRoom } from '@/components/basic/exams/McqExamRoom'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import { getPageTitle } from '@/config/site'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{
    chapterId: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterId } = await params
  const chapter = getChapterById(chapterId)
  if (!chapter) return { title: 'Exam Not Found' }

  return {
    title: getPageTitle(`MCQ পরীক্ষা - ${chapter.title}`),
    description: `${chapter.title} বিষয়ের স্ট্যান্ডার্ড টাইমারে ফ্রি লাইভ MCQ পরীক্ষা দিন।`,
  }
}

export default async function McqExamPage({ params }: Props) {
  const { chapterId } = await params
  const chapter = getChapterById(chapterId)

  if (!chapter) {
    notFound()
  }

  const subject = getSubjectById(chapter.subject_id)
  const questions = getExamQuestions(chapterId, 25)

  // Standard allocated time: 1 min per question (min 10 mins)
  const allocatedMinutes = Math.max(10, questions.length)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <McqExamRoom
          chapter={chapter}
          subject={subject}
          questions={questions}
          allocatedMinutes={allocatedMinutes}
        />
      </main>
      <Footer />
    </div>
  )
}

