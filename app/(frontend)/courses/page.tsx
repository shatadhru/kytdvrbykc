import React from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import { CourseCard } from '@/components/basic/courses/CourseCard'
import { CourseFilters } from '@/components/basic/courses/CourseFilters'
import { NoticeBanner, type BannerData } from '@/components/basic/banner/NoticeBanner'
import { GraduationCap, BookOpen } from 'lucide-react'
import { SiteConfig, getPageTitle } from '@/config/site'

export const dynamic = 'force-dynamic'

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
    price?: string
    sort?: string
  }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { category = 'all', q = '', price = 'all', sort = 'newest' } = await searchParams
  let categories: { id: string; title: string; slug: string }[] = []
  let courses: any[] = []
  let offerBannerData: BannerData | null = null
  const enrolledCourseIds = new Set<string>()

  try {
    const payload = await getPayload({ config })
    const headersList = await headers()
    const session = await getServerSession(payload, headersList)

    // 1. Fetch Categories for filter pills
    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 50,
      depth: 0,
    })

    categories = categoriesResult.docs.map((cat: any) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
    }))

    // 2. Fetch admin-managed active offer banner for courses page
    try {
      const now = new Date()
      const bannersResult = await payload.find({
        collection: 'banners',
        where: {
          and: [
            { isActive: { equals: true } },
            {
              or: [
                { placement: { equals: 'courses' } },
                { placement: { equals: 'all' } },
              ],
            },
          ],
        },
        sort: '-priority -updatedAt',
        limit: 5,
      })

      const found = bannersResult.docs.find((doc: any) => {
        if (doc.startDate && new Date(doc.startDate) > now) return false
        if (doc.endDate && new Date(doc.endDate) < now) return false
        return true
      })

      if (found) {
        offerBannerData = {
          id: String(found.id),
          title: found.title,
          content: found.content,
          badge: found.badge,
          icon: found.icon,
          isActive: found.isActive,
          backgroundType: found.backgroundType,
          presetTheme: found.presetTheme,
          customColor: found.customColor,
          customGradient: found.customGradient,
          textColor: found.textColor,
          customTextColor: found.customTextColor,
          isDismissible: found.isDismissible,
          dismissExpiryDays: found.dismissExpiryDays,
          isSticky: false,
          link: found.link,
          updatedAt: found.updatedAt,
        }
      }
    } catch {
      // Non-blocking fallback if banners query fails
    }

    // 3. Single server-side query for logged-in user enrollments
    if (session?.user?.id) {
      try {
        const userEnrollments = await payload.find({
          collection: 'enrollments' as any,
          where: {
            and: [
              { student: { equals: session.user.id } },
              { status: { equals: 'active' } },
            ],
          },
          depth: 0,
          limit: 100,
          overrideAccess: true,
        })

        for (const e of userEnrollments.docs as any[]) {
          const cId = typeof e.course === 'object' && e.course ? e.course.id : e.course
          if (cId) enrolledCourseIds.add(String(cId))
        }
      } catch {
        // Fallback silently if enrollment check fails
      }
    }

    // 4. Build where filter for products/courses
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
      const targetCat = categoriesResult.docs.find(
        (c: any) => c.slug === category || c.id === category
      )
      if (targetCat) {
        whereConditions.push({
          categories: { contains: targetCat.id },
        })
      }
    }

    if (price === 'free') {
      whereConditions.push({
        priceInBDT: { equals: 0 },
      })
    } else if (price === 'paid') {
      whereConditions.push({
        priceInBDT: { greater_than: 0 },
      })
    }

    // 5. Determine sort option
    let sortOption = '-createdAt'
    if (sort === 'price-asc') {
      sortOption = 'priceInBDT'
    } else if (sort === 'price-desc') {
      sortOption = '-priceInBDT'
    }

    // 6. Fetch courses
    const coursesResult = await payload.find({
      collection: 'products',
      where: whereConditions.length > 1 ? { and: whereConditions } : whereConditions[0],
      depth: 2,
      limit: 60,
      sort: sortOption,
    })

    courses = coursesResult.docs
  } catch (error) {
    console.error('Failed to fetch courses/categories from Payload:', error)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Admin Managed Offer Banner */}
          {offerBannerData && (
            <div className="mb-8 rounded-xl overflow-hidden border border-border/80 shadow-xs">
              <NoticeBanner banner={offerBannerData} />
            </div>
          )}

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
            priceFilter={price}
            sortOrder={sort}
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
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourseIds.has(String(course.id))}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
