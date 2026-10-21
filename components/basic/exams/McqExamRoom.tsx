'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  HelpCircle,
  Check,
  X,
  Send,
  Loader2,
  ShieldCheck,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import type {
  McqQuestionPublic,
  ExamGradingResult,
  GradedAnswerReview,
} from '@/lib/questions/questions-db'

interface McqExamRoomProps {
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
  questions: McqQuestionPublic[]
  allocatedMinutes: number
}

export function McqExamRoom({
  chapter,
  subject,
  questions,
  allocatedMinutes,
}: McqExamRoomProps) {
  // Exam progress state
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false)
  const [gradingResult, setGradingResult] = useState<ExamGradingResult | null>(null)
  const [savedToProfile, setSavedToProfile] = useState<boolean>(false)

  // Countdown timer state
  const totalSeconds = allocatedMinutes * 60
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate elapsed time
  const timeTakenSeconds = totalSeconds - secondsRemaining

  // Timer countdown hook
  useEffect(() => {
    if (examSubmitted) return

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examSubmitted])

  // Current question helper
  const currentQ = questions[currentIdx]
  const totalQ = questions.length
  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Handle Option Select
  const handleSelectOption = (optionKey: string) => {
    if (examSubmitted || !currentQ) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey,
    }))
  }

  // Clear current selection
  const handleClearSelection = () => {
    if (examSubmitted || !currentQ) return
    setSelectedAnswers((prev) => {
      const copy = { ...prev }
      delete copy[currentQ.id]
      return copy
    })
  }

  // Submit Exam to Server
  const handleSubmitExam = async () => {
    if (isSubmitting || examSubmitted) return
    setIsSubmitting(true)

    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id] || null,
      }))

      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: chapter.id,
          examTitle: `${subject?.name || 'বিষয়'} - ${chapter.title}`,
          classLevel: chapter.category_id.toUpperCase(),
          subject: subject?.name || 'সাধারণ',
          chapter: chapter.title,
          answers: payloadAnswers,
          timeTakenSeconds,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setGradingResult(data.result)
        setSavedToProfile(Boolean(data.savedToProfile))
        setExamSubmitted(true)
        toast.success('পরীক্ষা সফলভাবে সম্পন্ন হয়েছে!')
      } else {
        toast.error(data.error || 'ফলাফল তৈরি করতে সমস্যা হয়েছে।')
      }
    } catch (err) {
      console.error('Error submitting exam:', err)
      toast.error('ইন্টারনেট সংযোগ যাচাই করুন।')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If no questions in chapter
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="size-12 mx-auto text-amber-500" />
        <h2 className="text-xl font-bold">এই অধ্যায়ে কোনো প্রশ্ন পাওয়া যায়নি</h2>
        <p className="text-sm text-muted-foreground">
          অনুগ্রহ করে অন্য কোনো বিষয় বা অধ্যায় নির্বাচন করুন।
        </p>
        <Button asChild variant="outline">
          <Link href="/exams">এক্সাম পোর্টালে ফিরে যান</Link>
        </Button>
      </div>
    )
  }

  // ==========================================
  // RENDER: EXAM RESULTS VIEW (AFTER SUBMIT)
  // ==========================================
  if (examSubmitted && gradingResult) {
    const { totalQuestions, correctAnswers, incorrectAnswers, score, percentage, passed, reviews } =
      gradingResult

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Results Hero Banner */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 text-center space-y-4 shadow-sm ${
            passed
              ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-card to-background'
              : 'border-rose-500/30 bg-gradient-to-b from-rose-500/10 via-card to-background'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mx-auto">
            {passed ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="size-4" /> অভিনন্দন! আপনি উত্তীর্ণ হয়েছেন
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="size-4" /> আরও অনুশীলন প্রয়োজন
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            পরীক্ষার ফলাফল ও মূল্যায়ন
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            {subject?.name} • {chapter.title}
          </p>

          {/* Score Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] text-muted-foreground block">প্রাপ্ত নম্বর</span>
              <span className="text-2xl font-black text-foreground">
                {score} / {totalQuestions}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] text-muted-foreground block">শতকরা হার</span>
              <span
                className={`text-2xl font-black ${
                  passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                }`}
              >
                {percentage}%
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] text-muted-foreground block">সঠিক ও ভুল</span>
              <span className="text-xs font-bold block pt-1.5">
                <span className="text-emerald-600 font-bold">{correctAnswers} সঠিক</span> •{' '}
                <span className="text-rose-600 font-bold">{incorrectAnswers} ভুল</span>
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <span className="text-[11px] text-muted-foreground block">ব্যয়িত সময়</span>
              <span className="text-xl font-bold text-foreground">
                {Math.floor(timeTakenSeconds / 60)}মি {timeTakenSeconds % 60}সে
              </span>
            </div>
          </div>

          {/* Profile Save Notification */}
          {savedToProfile ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="size-4" />
              <span>এই পরীক্ষার ফলাফলটি আপনার প্রোফাইল রেকর্ডে সফলভাবে সংরক্ষিত হয়েছে।</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              <span>লগইন করা থাকলে প্রতিটি পরীক্ষার রেজাল্ট স্থায়ীভাবে প্রোফাইলে সংরক্ষিত থাকে।</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => {
                window.location.reload()
              }}
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>পুনরায় পরীক্ষা দিন</span>
            </Button>
            <Button asChild size="sm" className="text-xs h-9 bg-teal-600 hover:bg-teal-500 text-white">
              <Link href="/exams">
                <BookOpen className="size-3.5 mr-1.5" />
                <span>অন্যান্য অধ্যায় দেখুন</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs h-9">
              <Link href="/dashboard/profile">
                <User className="size-3.5 mr-1.5" />
                <span>প্রোফাইল পারফরম্যান্স</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Detailed Question by Question Review */}
        <div className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Award className="size-5 text-teal-600" />
              <span>সকল প্রশ্নের উত্তর ও বিশদ ব্যাখ্যা ({reviews.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              কোন প্রশ্নগুলোতে ভুল হয়েছে এবং সঠিক উত্তরের ব্যাখ্যা মনোযোগ সহকারে দেখে নাও।
            </p>
          </div>

          <div className="space-y-4">
            {reviews.map((rev: GradedAnswerReview, idx: number) => {
              const options = [
                { key: 'A', text: rev.optionA },
                { key: 'B', text: rev.optionB },
                { key: 'C', text: rev.optionC },
                { key: 'D', text: rev.optionD },
              ].filter((o) => o.text && o.text.trim() !== '')

              return (
                <div
                  key={rev.questionId || idx}
                  className={`rounded-xl border p-4 sm:p-5 bg-card shadow-xs transition-all ${
                    rev.isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : rev.selectedOption
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : 'border-border'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground rounded bg-muted/60 px-2 py-0.5">
                        {rev.topic || 'সাধারণ'}
                      </span>
                    </div>

                    <div>
                      {rev.isCorrect ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                          <Check className="size-3" /> সঠিক উত্তর (+১)
                        </Badge>
                      ) : rev.selectedOption ? (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <X className="size-3" /> ভুল উত্তর (০)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          উত্তর দেওয়া হয়নি
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-semibold text-foreground leading-relaxed mb-4">
                    {rev.questionText}
                  </p>

                  {/* Options List with Highlighted Answers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {options.map((opt) => {
                      const isUserChoice = rev.selectedOption?.toUpperCase() === opt.key
                      const isCorrectChoice =
                        rev.correctIndex?.toUpperCase() === opt.key ||
                        rev.correctAnswer?.trim().toLowerCase() === opt.text.trim().toLowerCase()

                      let optStyle = 'border-border bg-background/60 text-muted-foreground'
                      if (isCorrectChoice) {
                        optStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/50'
                      } else if (isUserChoice && !isCorrectChoice) {
                        optStyle = 'border-rose-500 bg-rose-500/15 text-rose-950 dark:text-rose-200 font-semibold ring-1 ring-rose-500/50'
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`rounded-lg border p-2.5 text-xs flex items-center justify-between gap-2 ${optStyle}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-5 rounded font-bold shrink-0 flex items-center justify-center bg-muted/70 text-[11px]">
                              {opt.key}
                            </span>
                            <span className="break-words leading-snug">{opt.text}</span>
                          </div>
                          {isCorrectChoice && (
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          {isUserChoice && !isCorrectChoice && (
                            <X className="size-4 text-rose-600 shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Dedicated Correct Answer Callout */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 shrink-0">
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        সঠিক উত্তর:
                      </span>
                      <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                        {rev.correctIndex ? `অপশন (${rev.correctIndex})` : ''} {rev.correctAnswer ? `— ${rev.correctAnswer}` : ''}
                      </span>
                    </div>
                    {rev.selectedOption ? (
                      <div className="text-[11px] text-muted-foreground">
                        আপনার উত্তর: <strong className={rev.isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>অপশন ({rev.selectedOption})</strong>
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground italic">
                        আপনি উত্তর দেননি
                      </div>
                    )}
                  </div>

                  {/* Detailed Explanation */}
                  {rev.explanation && rev.explanation.trim() !== '' && (
                    <div className="mt-2.5 p-3 rounded-lg bg-muted/60 border border-border text-xs space-y-1">
                      <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                        <HelpCircle className="size-3.5 text-teal-600 shrink-0" />
                        বিশদ ব্যাখ্যা:
                      </span>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-[11px] sm:text-xs">
                        {rev.explanation}
                      </p>
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

  // ==========================================
  // RENDER: ACTIVE TIMED EXAM VIEW
  // ==========================================
  const currentSelectedOption = currentQ ? selectedAnswers[currentQ.id] : undefined
  const isTimeRunningLow = secondsRemaining <= 300 // < 5 mins

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header with Chapter Title and Live Timer */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-teal-600 border-teal-500/30">
              {subject?.name || 'বিষয়'}
            </Badge>
            <span className="text-xs text-muted-foreground truncate">{chapter.title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            স্ট্যান্ডার্ড বহুনির্বাচনি (MCQ) পরীক্ষা
          </h1>
        </div>

        {/* Live Timer Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base shrink-0 self-start sm:self-auto ${
            isTimeRunningLow
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 animate-pulse'
              : 'bg-muted border-border text-foreground'
          }`}
        >
          <Clock className="size-4 text-teal-600" />
          <span>{formatTime(secondsRemaining)}</span>
          <span className="text-[10px] font-sans text-muted-foreground font-normal">বাকি সময়</span>
        </div>
      </div>

      {/* 2. Progress & Question Quick Navigation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            উত্তর করা হয়েছে: <strong className="text-foreground">{answeredCount}</strong> / {totalQ}
          </span>
          <span>অগ্রগতি: {progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />

        {/* Question Selector Numbers Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 pr-1">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q.id])
            const isCurrent = idx === currentIdx

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`size-7 rounded-md text-xs font-bold shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-teal-600 text-white ring-2 ring-teal-500/50'
                    : isAnswered
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Active Question Card */}
      {currentQ && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="p-4 sm:p-6 pb-3">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-foreground">
                প্রশ্ন {currentIdx + 1} / {totalQ}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-[11px]">
                টপিক: {currentQ.topic || 'সাধারণ'}
              </span>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-foreground leading-relaxed pt-1">
              {currentQ.questionText}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { key: 'A', text: currentQ.optionA },
                { key: 'B', text: currentQ.optionB },
                { key: 'C', text: currentQ.optionC },
                { key: 'D', text: currentQ.optionD },
              ]
                .filter((o) => o.text && o.text.trim() !== '')
                .map((opt) => {
                  const isSelected = currentSelectedOption === opt.key

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-500/10 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500/30'
                          : 'border-border bg-card hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <span
                        className={`size-6 rounded-md font-bold text-xs shrink-0 flex items-center justify-center ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="leading-snug pt-0.5">{opt.text}</span>
                    </button>
                  )
                })}
            </div>

            {/* Clear Selection Button */}
            {currentSelectedOption && (
              <div className="pt-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-xs text-muted-foreground hover:text-rose-500 h-7 px-2"
                >
                  উত্তর বাতিল করুন
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4. Navigation & Submit Bottom Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
          className="text-xs h-9 gap-1"
        >
          <ArrowLeft className="size-3.5" />
          <span>পূর্ববর্তী</span>
        </Button>

        <div className="flex items-center gap-2">
          {currentIdx < totalQ - 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIdx((p) => Math.min(totalQ - 1, p + 1))}
              className="text-xs h-9 gap-1"
            >
              <span>পরবর্তী</span>
              <ArrowRight className="size-3.5" />
            </Button>
          ) : null}

          {/* Final Submit Button */}
          <Button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            size="sm"
            className="text-xs h-9 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>ফলাফল তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                <span>পরীক্ষা সমাপ্ত করুন</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

