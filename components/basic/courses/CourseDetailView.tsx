'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpen,
  Clock,
  Users,
  Play,
  Lock,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Share2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddToCartButton } from '@/components/basic/cart/AddToCartButton'
import CourseVideoPlayer from '@/components/basic/video/CourseVideoPlayer'
import { extractCloudinarySecureUrl } from '@/utils/cloudinary'

export interface CourseDetailViewProps {
  course: {
    id: string
    title: string
    slug: string
    priceInBDT?: number | null
    introductoryVideo?: string | null
    thumbnail?: any
    teachers?: any[]
    coordinators?: any[]
    lessons?: any[]
    meta?: { title?: string | null; description?: string | null }
  }
  isEnrolled?: boolean
}

export function CourseDetailView({ course, isEnrolled = false }: CourseDetailViewProps) {
  const lessons = course.lessons || []
  const firstFreeLesson = lessons.find((l: any) => l.isFreePreview)
  const [activePreviewLesson, setActivePreviewLesson] = useState<any>(firstFreeLesson || null)
  const [previewToken, setPreviewToken] = useState<string | null>(null)
  const [isLoadingToken, setIsLoadingToken] = useState(false)

  const thumbnailUrl =
    extractCloudinarySecureUrl(course.thumbnail) ||
    (typeof course.thumbnail === 'object' && course.thumbnail?.url) ||
    '/images/course-placeholder.jpg'

  const price = course.priceInBDT ?? 0
  const freeLessons = lessons.filter((l: any) => l.isFreePreview)
  const totalLessons = lessons.length

  const handleSelectFreeLesson = async (lesson: any) => {
    setActivePreviewLesson(lesson)
    if (!lesson.isFreePreview) return

    if (lesson.demoUrl) {
      setPreviewToken(null)
      return
    }

    setIsLoadingToken(true)
    try {
      const res = await fetch(`/api/courses/${course.slug}/lessons/${lesson.id}/access`)
      const data = await res.json()
      if (data.success && data.token) {
        setPreviewToken(data.token)
      } else {
        setPreviewToken(null)
      }
    } catch {
      setPreviewToken(null)
    } finally {
      setIsLoadingToken(false)
    }
  }

  // Auto-load token for initial free preview if present
  React.useEffect(() => {
    if (firstFreeLesson) {
      handleSelectFreeLesson(firstFreeLesson)
    }
  }, [course.slug])

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            হোম
          </Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-foreground transition-colors">
            কোর্সসমূহ
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{course.title}</span>
        </div>

        {/* Top Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Left Column: Title, Details, Teachers */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-semibold">
                অনলাইন লাইভ ও রেকর্ডেড ক্লাস
              </Badge>
              {freeLessons.length > 0 && (
                <Badge className="bg-emerald-600 text-white font-medium text-xs">
                  {freeLessons.length} টি ফ্রি প্রিভিউ ক্লাস উপলব্ধ
                </Badge>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-foreground leading-tight">
              {course.title}
            </h1>

            {course.meta?.description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {course.meta.description}
              </p>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl border border-border/70 bg-card">
                <span className="text-xs text-muted-foreground block">মোট লেকচার</span>
                <span className="font-bold text-sm sm:text-base text-foreground mt-0.5 block">
                  {totalLessons} টি ক্লাস
                </span>
              </div>
              <div className="p-3 rounded-xl border border-border/70 bg-card">
                <span className="text-xs text-muted-foreground block">ফ্রি ট্রায়াল</span>
                <span className="font-bold text-sm sm:text-base text-foreground mt-0.5 block">
                  {freeLessons.length} টি ক্লাস ফ্রি
                </span>
              </div>
              <div className="p-3 rounded-xl border border-border/70 bg-card col-span-2 sm:col-span-1">
                <span className="text-xs text-muted-foreground block">অ্যাক্সেস মোড</span>
                <span className="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  আজীবন অ্যাক্সেস
                </span>
              </div>
            </div>

            {/* Instructors */}
            {course.teachers && course.teachers.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-3">
                  কোর্স শিক্ষকবৃন্দ
                </span>
                <div className="flex flex-wrap gap-4">
                  {course.teachers.map((teacher: any, idx: number) => {
                    const t = typeof teacher === 'object' ? teacher : { name: 'শিক্ষক' }
                    return (
                      <div key={t.id || idx} className="flex items-center gap-2.5">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                          <GraduationCap className="size-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-foreground block">{t.name}</span>
                          {t.designation && (
                            <span className="text-[11px] text-muted-foreground block">{t.designation}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Video Preview / Enrollment Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden">
              {/* Top Preview Video or Thumbnail */}
              <div className="relative aspect-video w-full bg-black">
                {activePreviewLesson?.demoUrl ? (
                  <CourseVideoPlayer url={activePreviewLesson.demoUrl} className="size-full" />
                ) : previewToken ? (
                  <CourseVideoPlayer videoHash={previewToken} className="size-full" />
                ) : course.introductoryVideo ? (
                  <CourseVideoPlayer url={course.introductoryVideo} className="size-full" />
                ) : thumbnailUrl.startsWith('http') || thumbnailUrl.startsWith('/') ? (
                  <Image src={thumbnailUrl} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                    <BookOpen className="size-12" />
                  </div>
                )}

                {activePreviewLesson && (
                  <div className="absolute top-2.5 left-2.5 z-20">
                    <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
                      প্লে হচ্ছে: {activePreviewLesson.lessonTitle}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Pricing & CTA */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground block">কোর্স ফি</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {price === 0 ? 'সম্পূর্ণ ফ্রি' : `৳ ${price.toLocaleString('bn-BD')}`}
                    </span>
                  </div>
                  {price > 0 && (
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                      এককালীন পেমেন্ট
                    </Badge>
                  )}
                </div>

                {/* Enrollment Action */}
                <div className="space-y-2.5 pt-2">
                  {isEnrolled ? (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          আপনি এই কোর্সে ভর্তি আছেন
                        </span>
                      </div>
                      <Button asChild className="w-full h-11 text-sm font-bold shadow-md bg-teal-600 hover:bg-teal-500 text-white">
                        <Link href={`/courses/${course.slug}`}>
                          <GraduationCap className="size-4 mr-2" />
                          ক্লাসরুমে প্রবেশ করুন
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <AddToCartButton
                        productId={course.id}
                        productTitle={course.title}
                        text="কোর্সে ভর্তি হোন (Enroll Now)"
                        className="w-full h-11 text-sm font-bold shadow-md"
                      />
                      {freeLessons.length > 0 && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full h-10 text-xs font-semibold border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10"
                        >
                          <Link href={`/courses/${course.slug}?learn=1`}>
                            <Play className="size-3.5 mr-1.5 fill-current" />
                            ক্লাসরুম মোডে ফ্রি ট্রায়াল দেখুন
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                  <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="size-3.5 text-primary" />
                    <span>সহজ পেমেন্ট ও তাত্ক্ষণিক ভিডিও অ্যাক্সেস</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus / Curriculum Accordion Section */}
        <div className="max-w-4xl space-y-6 pt-6 border-t border-border">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
              কোর্স সিলেবাস ও ক্লাস তালিকা
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              ফ্রি ক্লাসগুলো সরাসরি ক্লিক করে এখনই উপভোগ করুন। সম্পূর্ণ কোর্সে ভর্তি হলে সকল ক্লাস আনলক হবে।
            </p>
          </div>

          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden bg-card">
            {lessons.map((lesson: any, idx: number) => {
              const isFree = Boolean(lesson.isFreePreview)
              const isPlaying = activePreviewLesson?.id === lesson.id

              return (
                <div
                  key={lesson.id || idx}
                  className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                    isPlaying ? 'bg-primary/5' : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                        isFree
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isFree ? <Play className="size-3.5 fill-current ml-0.5" /> : <Lock className="size-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {idx + 1}. {lesson.lessonTitle}
                        </span>
                        {isFree && (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                            ফ্রি প্রিভিউ
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        {lesson.moduleName && <span>{lesson.moduleName}</span>}
                        {lesson.duration && (
                          <>
                            <span>•</span>
                            <span>{lesson.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isFree ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={isPlaying ? 'default' : 'outline'}
                      onClick={() => handleSelectFreeLesson(lesson)}
                      className="shrink-0 text-xs h-7 px-3 gap-1.5"
                    >
                      <Play className="size-3 fill-current" />
                      {isPlaying ? 'চলছে' : 'প্লে করুন'}
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Lock className="size-3" />
                      লক করা
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
