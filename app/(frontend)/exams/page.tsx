import React from 'react'
import type { Metadata } from 'next'
import {
  getAllCategories,
  getSubjectsByCategory,
  getChaptersBySubject,
  type QuestionSubject,
} from '@/lib/questions/questions-db'
import { ExamPortalView } from '@/components/basic/exams/ExamPortalView'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import { getPageTitle, SiteConfig } from '@/config/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: getPageTitle('ফ্রি এক্সাম পোর্টাল ও প্রশ্নব্যাংক'),
  description:
    'এসএসসি ও এইচএসসি সকল বিষয়ের ফ্রি প্রশ্নব্যাংক, স্ট্যান্ডার্ড টাইমারসহ লাইভ MCQ পরীক্ষা এবং সৃজনশীল (CQ) প্রশ্ন আর্কাইভ।',
}

export default async function ExamsPage() {
  const categories = getAllCategories()
  const rawSubjects = getSubjectsByCategory()

  const subjects = rawSubjects.map((subj: QuestionSubject) => ({
    ...subj,
    chapters: getChaptersBySubject(subj.id),
  }))

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <ExamPortalView categories={categories} subjects={subjects} />
      </main>
      <Footer />
    </div>
  )
}

