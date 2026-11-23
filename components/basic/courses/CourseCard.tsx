'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, ArrowRight, GraduationCap, Award, CheckCircle2, Loader2, ShoppingBag } from 'lucide-react'
import { extractCloudinarySecureUrl } from '@/utils/cloudinary'
import { AddToCartButton } from '@/components/basic/cart/AddToCartButton'

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

function extractRichTextString(desc: any): string | null {
  if (!desc) return null
  if (typeof desc === 'string') {
    const trimmed = desc.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof desc === 'object') {
    // If Lexical AST
    if (desc.root) {
      const texts: string[] = []
      const traverse = (node: any) => {
        if (!node) return
        if (node.text && typeof node.text === 'string') {
          texts.push(node.text)
        }
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            traverse(child)
          }
        }
      }
      traverse(desc.root)
      const res = texts.join(' ').replace(/\s+/g, ' ').trim()
      if (res) return res
    }
  }
  return null
}

function getTeacherImageUrl(teacher: any): string | null {
  if (!teacher || typeof teacher !== 'object') return null
  const img = teacher.image
  if (!img) return null
  if (typeof img === 'string') {
    if (img.startsWith('http') || img.startsWith('/')) return img
    const cld = extractCloudinarySecureUrl(img)
    if (cld) return cld
    return null
  }
  return (
    extractCloudinarySecureUrl(img) ||
    img.cloudinary?.secure_url ||
    img.cloudinary?.url ||
    img.secure_url ||
    img.url ||
    (typeof img.filename === 'string' ? `/api/media/file/${img.filename}` : null) ||
    null
  )
}

export function CourseCard({ course, isEnrolled = false }: CourseCardProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isNavigating) return
    setIsNavigating(true)
    router.push(`/courses/${course.slug}`)
  }

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

  // Requirement 13: Content Section description must take precedence over meta description
  const contentDescription = extractRichTextString(course.description)
  const descriptionText = contentDescription || course.meta?.description || null

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-border/80 bg-card py-0 gap-0 hover:shadow-lg hover:border-primary/40 transition-all duration-200 group">
      {/* Thumbnail Area */}
      <div
        onClick={handleNavigate}
        className="relative aspect-video w-full overflow-hidden bg-muted cursor-pointer"
      >
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
        {/* Teacher Badges (Pills) with Photo (Requirement 14) */}
        {course.teachers && course.teachers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {course.teachers.slice(0, 2).map((teacher: any, idx: number) => {
              const name = typeof teacher === 'object' ? teacher.name : 'প্রশিক্ষক'
              const imgUrl = getTeacherImageUrl(teacher)
              return (
                <span
                  key={teacher.id || idx}
                  className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {imgUrl ? (
                    <span className="relative size-4 rounded-full overflow-hidden shrink-0 border border-primary/30">
                      <Image
                        src={imgUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="16px"
                      />
                    </span>
                  ) : (
                    <GraduationCap className="size-3" />
                  )}
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
          <Link
            href={`/courses/${course.slug}`}
            onClick={handleNavigate}
            className={isNavigating ? 'pointer-events-none opacity-80' : ''}
          >
            {course.title}
          </Link>
        </h3>

        {/* Description: 2-line smooth summary */}
        {descriptionText && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
        <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {price === 0 ? 'ফ্রি' : `৳ ${price.toLocaleString('bn-BD')}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEnrolled ? (
              <Button
                asChild
                size="sm"
                className="gap-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                <Link href={`/courses/${course.slug}`}>
                  <GraduationCap className="size-3.5" />
                  <span>ক্লাসরুমে যান</span>
                </Link>
              </Button>
            ) : price === 0 ? (
              <Button
                size="sm"
                onClick={handleNavigate}
                disabled={isNavigating}
                className="gap-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {isNavigating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <span>ফ্রি শুরু করুন</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            ) : (
              <>
                <AddToCartButton
                  productId={course.id}
                  productTitle={course.title}
                  courseSlug={course.slug}
                  isEnrolled={false}
                  text="কার্ট"
                  size="sm"
                  className="h-8 text-xs font-bold px-2.5 rounded-lg"
                />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNavigate}
                  disabled={isNavigating}
                  className="gap-1 px-2.5 text-primary hover:bg-primary/10 font-bold text-xs group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  {isNavigating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>বিস্তারিত</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-border/70 bg-card animate-pulse">
      <div className="aspect-video w-full bg-muted/80" />
      <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-muted rounded-full" />
        </div>
        <div className="h-5 w-4/5 bg-muted rounded" />
        <div className="h-3.5 w-full bg-muted/60 rounded" />
        <div className="h-3.5 w-2/3 bg-muted/60 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-20 bg-muted/70 rounded-md" />
          <div className="h-5 w-20 bg-muted/70 rounded-md" />
        </div>
        <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-muted rounded-lg" />
            <div className="h-8 w-20 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
