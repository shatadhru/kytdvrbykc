'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  BookOpen,
  ArrowLeft,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { CqQuestion } from '@/lib/questions/questions-db'

interface CqQuestionViewerProps {
  chapter: {
    id: string
    title: string
    subject_id: string
    category_id: string
  }
  subject: {
    id: string
    name: string
    category_id: string
  } | null
  questions: CqQuestion[]
  totalQuestions: number
}

export function CqQuestionViewer({
  chapter,
  subject,
  questions,
  totalQuestions,
}: CqQuestionViewerProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(() => new Set())
  const [selectedTopic, setSelectedTopic] = useState<string>('all')

  // Extract unique topics
  const topics = Array.from(new Set(questions.map((q) => q.topic).filter(Boolean)))

  const filteredQuestions = questions.filter((q) => {
    if (selectedTopic === 'all') return true
    return q.topic === selectedTopic
  })

  const toggleAnswer = (id: number) => {
    setExpandedAnswers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopyQuestion = (id: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('প্রশ্নটি ক্লিপবোর্ডে কপি করা হয়েছে!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card to-background p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
            <Link href="/exams">
              <ArrowLeft className="size-3.5 mr-1" />
              <span>এক্সাম পোর্টাল</span>
            </Link>
          </Button>
          <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
            {subject?.name || 'বিষয়'}
          </Badge>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
          {chapter.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          সৃজনশীল ও রচনামূলক প্রশ্ন ব্যাংক (CQ Archive) — এখানে প্রশ্নগুলো অনুশীলন, স্টাডি ও নোট তৈরির জন্য সম্পূর্ণ উন্মুক্ত।
        </p>

        <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">মোট সৃজনশীল প্রশ্ন: {totalQuestions} টি</span>
          <span>•</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">রিডিং ও প্র্যাকটিস মোড</span>
        </div>
      </div>

      {/* Topic Filter */}
      {topics.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-muted-foreground shrink-0">টপিক ফিল্টার:</span>
          <Button
            variant={selectedTopic === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTopic('all')}
            className="text-xs h-7 rounded-full"
          >
            সকল টপিক ({questions.length})
          </Button>
          {topics.map((t) => (
            <Button
              key={t}
              variant={selectedTopic === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTopic(t)}
              className="text-xs h-7 rounded-full shrink-0"
            >
              {t}
            </Button>
          ))}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isAnswerOpen = expandedAnswers.has(q.id)
          const isCopied = copiedId === q.id

          return (
            <Card key={q.id} className="border border-border shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {q.questionType}
                    </Badge>
                    {q.topic && q.topic !== 'General' && (
                      <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                        {q.topic}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyQuestion(q.id, q.questionText)}
                    className="h-7 px-2 text-[11px] text-muted-foreground gap-1"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>কপি</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-2 space-y-3">
                {/* Question Stem & Sub-questions */}
                <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line font-medium">
                  {q.questionText}
                </div>

                {/* Model Answer / Solution Toggle if available */}
                {q.explanation && q.explanation.trim() !== '' && (
                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAnswer(q.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 h-7 px-2 gap-1"
                    >
                      <HelpCircle className="size-3" />
                      <span>{isAnswerOpen ? 'উত্তর সংক্ষেপ লুকান' : 'উত্তর নির্দেশিকা ও ব্যাখ্যা দেখুন'}</span>
                      {isAnswerOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </Button>

                    {isAnswerOpen && (
                      <div className="mt-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-xl p-8 space-y-2">
            <FileText className="size-10 mx-auto text-muted-foreground/60" />
            <h3 className="text-base font-bold text-foreground">কোন প্রশ্ন পাওয়া যায়নি</h3>
            <p className="text-xs text-muted-foreground">
              এই টপিকে কোনো সৃজনশীল প্রশ্ন পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

