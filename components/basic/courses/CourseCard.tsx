import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react'
import { extractCloudinarySecureUrl } from '@/utils/cloudinary'

export interface CourseCardProps {
  course: {
    id: string
    title: string
    slug: string
    priceInBDT?: number | null
    thumbnail?: any
    teachers?: any[]
    lessons?: any[]
    categories?: any[]
    meta?: { description?: string | null }
  }
}

export function CourseCard({ course }: CourseCardProps) {
  const thumbnailUrl =
    extractCloudinarySecureUrl(course.thumbnail) ||
    (typeof course.thumbnail === 'object' && course.thumbnail?.url) ||
    '/images/course-placeholder.jpg'

  const lessonCount = course.lessons?.length || 0
  const freePreviewCount = course.lessons?.filter((l: any) => l.isFreePreview)?.length || 0
  const price = course.priceInBDT ?? 0

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-border/80 bg-card py-0 gap-0 hover:shadow-lg hover:border-primary/40 transition-all duration-200 group">
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {thumbnailUrl.startsWith('http') || thumbnailUrl.startsWith('/') ? (
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

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {freePreviewCount > 0 && (
            <Badge variant="secondary" className="bg-emerald-500/90 text-white font-medium text-[10px]">
              {freePreviewCount} টি ফ্রি ক্লাস
            </Badge>
          )}
        </div>

        {price === 0 ? (
          <Badge className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white font-bold text-xs">
            ফ্রি
          </Badge>
        ) : (
          <Badge className="absolute bottom-2.5 right-2.5 bg-zinc-950/80 text-white backdrop-blur-xs font-bold text-xs border border-white/10">
            ৳ {price.toLocaleString('bn-BD')}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-col flex-1 p-4 sm:p-5">
        <h3 className="font-heading font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          <Link href={`/courses/${course.slug}`}>
            {course.title}
          </Link>
        </h3>

        {course.meta?.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {course.meta.description}
          </p>
        )}

        {/* Teachers / Instructors */}
        {course.teachers && course.teachers.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5 text-primary shrink-0" />
            <span className="truncate">
              {course.teachers
                .map((t: any) => (typeof t === 'object' ? t.name : 'প্রশিক্ষক'))
                .join(', ')}
            </span>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3.5 text-muted-foreground/80" />
            <span>{lessonCount} টি ক্লাস</span>
          </span>

          <Button asChild size="sm" variant="ghost" className="gap-1 px-2 text-primary hover:text-primary font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
            <Link href={`/courses/${course.slug}`}>
              বিস্তারিত
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
