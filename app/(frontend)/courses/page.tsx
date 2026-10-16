import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import { CourseCard } from '@/components/basic/courses/CourseCard'
import { CourseFilters } from '@/components/basic/courses/CourseFilters'
import { GraduationCap, BookOpen, Layers } from 'lucide-react'
import { SiteConfig, getPageTitle } from '@/config/site'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const title = 'সকল কোর্সসমূহ | Online Courses'
  const description = 'ইউনিক টিচিং মেথডের আকর্ষণীয় ও মানসম্মত কোর্সসমূহ। ঘরে বসেই প্রস্তুতি নিন সেরা শিক্ষকদের সঙ্গে।'

  return {
    title: getPageTitle(title),
    description,
    openGraph: {
      title: getPageTitle(title),
      description,
      siteName: SiteConfig.site.name,
      type: 'website',
    },
  }
}

interface CoursesPageProps {
  searchParams: Promise<{
    category?: string
    q?: string
  }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { category = 'all', q = '' } = await searchParams
  const payload = await getPayload({ config })

  // 1. Fetch Categories for filter pills
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 50,
    depth: 0,
  })

  const categories = categoriesResult.docs.map((cat: any) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
  }))

  // 2. Build where filter for products/courses
  const whereConditions: any[] = [
    {
      _status: { equals: 'published' },
    },
  ]

  if (q && q.trim()) {
    whereConditions.push({
      title: { contains: q.trim() },
    })
  }

  if (category && category !== 'all') {
    // If slug or id is passed
    const targetCat = categoriesResult.docs.find(
      (c: any) => c.slug === category || c.id === category
    )
    if (targetCat) {
      whereConditions.push({
        categories: { contains: targetCat.id },
      })
    }
  }

  // 3. Fetch courses
  const coursesResult = await payload.find({
    collection: 'products',
    where: whereConditions.length > 1 ? { and: whereConditions } : whereConditions[0],
    depth: 2,
    limit: 60,
    sort: '-createdAt',
  })

  const courses = coursesResult.docs

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <GraduationCap className="size-4" />
              <span>আমাদের কোর্স ক্যাটালগ</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-foreground tracking-tight">
              অনলাইন কোর্স ও ক্লাসসমূহ
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              বেসিক থেকে শুরু করে পরীক্ষা প্রস্তুতি—যেকোনো ক্লাসের বিষয়ভিত্তিক ভিডিও লেকচার ও প্রিমিয়াম ক্লাস পেয়ে যান এক জায়গায়।
            </p>
          </div>

          {/* Filters & Search */}
          <CourseFilters
            categories={categories}
            selectedCategory={category}
            initialSearch={q}
          />

          {/* Course Grid */}
          {courses.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
              <BookOpen className="size-10 text-muted-foreground/60 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">কোনো কোর্স পাওয়া যায়নি</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                আপনার অনুসন্ধানের সাথে মিল রেখে কোনো কোর্স খুঁজে পাওয়া যায়নি। দয়া করে অন্য কোনো বিষয় বা কি-ওয়ার্ড দিয়ে চেষ্টা করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

