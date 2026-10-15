import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import { CourseDetailView } from '@/components/basic/courses/CourseDetailView'
import ClassroomView, {
  type ClassroomClassItem,
  type ClassroomCourseItem,
} from '@/components/basic/video-player/ClassroomView'
import { SiteConfig, getPageTitle } from '@/config/site'

interface Props {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ view?: string; learn?: string }>
}

async function getCourse(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'products',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    depth: 2,
    limit: 1,
    select: {
      title: true,
      slug: true,
      description: true,
      thumbnail: true,
      introductoryVideo: true,
      priceInBDT: true,
      teachers: true,
      coordinators: true,
      categories: true,
      meta: true,
      lessons: {
        lessonTitle: true,
        moduleName: true,
        duration: true,
        order: true,
        isFreePreview: true,
        id: true,
      },
    },
  })

  return result.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) return { title: 'Course Not Found' }

  const title = course.meta?.title || course.title
  const description = course.meta?.description || 'অনলাইন লাইভ ও রেকর্ডেড ক্লাস কোর্স।'

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

export default async function CoursePage({ params, searchParams }: Props) {
  const { slug } = await params
  const query = searchParams ? await searchParams : {}
  const course = await getCourse(slug)

  if (!course) notFound()

  // 1. Check user session & enrollment status via orders collection
  let isEnrolled = false
  try {
    const payload = await getPayload({ config })
    const headersList = await headers()
    const session = await getServerSession(payload, headersList)
    const userId = session?.user?.id

    if (userId) {
      const courseId = String(course.id)
      const orders = await payload.find({
        collection: 'orders',
        where: {
          and: [
            { customer: { equals: userId } },
            { paymentStatus: { equals: 'paid' } },
          ],
        },
        limit: 50,
        depth: 1,
      })

      isEnrolled = orders.docs.some((order: any) =>
        (order.items ?? []).some((item: any) => {
          const prodId = typeof item.product === 'object' && item.product ? item.product.id : item.product
          return String(prodId) === courseId
        }),
      )
    }
  } catch (err) {
    console.error('Error checking course enrollment:', err)
  }

  // 2. Map payload lessons safely without exposing youtube IDs or tokens
  const lessons: ClassroomClassItem[] = (course.lessons ?? []).map((l: any) => ({
    id: l.id,
    title: l.lessonTitle,
    subjectSlug: l.moduleName || 'General',
    order: l.order,
    duration: l.duration,
    isFreePreview: l.isFreePreview,
  }))

  const courseItem: ClassroomCourseItem = {
    id: String(course.id),
    title: course.title,
    slug: course.slug,
    description: course.meta?.description || '',
  }

  // 3. Routing view decision:
  // - Enrolled students default to ClassroomView (full player & playlist & progress).
  // - Non-enrolled visitors who explicitly requested '?learn=1' enter trial ClassroomView.
  // - Explicit '?view=details' or non-enrolled visitors see CourseDetailView (overview, syllabus, pricing, AddToCart).
  const showClassroom = (isEnrolled && query.view !== 'details') || query.learn === '1'

  if (showClassroom) {
    return <ClassroomView course={courseItem} initialClasses={lessons} />
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <CourseDetailView course={course as any} isEnrolled={isEnrolled} />
      </main>
      <Footer />
    </>
  )
}
