import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, ArrowRight, GraduationCap, Award, CheckCircle2 } from 'lucide-react'
import { extractCloudinarySecureUrl } from '@/utils/cloudinary'

export interface CourseCardProps {
  course: {
    id: string
    title: string
    slug: string
    priceInBDT?: number | null
    thumbnail?: any
    thumbnailUrl?: string | null
    teachers?: any[]
    lessons?: any[]
    subjects?: any[]
    examCount?: number | null
    exams?: any[]
    categories?: any[]
    meta?: { description?: string | null }
    description?: any
  }
  isEnrolled?: boolean
}

export function CourseCard({ course, isEnrolled = false }: CourseCardProps) {
  const thumbObj = typeof course.thumbnail === 'object' && course.thumbnail ? course.thumbnail : null
  const thumbnailUrl =
    (typeof course.thumbnail === 'string' && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/'))
      ? course.thumbnail
      : null) ||
    extractCloudinarySecureUrl(course.thumbnail) ||
    thumbObj?.url ||
    thumbObj?.externalUrl ||
    course.thumbnailUrl ||
    null

  const lessonCount =
    course.lessons?.length ||
    course.subjects?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) ||
    0

  const freePreviewCount =
    course.lessons?.filter((l: any) => l.isFreePreview)?.length ||
    course.subjects?.reduce(
      (acc: number, s: any) => acc + (s.lessons?.filter((l: any) => l.isFreePreview)?.length || 0),
      0
    ) ||
    0

  let examCount = 0
  if (typeof course.examCount === 'number') {
    examCount = course.examCount
  } else if (Array.isArray(course.exams)) {
    examCount = course.exams.length
  } else if (Array.isArray(course.subjects)) {
    examCount = course.subjects.reduce(
      (acc: number, s: any) => acc + (Array.isArray(s.exams) ? s.exams.length : 0),
      0
    )
  }

  const price = course.priceInBDT ?? 0
  const descriptionText =
    course.meta?.description ||
    (typeof course.description === 'string' ? course.description : null)

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-border/80 bg-card py-0 gap-0 hover:shadow-lg hover:border-primary/40 transition-all duration-200 group">
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {thumbnailUrl && (thumbnailUrl.startsWith('http') || thumbnailUrl.startsWith('/')) ? (
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

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {isEnrolled && (
            <Badge className="bg-emerald-600 text-white font-semibold text-[10px] shadow-sm">
              <CheckCircle2 className="size-3 mr-1" />
              ভর্তি সম্পন্ন
            </Badge>
          )}
          {freePreviewCount > 0 && !isEnrolled && (
            <Badge variant="secondary" className="bg-emerald-500/90 text-white font-medium text-[10px]">
              {freePreviewCount} টি ফ্রি ক্লাস
            </Badge>
          )}
        </div>

        {/* Price Badge */}
        {price === 0 ? (
          <Badge className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white font-black text-sm px-3 py-1 shadow-sm">
            ফ্রি
          </Badge>
        ) : (
          <Badge className="absolute bottom-2.5 right-2.5 bg-zinc-950/85 text-white backdrop-blur-xs font-black text-sm px-3 py-1 border border-white/15 shadow-sm">
            ৳ {price.toLocaleString('bn-BD')}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Teacher Badges (Pills) */}
        {course.teachers && course.teachers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {course.teachers.slice(0, 2).map((teacher: any, idx: number) => {
              const name = typeof teacher === 'object' ? teacher.name : 'প্রশিক্ষক'
              return (
                <span
                  key={teacher.id || idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  <GraduationCap className="size-3" />
                  <span className="truncate max-w-[120px]">{name}</span>
                </span>
              )
            })}
            {course.teachers.length > 2 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                +{course.teachers.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-heading font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          <Link href={`/courses/${course.slug}`}>
            {course.title}
          </Link>
        </h3>

        {/* Half-line truncated description */}
        {descriptionText && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-1 leading-relaxed">
            {descriptionText}
          </p>
        )}

        {/* Total Class Count & Total Exam Count Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border/50">
            <BookOpen className="size-3 text-primary" />
            <span>{lessonCount} টি ক্লাস</span>
          </span>
          {examCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border/50">
              <Award className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>{examCount} টি পরীক্ষা</span>
            </span>
          )}
        </div>

        {/* Bottom CTA Row */}
        <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {price === 0 ? 'ফ্রি' : `৳ ${price.toLocaleString('bn-BD')}`}
            </span>
          </div>

          {isEnrolled ? (
            <Button
              asChild
              size="sm"
              className="gap-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs"
            >
              <Link href={`/courses/${course.slug}`}>
                <GraduationCap className="size-3.5" />
                <span>ক্লাশ শুরু করুন</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1 px-3 text-primary hover:bg-primary/10 font-bold text-xs group-hover:translate-x-0.5 transition-transform"
            >
              <Link href={`/courses/${course.slug}`}>
                <span>বিস্তারিত</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
