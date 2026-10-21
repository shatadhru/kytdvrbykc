import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getChapterById,
  getSubjectById,
  getCqQuestions,
} from '@/lib/questions/questions-db'
import { CqQuestionViewer } from '@/components/basic/exams/CqQuestionViewer'
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
  if (!chapter) return { title: 'Chapter Not Found' }

  return {
    title: getPageTitle(`সৃজনশীল প্রশ্ন - ${chapter.title}`),
    description: `${chapter.title} বিষয়ের সকল সৃজনশীল ও রচনামূলক প্রশ্ন আর্কাইভ।`,
  }
}

export default async function CqQuestionsPage({ params }: Props) {
  const { chapterId } = await params
  const chapter = getChapterById(chapterId)

  if (!chapter) {
    notFound()
  }

  const subject = getSubjectById(chapter.subject_id)
  const { total, questions } = getCqQuestions(chapterId, 1, 50)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <CqQuestionViewer
          chapter={chapter}
          subject={subject}
          questions={questions}
          totalQuestions={total}
        />
      </main>
      <Footer />
    </div>
  )
}

