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
import { encryptVideoUrl } from '@/utils/videoHash'
import { extractCleanId } from '@/utils/extractId'
import { checkUserEnrollment } from '@/utils/enrollment'
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
    overrideAccess: true, // Server-side execution only
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
        youtubeVideoIdOrUrl: true,
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

  // 1. Verify user session and enrollment status server-side
  let isEnrolled = false
  let userId: string | undefined = undefined

  try {
    const payload = await getPayload({ config })
    const headersList = await headers()
    const session = await getServerSession(payload, headersList)
    userId = session?.user?.id

    if (userId) {
      const courseId = extractCleanId(course.id)
      isEnrolled = await checkUserEnrollment(payload, userId, courseId)
    }
  } catch (err) {
    console.error('Error checking course enrollment:', err)
  }

  // 2. Anti-Piracy Data Protection:
  // - Non-enrolled users: ONLY receive Demo URL (Live preview classes) and Chapter names (moduleName).
  //   Paid classes never receive video URLs or hashes.
  // - Enrolled users: Server sends tamper-proof AES-256-GCM encrypted Object Hashes (videoHash).
  const lessons: ClassroomClassItem[] = (course.lessons ?? []).map((l: any) => {
    const isFree = Boolean(l.isFreePreview)
    let videoHash: string | undefined = undefined
    let videoSource: string | undefined = undefined

    if (isEnrolled && l.youtubeVideoIdOrUrl) {
      // Enrolled: Server sends encrypted Object Hash (tied to classId and userId)
      videoHash = encryptVideoUrl(l.youtubeVideoIdOrUrl, {
        classId: l.id,
        userId,
        expiresInMs: 4 * 60 * 60 * 1000,
      })
    } else if (isFree && l.youtubeVideoIdOrUrl) {
      // Non-enrolled: ONLY send Demo URL for live preview classes
      videoSource = l.youtubeVideoIdOrUrl
    }

    let classSlideUrl: string | undefined = undefined
    let classNoteUrl: string | undefined = undefined
    let classSlideName: string | undefined = undefined
    let classNoteName: string | undefined = undefined

    if (isEnrolled || isFree) {
      if (l.classSlide && typeof l.classSlide === 'object') {
        classSlideUrl = l.classSlide.url || l.classSlide.cloudinary?.secure_url
        classSlideName = l.classSlide.filename || 'Class-Slide.pptx'
      } else if (typeof l.classSlideUrl === 'string' && l.classSlideUrl) {
        classSlideUrl = l.classSlideUrl
        classSlideName = 'Class-Slide.pptx'
      }

      if (l.classNote && typeof l.classNote === 'object') {
        classNoteUrl = l.classNote.url || l.classNote.cloudinary?.secure_url
        classNoteName = l.classNote.filename || 'Class-Note'
      } else if (typeof l.classNoteUrl === 'string' && l.classNoteUrl) {
        classNoteUrl = l.classNoteUrl
        classNoteName = 'Class-Note'
      }
    }

    return {
      id: l.id,
      title: l.lessonTitle,
      subjectSlug: l.moduleName || 'General', // Chapter Name
      order: l.order,
      duration: l.duration,
      isFreePreview: isFree,
      videoHash,
      videoSource,
      classSlideUrl,
      classNoteUrl,
      classSlideName,
      classNoteName,
    }
  })

  // Sanitize course object for CourseDetailView to prevent leaking raw URLs
  const safeLessons = (course.lessons ?? []).map((l: any) => ({
    id: l.id,
    lessonTitle: l.lessonTitle,
    moduleName: l.moduleName,
    duration: l.duration,
    order: l.order,
    isFreePreview: Boolean(l.isFreePreview),
    demoUrl: l.isFreePreview ? l.youtubeVideoIdOrUrl : undefined,
  }))

  const safeCourse = {
    ...course,
    lessons: safeLessons,
  }

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground">
        {showClassroom ? (
          <ClassroomView course={courseItem} initialClasses={lessons} />
        ) : (
          <CourseDetailView course={safeCourse as any} isEnrolled={isEnrolled} />
        )}
      </main>
      <Footer />
    </>
  )
}
