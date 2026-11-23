import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import { CourseCard } from '@/components/basic/courses/CourseCard'

export async function FeaturedCourses() {
  let courses: any[] = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'products',
      where: {
        _status: { equals: 'published' },
      },
      depth: 2,
      limit: 6,
      sort: '-updatedAt',
    })
    courses = result.docs
  } catch (err) {
    console.error('Error fetching featured courses for homepage:', err)
  }

  if (courses.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-muted/20 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="mb-2 sm:mb-3">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <GraduationCap className="size-3.5" />
                <span>জনপ্রিয় কোর্সসমূহ</span>
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              সেরা কোর্স দিয়ে শুরু করুন{" "}
              <span className="text-emerald-600 dark:text-emerald-400">আপনার প্রস্তুতি</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              বোর্ড পরীক্ষার পূর্ণাঙ্গ সিলেবাস কভার করতে দেলোয়ার স্যারের স্পেশাল কোর্সসমূহ।
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="self-start sm:self-auto rounded-xl border-2 border-border/80 bg-card hover:bg-accent font-bold text-xs sm:text-sm cursor-pointer"
          >
            <Link href="/courses" className="inline-flex items-center gap-1.5">
              <span>সকল কোর্স দেখুন</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {courses.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={false}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
