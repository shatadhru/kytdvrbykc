import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ClassroomView from '@/components/basic/video-player/ClassroomView'
import type { ClassroomClassItem, ClassroomCourseItem } from '@/components/basic/video-player/ClassroomView'

interface Props {
  params: Promise<{ slug: string }>
}

async function fetchOverview(slug: string) {
  // Absolute URL required for server-side fetch in Next.js
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/courses/${slug}/overview`, {
    next: { revalidate: 300 }, // 5 min ISR
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.success ? data.course : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await fetchOverview(slug)
  if (!course) return { title: 'Course Not Found' }
  return {
    title: course.meta?.title || course.title,
    description: course.meta?.description || '',
  }
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  const course = await fetchOverview(slug)
  if (!course) notFound()

  // Map payload lessons → ClassroomClassItem (no videoSource / videoHash here;
  // the token is fetched on-demand in ClassroomView via the access API)
  const lessons: ClassroomClassItem[] = (course.lessons ?? []).map((l: any) => ({
    id: l.id,
    title: l.lessonTitle,
    subjectSlug: l.moduleName || 'General',
    order: l.order,
    duration: l.duration,
    isFreePreview: l.isFreePreview,
  }))

  const courseItem: ClassroomCourseItem = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.meta?.description || '',
  }

  return <ClassroomView course={courseItem} initialClasses={lessons} />
}

