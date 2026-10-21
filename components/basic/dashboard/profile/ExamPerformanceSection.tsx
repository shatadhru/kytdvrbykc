'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ExamPerformanceSection() {
  const [loading, setLoading] = useState<boolean>(true)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/exams/history')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.submissions) {
          setSubmissions(data.submissions)
          setStats(data.stats)
        }
      })
      .catch((err) => console.error('Error fetching exam performance:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-teal-600" />
        <span>পরীক্ষার পারফরম্যান্স লোড হচ্ছে...</span>
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card className="border border-dashed border-border bg-card/60">
        <CardContent className="p-6 text-center space-y-3">
          <GraduationCap className="size-10 mx-auto text-teal-600/70" />
          <h3 className="text-sm font-bold text-foreground">
            কোনো পরীক্ষার রেকর্ড পাওয়া যায়নি
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            আপনি এখনও কোনো MCQ পরীক্ষায় অংশগ্রহণ করেননি। এখনই সম্পূর্ণ ফ্রিতে যেকোনো অধ্যায়ের পরীক্ষা দিতে পারেন।
          </p>
          <Button asChild size="sm" className="text-xs bg-teal-600 hover:bg-teal-500 text-white">
            <Link href="/exams">
              <BookOpen className="size-3.5 mr-1.5" />
              <span>এক্সাম পোর্টালে যান</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Aggregate Performance Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[11px] text-muted-foreground block">মোট পরীক্ষা সম্পন্ন</span>
            <span className="text-xl font-black text-foreground">{stats.totalExams} টি</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[11px] text-muted-foreground block">গড় স্কোর (%)</span>
            <span className="text-xl font-black text-teal-600">{stats.avgPercentage}%</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[11px] text-muted-foreground block">মোট সমাধানকৃত প্রশ্ন</span>
            <span className="text-xl font-black text-foreground">{stats.totalQuestions} টি</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <span className="text-[11px] text-muted-foreground block">সামগ্রিক একুরেসি</span>
            <span className="text-xl font-black text-emerald-600">{stats.overallAccuracy}%</span>
          </div>
        </div>
      )}

      {/* 2. Submissions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Award className="size-4 text-teal-600" />
            <span>সাম্প্রতিক পরীক্ষার ইতিহাস ({submissions.length})</span>
          </h3>
          <Button asChild variant="outline" size="sm" className="h-7 text-xs">
            <Link href="/exams">নতুন পরীক্ষা দিন</Link>
          </Button>
        </div>

        <div className="space-y-2">
          {submissions.map((sub: any) => {
            const isExpanded = expandedSubmissionId === sub.id
            const dateStr = sub.createdAt
              ? new Date(sub.createdAt).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''

            return (
              <div
                key={sub.id}
                className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-3 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-teal-600 border-teal-500/30">
                        {sub.classLevel || 'General'}
                      </Badge>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {sub.examTitle || `${sub.subject} - ${sub.chapter}`}
                      </h4>
                    </div>
                    <span className="text-[11px] text-muted-foreground block">{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">
                        {sub.score} / {sub.totalQuestions} ({sub.percentage}%)
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {sub.timeTakenSeconds ? `${Math.floor(sub.timeTakenSeconds / 60)}মি ${sub.timeTakenSeconds % 60}সে` : ''}
                      </span>
                    </div>

                    <Badge
                      className={`text-[10px] font-bold ${
                        sub.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {sub.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                    </Badge>

                    {Array.isArray(sub.answers) && sub.answers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedSubmissionId(isExpanded ? null : sub.id)
                        }
                        className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <span>{isExpanded ? 'উত্তর লুকান' : 'উত্তর দেখুন'}</span>
                        {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Detailed Question Breakdown */}
                {isExpanded && Array.isArray(sub.answers) && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <h5 className="text-xs font-semibold text-foreground">
                      প্রশ্নের উত্তর ও ফলাফল বিশদ:
                    </h5>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {sub.answers.map((ans: any, qIdx: number) => (
                        <div
                          key={ans.questionId || qIdx}
                          className={`rounded-lg border p-2.5 text-xs space-y-1.5 ${
                            ans.isCorrect
                              ? 'border-emerald-500/40 bg-emerald-500/5'
                              : ans.selectedOption
                              ? 'border-rose-500/40 bg-rose-500/5'
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-foreground">
                              {qIdx + 1}. {ans.questionText}
                            </span>
                            <span className="text-[10px] shrink-0 font-bold">
                              {ans.isCorrect ? (
                                <span className="text-emerald-600 flex items-center gap-0.5">
                                  <Check className="size-3" /> সঠিক
                                </span>
                              ) : (
                                <span className="text-rose-600 flex items-center gap-0.5">
                                  <X className="size-3" /> ভুল
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span>
                              আপনার উত্তর: <strong className="text-foreground">{ans.selectedOption || 'দেওয়া হয়নি'}</strong>
                            </span>
                            <span>
                              সঠিক উত্তর: <strong className="text-emerald-600">{ans.correctIndex} ({ans.correctAnswer})</strong>
                            </span>
                          </div>

                          {ans.explanation && (
                            <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40 whitespace-pre-line">
                              ব্যাখ্যা: {ans.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

