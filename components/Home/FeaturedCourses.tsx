import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react'

export async function FeaturedCourses() {
  let courses: any[] = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'products',
      where: {
        _status: { equals: 'published' },
      },
      depth: 1,
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
            className="self-start sm:self-auto rounded-xl border-2 border-border/80 bg-card hover:bg-accent font-bold text-xs sm:text-sm"
          >
            <Link href="/courses" className="inline-flex items-center gap-1.5">
              <span>সকল কোর্স দেখুন</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {courses.map((course: any) => {
            const price = course.priceInBDT ?? course.price ?? 0
            const isFree = price === 0
            const thumbUrl =
              course.thumbnailUrl ||
              (typeof course.thumbnail === 'object' ? course.thumbnail?.url || course.thumbnail?.externalUrl : null) ||
              (typeof course.thumbnail === 'string' && course.thumbnail.startsWith('/') ? course.thumbnail : null) ||
              '/images/course-placeholder.png'

            const lessonsCount = Array.isArray(course.lessons) ? course.lessons.length : 0
            const subjectsCount = Array.isArray(course.subjects) ? course.subjects.length : 1

            return (
              <div
                key={course.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-emerald-500/20 border-b-4 border-b-emerald-600 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-md"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    <Image
                      src={thumbUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                        <BookOpen className="size-2.5 text-emerald-400" />
                        <span>{lessonsCount} টি ক্লাস</span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {course.meta?.description || 'ইউনিক টিচিং মেথডের ডিজিটাল ক্লাসরুমে পূর্ণাঙ্গ প্রস্তুতি নিন।'}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">কোর্স ফি</span>
                      <span className="text-base sm:text-lg font-black text-foreground">
                        {isFree ? 'সম্পূর্ণ ফ্রি' : `৳ ${price.toLocaleString('bn-BD')}`}
                      </span>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="h-8 sm:h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs border-b-2 border-emerald-700 active:translate-y-0.5 shadow-2xs"
                    >
                      <Link href={`/courses/${course.slug}`}>
                        <span>কোর্স দেখুন</span>
                        <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
