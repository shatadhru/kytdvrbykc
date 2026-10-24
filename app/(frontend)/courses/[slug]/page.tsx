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
        classSlide: true,
        classNote: true,
        classSlideUrl: true,
        classNoteUrl: true,
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

  function getDocId(val: any): string | null {
    if (!val) return null
    if (typeof val === 'string' && val.length > 5 && !val.startsWith('http') && !val.startsWith('/')) {
      return val
    }
    if (typeof val === 'object' && val.id) {
      return String(val.id)
    }
    return null
  }

  // 2. Resolve class slide and note files (whether populated object, media ID string, or direct URL)
  const mediaIds: string[] = []
  for (const l of (course.lessons ?? [])) {
    const sId = getDocId(l.classSlide)
    if (sId) mediaIds.push(sId)
    const nId = getDocId(l.classNote)
    if (nId) mediaIds.push(nId)
  }

  const mediaMap: Record<string, any> = {}
  if (mediaIds.length > 0) {
    try {
      const payload = await getPayload({ config })
      const mediaDocs = await payload.find({
        collection: 'media',
        where: { id: { in: Array.from(new Set(mediaIds)) } },
        limit: mediaIds.length,
        pagination: false,
        overrideAccess: true,
      })
      for (const m of mediaDocs.docs) {
        mediaMap[String(m.id)] = m
      }
    } catch (e) {
      console.warn('Could not batch-resolve media for lessons:', e)
    }
  }

  // 3. Anti-Piracy Data Protection & Lesson Resource Mapping:
  // - Non-enrolled users: ONLY receive Demo URL (Live preview classes) and Chapter names (moduleName).
  //   Paid classes never receive video URLs or hashes.
  // - Enrolled users: Server sends tamper-proof AES-256-GCM encrypted Object Hashes (videoHash).
  const lessons: ClassroomClassItem[] = (course.lessons ?? []).map((l: any) => {
    const isFree = Boolean(l.isFreePreview)
    let videoHash: string | undefined = undefined
    let videoSource: string | undefined = undefined

    if (l.youtubeVideoIdOrUrl) {
      // 100% Anti-Piracy: Never expose raw YouTube URL to client side. Always encrypt with AES-256-GCM.
      if (isEnrolled) {
        videoHash = encryptVideoUrl(l.youtubeVideoIdOrUrl, {
          classId: l.id,
          userId,
          expiresInMs: 4 * 60 * 60 * 1000,
        })
      } else if (isFree) {
        videoHash = encryptVideoUrl(l.youtubeVideoIdOrUrl, {
          classId: l.id,
          expiresInMs: 4 * 60 * 60 * 1000,
        })
      }
    }

    // Resolve Slide
    let classSlideUrl: string | undefined = undefined
    let classSlideName: string = 'Class-Slide.pptx'

    const slideId = getDocId(l.classSlide)
    const slideDoc = (slideId && mediaMap[slideId]) || (typeof l.classSlide === 'object' ? l.classSlide : null)
    if (slideDoc) {
      classSlideUrl = slideDoc.url || slideDoc.cloudinary?.secure_url
      classSlideName = slideDoc.filename || slideDoc.alt || 'Class-Slide.pptx'
    } else if (typeof l.classSlideUrl === 'string' && l.classSlideUrl.trim()) {
      classSlideUrl = l.classSlideUrl.trim()
      classSlideName = 'Class-Slide.pptx'
    } else if (typeof l.classSlide === 'string' && (l.classSlide.startsWith('http') || l.classSlide.startsWith('/'))) {
      classSlideUrl = l.classSlide.trim()
      classSlideName = 'Class-Slide.pptx'
    }

    // Resolve Note
    let classNoteUrl: string | undefined = undefined
    let classNoteName: string = 'Class-Note.pdf'

    const noteId = getDocId(l.classNote)
    const noteDoc = (noteId && mediaMap[noteId]) || (typeof l.classNote === 'object' ? l.classNote : null)
    if (noteDoc) {
      classNoteUrl = noteDoc.url || noteDoc.cloudinary?.secure_url
      classNoteName = noteDoc.filename || noteDoc.alt || 'Class-Note.pdf'
    } else if (typeof l.classNoteUrl === 'string' && l.classNoteUrl.trim()) {
      classNoteUrl = l.classNoteUrl.trim()
      classNoteName = 'Class-Note.pdf'
    } else if (typeof l.classNote === 'string' && (l.classNote.startsWith('http') || l.classNote.startsWith('/'))) {
      classNoteUrl = l.classNote.trim()
      classNoteName = 'Class-Note.pdf'
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
  const safeLessons = (course.lessons ?? []).map((l: any, idx: number) => {
    const resolvedLesson = lessons[idx]
    return {
      id: l.id,
      lessonTitle: l.lessonTitle,
      moduleName: l.moduleName,
      duration: l.duration,
      order: l.order,
      isFreePreview: Boolean(l.isFreePreview),
      demoUrl:
        l.isFreePreview && l.youtubeVideoIdOrUrl
          ? encryptVideoUrl(l.youtubeVideoIdOrUrl, { classId: l.id, expiresInMs: 4 * 60 * 60 * 1000 })
          : undefined,
      classSlideUrl: resolvedLesson?.classSlideUrl,
      classNoteUrl: resolvedLesson?.classNoteUrl,
      classSlideName: resolvedLesson?.classSlideName,
      classNoteName: resolvedLesson?.classNoteName,
    }
  })

  const safeIntroductoryVideo = course.introductoryVideo
    ? encryptVideoUrl(course.introductoryVideo, { expiresInMs: 4 * 60 * 60 * 1000 })
    : undefined

  const safeCourse = {
    ...course,
    introductoryVideo: safeIntroductoryVideo,
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
