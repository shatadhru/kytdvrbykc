'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, BookOpen, ArrowRight, PlayCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EnrolledCourse {
  id: string
  title: string
  slug: string
  thumbnailUrl: string
  totalLessons: number
  enrolledAt?: string
  progress?: number
}

export function EnrolledCoursesHorizontalList() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/enrollments')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.enrollments)) {
          setCourses(data.enrollments)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard enrollments:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 rounded-2xl border border-border/60 bg-card/60">
        <Loader2 className="size-5 animate-spin text-primary mr-2" />
        <span className="text-xs text-muted-foreground font-medium">কোর্স লোড হচ্ছে...</span>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              আপনি এখনো কোনো কোর্সে ভর্তি হননি
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              এসএসসি ও বিষয়ভিত্তিক পূর্ণাঙ্গ প্রস্তুতির সেরা অনলাইন কোর্সগুলো এক্সপ্লোর করুন।
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="rounded-xl h-8 px-4 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0"
        >
          <Link href="/courses">
            <span>সকল কোর্স দেখুন</span>
            <ArrowRight className="size-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-4.5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            আমার সক্রিয় কোর্সসমূহ ({courses.length})
          </h2>
        </div>
        <Link
          href="/dashboard/my-courses"
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>সবগুলো দেখুন</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Horizontal Scrollable Slider */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 -mx-1 px-1">
        {courses.map((course) => {
          return (
            <div
              key={course.id}
              className="flex-none w-72 sm:w-80 rounded-xl sm:rounded-2xl border border-border/80 bg-card p-3 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={course.thumbnailUrl || '/images/course-placeholder.jpg'}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="320px"
                  />
                  <Badge className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
                    এনরোল্ড
                  </Badge>
                </div>

                {/* Course Title & Details */}
                <div>
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      <BookOpen className="size-3 text-emerald-600" />
                      <span>{course.totalLessons} টি ক্লাস</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>আজীবন অ্যাক্সেস</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-border/60">
                <Button
                  asChild
                  size="sm"
                  className="w-full h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  <Link href={`/courses/${course.slug}?learn=true`}>
                    <PlayCircle className="size-3.5 mr-1.5" />
                    <span>ক্লাশ শুরু করুন</span>
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
