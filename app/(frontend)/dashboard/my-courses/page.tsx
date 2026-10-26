import React from "react"
import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { getPayload } from "payload"
import config from "@payload-config"
import { getServerSession } from "@delmaredigital/payload-better-auth"
import { extractCloudinarySecureUrl } from "@/utils/cloudinary"
import { createEnrollmentsForOrder } from "@/utils/enrollment"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  ArrowRight,
  ExternalLink,
  Layers,
} from "lucide-react"

export const metadata = {
  title: "আমার কোর্সসমূহ | ড্যাশবোর্ড",
  description: "আপনার সক্রিয় নিবন্ধিত কোর্স এবং ক্লাসরুম এক্সেস।",
}

export default async function MyCoursesPage() {
  const headersList = await headers()
  const payload = await getPayload({ config })
  const session = await getServerSession(payload, headersList)

  if (!session?.user?.id) {
    return null
  }

  const userId = session.user.id

  // 1. Primary Query: Active Enrollments
  const enrollmentsRes = await payload.find({
    collection: "enrollments" as any,
    where: {
      and: [
        { student: { equals: userId } },
        { status: { equals: "active" } },
      ],
    },
    depth: 2,
    limit: 100,
    sort: "-enrolledAt",
  })

  // 2. Safety Fallback: Sync from Paid Orders if not yet enrolled
  const ordersRes = await payload.find({
    collection: "orders",
    where: {
      and: [
        { customer: { equals: userId } },
        { paymentStatus: { equals: "paid" } },
      ],
    },
    depth: 2,
    limit: 50,
  })

  // Auto-sync missing orders to enrollments
  for (const order of ordersRes.docs) {
    await createEnrollmentsForOrder(payload, order)
  }

  // If new enrollments were created during fallback, re-fetch
  const finalEnrollments =
    ordersRes.docs.length > 0 && enrollmentsRes.docs.length === 0
      ? await payload.find({
          collection: "enrollments" as any,
          where: {
            and: [
              { student: { equals: userId } },
              { status: { equals: "active" } },
            ],
          },
          depth: 2,
          limit: 100,
          sort: "-enrolledAt",
        })
      : enrollmentsRes

  // Deduplicate courses by ID
  const courseMap = new Map<string, any>()
  for (const enrollment of finalEnrollments.docs as any[]) {
    const course = typeof enrollment.course === "object" ? enrollment.course : null
    if (course && course.id && !courseMap.has(String(course.id))) {
      courseMap.set(String(course.id), {
        ...course,
        enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
      })
    }
  }

  const enrolledCourses = Array.from(courseMap.values())

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full pb-8">
      {/* Header Banner */}
      <div className="rounded-2xl border-2 border-amber-500/25 border-b-4 border-b-amber-500 bg-gradient-to-r from-amber-500/10 via-card to-emerald-500/10 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <GraduationCap className="size-5" />
              </span>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                আমার কোর্সসমূহ
              </h1>
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 font-bold">
                {enrolledCourses.length} টি কোর্স
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              আপনার সফলভাবে নিবন্ধিত কোর্সসমূহ এবং লেকচার ক্লাসরুম।
            </p>
          </div>

          <Button asChild size="sm" variant="outline" className="border-primary/40 hover:bg-primary/5 self-start sm:self-auto gap-1 text-xs">
            <Link href="/courses">
              <span>সকল কোর্স ক্যাটালগ</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Courses List */}
      {enrolledCourses.length === 0 ? (
        <Card className="p-8 sm:p-14 text-center border-dashed border-2 border-border/80 bg-card/60 rounded-2xl">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="size-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            এখনও কোনো কোর্সে এনরোল করা হয়নি
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            আমাদের মানসম্মত ভিডিও ক্লাস ও বিষয়ভিত্তিক কোর্সে ভর্তি হয়ে আপনার পড়াশোনা শুরু করুন।
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm">
              <Link href="/courses">
                <GraduationCap className="size-4" />
                <span>নতুন কোর্স দেখুন</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {enrolledCourses.map((course: any) => {
            const thumbnailUrl =
              extractCloudinarySecureUrl(course.thumbnail) ||
              (typeof course.thumbnail === "object" && course.thumbnail?.url) ||
              "/images/course-placeholder.jpg"

            const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0
            const subjectsCount = Array.isArray(course.subjects) ? course.subjects.length : 0

            return (
              <Card
                key={course.id}
                className="flex flex-col h-full overflow-hidden border border-border/80 bg-card hover:shadow-lg hover:border-amber-500/40 transition-all duration-200 group rounded-xl"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {thumbnailUrl.startsWith("http") || thumbnailUrl.startsWith("/") ? (
                    <Image
                      src={thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
                      <BookOpen className="size-10" />
                    </div>
                  )}

                  <Badge className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-bold text-[10px] sm:text-xs shadow-xs">
                    এনরোল্ড (Active)
                  </Badge>

                  {subjectsCount > 1 && (
                    <Badge className="absolute bottom-2.5 left-2.5 bg-zinc-950/80 text-white backdrop-blur-xs font-medium text-[10px] border border-white/10">
                      {subjectsCount} টি বিষয়
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <CardContent className="flex flex-col flex-1 p-4 sm:p-5">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <Link href={`/courses/${course.slug}`}>
                      {course.title}
                    </Link>
                  </h3>

                  {course.meta?.description && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {course.meta.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5 text-muted-foreground/80" />
                      <span>{lessonCount} টি ক্লাস</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs px-2 gap-1">
                        <Link href={`/courses/${course.slug}`}>
                          <span>ওভারভিউ</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="h-7 text-xs px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                        <Link href="/video">
                          <PlayCircle className="size-3.5" />
                          <span>ক্লাসরুম</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

