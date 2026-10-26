'use client'

import { useState, useEffect } from 'react'
import CourseVideoPlayer from '@/components/basic/video/CourseVideoPlayer'
import {
  Play,
  BookOpen,
  ShieldCheck,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Download,
  FileText,
  Presentation,
  ExternalLink,
  Flag,
} from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LessonCommentsSection } from './LessonCommentsSection'
import LessonReportModal from './LessonReportModal'
import { getDownloadUrl } from '@/payload/utils/download'

export interface QuranVerseData {
  surah: string
  arabic?: string
  bangla: string
}

export interface ClassroomClassItem {
  id: string
  title: string
  subjectSlug: string
  subjectName?: string | null
  moduleName?: string | null
  order?: number | null
  duration?: string | null
  isFreePreview?: boolean | null
  videoSource?: string | null
  videoHash?: string | null
  classSlideUrl?: string | null
  classNoteUrl?: string | null
  classSlideName?: string | null
  classNoteName?: string | null
  quranVerse?: QuranVerseData | null
}

export interface ClassroomSubjectItem {
  name: string
  slug: string
  description?: string | null
}

export interface ClassroomCourseItem {
  id: string
  title: string
  slug?: string | null
  description?: string | null
  subjects?: ClassroomSubjectItem[] | null
  classes?: ClassroomClassItem[] | null
}

interface ClassroomViewProps {
  course: ClassroomCourseItem
  initialClasses: ClassroomClassItem[]
}

export default function ClassroomView({
  course,
  initialClasses,
}: ClassroomViewProps) {
  const [classes] = useState<ClassroomClassItem[]>(initialClasses)
  // Default to the first playable class (either first enrolled or first free preview with videoHash)
  const defaultClass = classes.find((c) => c.videoHash || c.isFreePreview) || classes[0]

  const [activeClassId, setActiveClassId] = useState<string>(defaultClass?.id || '')
  const [activeVideoHash, setActiveVideoHash] = useState<string | undefined>(
    defaultClass?.videoHash || undefined
  )
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [fetchingToken, setFetchingToken] = useState<boolean>(false)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(() => new Set())

  // Motivational Quranic Verse State
  const [verseModalOpen, setVerseModalOpen] = useState<boolean>(false)
  const [activeVerse, setActiveVerse] = useState<QuranVerseData | null>(null)
  const [dismissedVerseLessonIds, setDismissedVerseLessonIds] = useState<Set<string>>(() => new Set())

  // Student Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false)

  const toggleLessonComplete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setCompletedLessonIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const completionPercent = classes.length > 0
    ? Math.round((completedLessonIds.size / classes.length) * 100)
    : 0

  const currentClass = classes.find((c) => c.id === activeClassId)

  // Automatically show Quranic motivational verse popup when student opens/switches to a lesson with a verse
  useEffect(() => {
    if (!currentClass?.id) return
    const verse = currentClass.quranVerse
    if (verse && !dismissedVerseLessonIds.has(currentClass.id)) {
      setActiveVerse(verse)
      setVerseModalOpen(true)
    }
  }, [currentClass?.id, currentClass?.quranVerse, dismissedVerseLessonIds])

  const handleDismissVerse = () => {
    if (currentClass?.id) {
      setDismissedVerseLessonIds((prev) => new Set(prev).add(currentClass.id))
    }
    setVerseModalOpen(false)
  }

  // Filter classes by selected subject
  const filteredClasses = classes.filter((c) => {
    if (selectedSubject === 'all') return true
    return c.subjectSlug.toLowerCase() === selectedSubject.toLowerCase()
  })

  const handleSelectClass = async (cls: ClassroomClassItem) => {
    setActiveClassId(cls.id)
    setAccessError(null)

    // 1. Enrolled student or free preview: pre-generated secure video hash
    if (cls.videoHash) {
      setActiveVideoHash(cls.videoHash)
      return
    }

    // 2. Paid class without enrollment: access denied
    if (!cls.isFreePreview) {
      setAccessError('এই ক্লাসটি লক করা। সম্পূর্ণ ক্লাস দেখতে কোর্সে ভর্তি (Enroll) হন।')
      setActiveVideoHash(undefined)
      return
    }

    // 3. Fallback on-demand verification for free preview
    if (course.slug && cls.id) {
      setFetchingToken(true)
      setActiveVideoHash(undefined)
      try {
        const res = await fetch(`/api/courses/${course.slug}/lessons/${cls.id}/access`)
        const data = await res.json()
        if (data.success && data.token) {
          setActiveVideoHash(data.token)
        } else {
          setAccessError(data.error || 'Access denied.')
          setActiveVideoHash(undefined)
        }
      } catch {
        setAccessError('ভিডিও লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      } finally {
        setFetchingToken(false)
      }
    }
  }

  return (
    <div className="w-full bg-background text-foreground pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <BookOpen className="size-5" />
            </div>
            <div className="truncate">
              <span className="block text-xs font-medium text-primary">অনলাইন ক্লাসরুম</span>
              <h1 className="truncate text-sm sm:text-base font-semibold text-foreground">
                {course.title || 'Course Classroom'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {course.slug && (
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href={`/courses/${course.slug}?view=details`}>
                  <ArrowLeft className="size-3.5 mr-1" />
                  কোর্স বিবরণী
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Player & Active Lesson Info (8 Cols on Desktop, sticky on mobile) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Sticky Player Container for mobile */}
            <div className="sticky top-0 z-20 -mx-3 sm:mx-0 sm:static sm:z-auto bg-background/90 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-1 sm:p-0">
              <div className="rounded-xl border border-border bg-black overflow-hidden shadow-lg">
                {fetchingToken ? (
                  <div className="aspect-video flex w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
                    <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
                    <span className="text-xs font-medium tracking-wide">যাচাই করা হচ্ছে...</span>
                  </div>
                ) : accessError ? (
                  <div className="aspect-video flex w-full flex-col items-center justify-center gap-2 bg-card p-6 text-center border border-border">
                    <ShieldCheck className="size-8 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">{accessError}</span>
                    <span className="text-xs text-muted-foreground">কোর্সের সম্পূর্ণ অ্যাক্সেস পেতে এনরোল করুন।</span>
                  </div>
                ) : (
                  <CourseVideoPlayer
                    key={activeVideoHash}
                    videoHash={activeVideoHash}
                  />
                )}
              </div>

              {/* Player Controls Info */}
              <div className="mt-2 flex items-center justify-end text-[11px] text-muted-foreground px-1">
                <span>ফুলস্ক্রিন, সিকিং ও কীবোর্ড কন্ট্রোল উপলব্ধ</span>
              </div>
            </div>

            {/* Current Lesson Title & Description */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary border border-primary/20 tracking-wide">
                    {currentClass?.subjectName || currentClass?.subjectSlug || 'General'}
                  </span>
                  {currentClass?.isFreePreview && (
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ফ্রি প্রিভিউ
                    </span>
                  )}
                  {currentClass?.quranVerse && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVerse(currentClass.quranVerse!)
                        setVerseModalOpen(true)
                      }}
                      className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="অনুপ্রেরণামূলক কুরআনের আয়াত দেখুন"
                    >
                      <BookOpen className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span>কুরআনের বাণী</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  {currentClass?.duration && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
                      <Clock className="size-3.5" /> {currentClass.duration}
                    </span>
                  )}
                  {currentClass?.id && (
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      title="এই লেকচারে কোনো সমস্যা থাকলে রিপোর্ট করুন"
                    >
                      <Flag className="size-3" />
                      <span>রিপোর্ট</span>
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {currentClass?.title || 'ক্লাসরুম লেকচার প্লেয়ার'}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {course.description || 'ক্লাসরুমে স্বাগতম। সম্পূর্ণ লেকচারটি মনোযোগ সহকারে দেখুন।'}
              </p>

              {/* Lecture Resources: Slide (pptx) & Note (pptx/pdf/doc) */}
              {(currentClass?.classSlideUrl || currentClass?.classNoteUrl) && (
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mr-1">
                    <BookOpen className="size-3.5 text-primary" />
                    লেকচার রিসোর্স:
                  </span>
                  {currentClass?.classSlideUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium gap-1.5 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50"
                    >
                      <a
                        href={getDownloadUrl(currentClass.classSlideUrl, currentClass.classSlideName || 'Class-Slide')}
                        download={currentClass.classSlideName || 'Class-Slide.pptx'}
                      >
                        <Presentation className="size-3.5 text-orange-500" />
                        <span>ক্লাস স্লাইড</span>
                        <Download className="size-3 ml-0.5 opacity-70" />
                      </a>
                    </Button>
                  )}
                  {currentClass?.classNoteUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium gap-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50"
                    >
                      <a
                        href={getDownloadUrl(currentClass.classNoteUrl, currentClass.classNoteName || 'Class-Note')}
                        download={currentClass.classNoteName || 'Class-Note.pdf'}
                      >
                        <FileText className="size-3.5 text-blue-500" />
                        <span>ক্লাস নোট</span>
                        <Download className="size-3 ml-0.5 opacity-70" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Lesson Comments & Discussion Section */}
            {currentClass?.id && (
              <LessonCommentsSection
                courseSlug={course.slug || ''}
                lessonId={currentClass.id}
                lessonTitle={currentClass.title}
              />
            )}
          </div>

          {/* Right Column: Curriculum / Subject Navigation (4 Cols on Desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">
                    কোর্স পাঠ্যক্রম
                  </h3>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
                  {classes.length} টি ক্লাস
                </span>
              </div>

              {/* Progress Tracking Bar */}
              <div className="mb-3 rounded-lg bg-muted/50 border border-border p-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <CheckCircle2 className="size-3.5 text-primary" /> কোর্সের অগ্রগতি
                  </span>
                  <span className="font-semibold text-primary">
                    {completedLessonIds.size}/{classes.length} ({completionPercent}%)
                  </span>
                </div>
                <Progress value={completionPercent} className="h-1.5 bg-muted" />
              </div>

              {/* Subject Tabs Filter (Mobile / Desktop) */}
              {course.subjects && course.subjects.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSubject('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      selectedSubject === 'all'
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    সকল ({classes.length})
                  </button>
                  {course.subjects.map((sub) => {
                    const count = classes.filter(
                      (c) => c.subjectSlug.toLowerCase() === sub.slug.toLowerCase()
                    ).length
                    return (
                      <button
                        key={sub.slug}
                        type="button"
                        onClick={() => setSelectedSubject(sub.slug)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          selectedSubject === sub.slug
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {sub.name} ({count})
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Class List */}
              <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredClasses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    এই বিষয়ের অধীনে এখনও কোনো ক্লাস পাওয়া যায়নি।
                  </div>
                ) : (
                  filteredClasses.map((cls, idx) => {
                    const isActive = cls.id === activeClassId
                    const isCompleted = completedLessonIds.has(cls.id)
                    const isPlayable = Boolean(cls.videoHash || cls.videoSource || cls.isFreePreview)
                    const isLocked = !isPlayable

                    return (
                      <div
                        key={cls.id || idx}
                        onClick={() => handleSelectClass(cls)}
                        className={`group relative flex items-start gap-3 rounded-lg p-3 text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-primary/10 border border-primary/40 text-foreground shadow-xs'
                            : isLocked
                            ? 'bg-card/40 border border-border/50 text-muted-foreground hover:bg-card/70'
                            : 'bg-background border border-border/70 text-foreground hover:bg-muted/50 hover:border-border'
                        }`}
                      >
                        {/* Play / Lock Icon */}
                        <div
                          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : isLocked
                              ? 'bg-muted/60 text-muted-foreground'
                              : 'bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground'
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="size-3.5" />
                          ) : isActive ? (
                            <Play className="size-3.5 fill-current" />
                          ) : (
                            <Play className="size-3.5 fill-current ml-0.5" />
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold truncate leading-snug ${isCompleted ? 'line-through text-muted-foreground' : isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {cls.title}
                            </span>
                            {isLocked && (
                              <span className="text-[10px] text-muted-foreground/80 font-medium shrink-0 flex items-center gap-0.5">
                                <Lock className="size-2.5" /> লক
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground/80">{cls.subjectName || cls.subjectSlug}</span>
                            {cls.moduleName && (
                              <>
                                <span>•</span>
                                <span>{cls.moduleName}</span>
                              </>
                            )}
                            {cls.duration && (
                              <>
                                <span>•</span>
                                <span>{cls.duration}</span>
                              </>
                            )}
                            {cls.isFreePreview && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                              </>
                            )}
                            {cls.quranVerse && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                                  <BookOpen className="size-2.5" /> বাণী
                                </span>
                              </>
                            )}
                            {(cls.classSlideUrl || cls.classNoteUrl) && (
                              <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                                {cls.classSlideUrl && (
                                  <a
                                    href={getDownloadUrl(cls.classSlideUrl, cls.classSlideName || 'Class-Slide')}
                                    download={cls.classSlideName || 'Class-Slide.pptx'}
                                    className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 font-medium transition-colors"
                                    title="স্লাইড ডাউনলোড"
                                  >
                                    <Presentation className="size-2.5" /> স্লাইড
                                  </a>
                                )}
                                {cls.classNoteUrl && (
                                  <a
                                    href={getDownloadUrl(cls.classNoteUrl, cls.classNoteName || 'Class-Note')}
                                    download={cls.classNoteName || 'Class-Note.pdf'}
                                    className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-medium transition-colors"
                                    title="নোট ডাউনলোড"
                                  >
                                    <FileText className="size-2.5" /> নোট
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Complete Checkbox Toggle */}
                        <button
                          type="button"
                          onClick={(e) => toggleLessonComplete(e, cls.id)}
                          title={isCompleted ? 'সম্পন্ন (আনমার্ক করতে ক্লিক করুন)' : 'সম্পন্ন হিসেবে মার্ক করুন'}
                          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-primary/20 text-primary hover:bg-primary/30'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <CheckCircle2 className={`size-4 ${isCompleted ? 'fill-primary/20 text-primary' : ''}`} />
                        </button>

                        {isActive && (
                          <span className="flex size-2 rounded-full bg-primary animate-ping self-center" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quranic Verse Popup Dialog */}
      <Dialog
        open={verseModalOpen}
        onOpenChange={(open) => {
          if (!open) handleDismissVerse()
          else setVerseModalOpen(true)
        }}
      >
        <DialogContent
          showCloseButton={true}
          className="max-w-md p-6 sm:p-7 rounded-2xl bg-card border-border shadow-2xl backdrop-blur-md"
        >
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
              <BookOpen className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              অনুপ্রেরণামূলক কুরআনের বাণী
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {activeVerse?.surah}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-center">
            {activeVerse?.arabic && (
              <div
                dir="rtl"
                lang="ar"
                className="text-xl sm:text-2xl font-serif text-foreground leading-loose tracking-wide p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 font-normal select-text shadow-2xs"
              >
                {activeVerse.arabic}
              </div>
            )}

            <div className="text-sm sm:text-base text-foreground font-medium leading-relaxed px-2">
              "{activeVerse?.bangla}"
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={handleDismissVerse}
              className="w-full h-10 font-semibold gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              মাশাআল্লাহ, ক্লাস শুরু করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Lesson Report Modal */}
      {currentClass?.id && (
        <LessonReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          courseSlug={course.slug || ''}
          courseTitle={course.title || 'কোর্স'}
          lessonId={currentClass.id}
          lessonTitle={currentClass.title || 'লেকচার'}
        />
      )}
    </div>
  )
}
