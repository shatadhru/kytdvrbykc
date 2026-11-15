import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload/payload.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../data')

export const COURSE_SLUG_BY_ID: Record<number, string> = {
  319: 'ssc-27-chemistry-basic-to-premium',
  327: 'ssc-27-physics-basic-to-premium',
  329: 'ssc-27-general-math-basic-to-premium',
  334: 'ssc-27-higher-math-basic-to-premium',
  526: 'ssc-28-general-math-basic-to-premium',
  527: 'ssc-28-physics-basic-to-premium',
  528: 'ssc-28-chemistry-basic-to-premium',
  529: 'ssc-28-higher-math-basic-to-premium',
  892: 'ssc-27-pcm-combo',
  897: 'ssc-28-pcm-combo',
  1044: 'ssc-28-4-subject-combo',
  1052: 'ssc-27-4-subject-combo',
  2195: 'ssc-2026-physics',
  2407: 'ssc-2026-chemistry',
  2484: 'ssc-2026-physics-chemistry-combo',
  4235: '7-days-chemistry-challenge-free',
  4271: 'physics-bullet-mcq-free',
  4278: 'chemistry-top-25-bullet-mcq-free',
  5463: 'ssc-27-28-high-voltage-math-free',
  5546: 'ssc-27-28-high-voltage-higher-math',
  5547: 'ssc-27-28-high-voltage-physics-free',
  5548: 'ssc-27-28-high-voltage-chemistry',
  5641: 'ssc-26-chemistry-extreme-revision',
}

const SUBJECT_KEYWORDS: [string, string, string][] = [
  ['পদার্থবিজ্ঞান', 'পদার্থবিজ্ঞান (Physics)', 'physics'],
  ['physics', 'পদার্থবিজ্ঞান (Physics)', 'physics'],
  ['রসায়ন', 'রসায়ন (Chemistry)', 'chemistry'],
  ['রসায়ন', 'রসায়ন (Chemistry)', 'chemistry'],
  ['chemistry', 'রসায়ন (Chemistry)', 'chemistry'],
  ['উচ্চতর গণিত', 'উচ্চতর গণিত (Higher Math)', 'higher-math'],
  ['উচ্চতর গনিত', 'উচ্চতর গণিত (Higher Math)', 'higher-math'],
  ['higher math', 'উচ্চতর গণিত (Higher Math)', 'higher-math'],
  ['hmath', 'উচ্চতর গণিত (Higher Math)', 'higher-math'],
  ['সাধারণ গণিত', 'সাধারণ গণিত (General Math)', 'general-math'],
  ['গনিত', 'সাধারণ গণিত (General Math)', 'general-math'],
  ['গণিত', 'সাধারণ গণিত (General Math)', 'general-math'],
  ['math', 'সাধারণ গণিত (General Math)', 'general-math'],
]

function detectSubject(title: string): { name: string; slug: string } {
  const lower = (title || '').toLowerCase()
  for (const [kw, name, slug] of SUBJECT_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      return { name, slug }
    }
  }
  return { name: 'সাধারণ পাঠ্যক্রম (General)', slug: 'general' }
}

export async function runFullDataSync(payloadInstance?: any) {
  console.log('🚀 Starting Full LMS Data Sync & Migration from utmeducation.com MariaDB data...')
  const payload = payloadInstance || (await getPayload({ config }))

  const coursesFile = path.join(DATA_DIR, 'courses.json')
  const topicsFile = path.join(DATA_DIR, 'topics.json')
  const lessonsFile = path.join(DATA_DIR, 'lessons.json')
  const usersFile = path.join(DATA_DIR, 'users.json')
  const enrollmentsFile = path.join(DATA_DIR, 'enrollments.json')

  if (!fs.existsSync(coursesFile)) {
    throw new Error(`Data file not found: ${coursesFile}`)
  }

  const rawCourses: any[] = JSON.parse(fs.readFileSync(coursesFile, 'utf8'))
  const rawTopics: any[] = fs.existsSync(topicsFile) ? JSON.parse(fs.readFileSync(topicsFile, 'utf8')) : []
  const rawLessons: any[] = fs.existsSync(lessonsFile) ? JSON.parse(fs.readFileSync(lessonsFile, 'utf8')) : []
  const rawUsers: any[] = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf8')) : []
  const rawEnrollments: any[] = fs.existsSync(enrollmentsFile) ? JSON.parse(fs.readFileSync(enrollmentsFile, 'utf8')) : []

  // --------------------------------------------------------------------------
  // Map Topics by ID
  // --------------------------------------------------------------------------
  const topicMap = new Map<number, any>()
  for (const t of rawTopics) {
    topicMap.set(Number(t.id), t)
  }

  // --------------------------------------------------------------------------
  // Map Lessons by Course ID
  // --------------------------------------------------------------------------
  const lessonsByCourseId = new Map<number, any[]>()
  for (const l of rawLessons) {
    let cid = Number(l.course_id)
    if (!cid && l.topic_id && topicMap.has(Number(l.topic_id))) {
      cid = Number(topicMap.get(Number(l.topic_id)).course_id)
    }
    if (cid) {
      if (!lessonsByCourseId.has(cid)) lessonsByCourseId.set(cid, [])
      lessonsByCourseId.get(cid)!.push(l)
    }
  }

  // --------------------------------------------------------------------------
  // 1. SYNC MEDIA (Course Thumbnails)
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Syncing Media Thumbnails ---')
  const existingMedia = await payload.find({
    collection: 'media',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const mediaUrlMap = new Map<string, string>()
  const mediaAltMap = new Map<string, string>()

  for (const m of existingMedia.docs as any[]) {
    if (m.url) mediaUrlMap.set(m.url, String(m.id))
    if (m.alt) mediaAltMap.set(m.alt, String(m.id))
  }

  let mediaCreated = 0
  for (const c of rawCourses) {
    const thumbUrl = c.thumbnail?.url
    if (!thumbUrl) continue

    if (!mediaUrlMap.has(thumbUrl) && !mediaAltMap.has(c.title)) {
      try {
        const created = await payload.create({
          collection: 'media',
          data: {
            alt: c.title || 'Course Thumbnail',
            url: thumbUrl,
          } as any,
          overrideAccess: true,
        })
        const mId = String(created.id)
        mediaUrlMap.set(thumbUrl, mId)
        mediaAltMap.set(c.title, mId)
        mediaCreated++
      } catch (err: any) {
        console.warn(`Could not create media record for ${thumbUrl}:`, err?.message || err)
      }
    }
  }
  console.log(`✅ Media thumbnails synced (Created: ${mediaCreated}, Total available: ${mediaUrlMap.size})`)

  // Default fallback thumbnail if needed
  const fallbackThumbnailId = existingMedia.docs[0]?.id || Array.from(mediaUrlMap.values())[0]

  // --------------------------------------------------------------------------
  // 2. SYNC COURSES & CURRICULUM
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Syncing Courses & Detailed Lessons ---')
  let coursesCreated = 0
  let coursesUpdated = 0

  // Pre-load all existing courses in Payload
  const dbCourses = await payload.find({
    collection: 'products',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })
  const courseIdBySlug = new Map<string, string>()
  const courseDocBySlug = new Map<string, any>()

  for (const doc of dbCourses.docs as any[]) {
    if (doc.slug) {
      courseIdBySlug.set(doc.slug, String(doc.id))
      courseDocBySlug.set(doc.slug, doc)
    }
  }

  // Filter out trash courses unless they have lessons
  const validCourses = rawCourses.filter((c: any) => {
    if (c.status === 'trash') return false
    return true
  })

  for (const c of validCourses) {
    const wpId = Number(c.id)
    const slug = COURSE_SLUG_BY_ID[wpId] || `course-${wpId}`
    const title = c.title
    const introVideoUrl = c.intro_video?.youtube_url || ''
    const thumbUrl = c.thumbnail?.url
    const thumbnailId = (thumbUrl ? mediaUrlMap.get(thumbUrl) : null) || fallbackThumbnailId

    const priceNum = parseFloat(c.pricing?.sale_price || c.pricing?.price || '0') || 0
    const isFree = priceNum === 0 || [4235, 4271, 4278, 5463, 5547].includes(wpId)
    const price = isFree ? 0 : priceNum

    // Course raw lessons
    const courseLessons = lessonsByCourseId.get(wpId) || []

    // Group lessons into subjects/modules
    const subjectsMap = new Map<string, { name: string; slug: string; lessons: any[] }>()

    const mappedLessons = courseLessons.map((l: any, idx: number) => {
      const topicObj = l.topic_id ? topicMap.get(Number(l.topic_id)) : null
      const moduleName = topicObj?.title || 'সাধারণ পাঠ্যক্রম (General)'
      const subInfo = detectSubject(moduleName !== 'সাধারণ পাঠ্যক্রম (General)' ? moduleName : l.title)

      const ytUrl = l.video?.youtube_url || ''
      const duration = l.video?.playtime || '45m'
      const noteUrl = l.attachments?.[0]?.url || l.class_links_in_content?.[0] || ''
      const slideUrl = l.attachments?.[1]?.url || ''

      const lessonItem = {
        id: String(l.id),
        lessonTitle: l.title,
        moduleName,
        subjectName: subInfo.name,
        subjectSlug: subInfo.slug,
        duration,
        order: Number(l.order) || idx + 1,
        isFreePreview: idx === 0 || Boolean(l.is_preview),
        youtubeVideoIdOrUrl: ytUrl,
        classNoteUrl: noteUrl,
        classSlideUrl: slideUrl,
        quranVersePreset: 'none',
      }

      // Add to subject group
      if (!subjectsMap.has(subInfo.slug)) {
        subjectsMap.set(subInfo.slug, {
          name: subInfo.name,
          slug: subInfo.slug,
          lessons: [],
        })
      }
      subjectsMap.get(subInfo.slug)!.lessons.push(lessonItem)

      return lessonItem
    })

    const builtSubjects = Array.from(subjectsMap.values()).map((s) => ({
      subjectName: s.name,
      subjectSlug: s.slug,
      lessons: s.lessons,
    }))

    const coursePayloadData: any = {
      title,
      slug,
      isCourse: true,
      priceInBDT: price,
      price,
      isFree,
      introductoryVideo: introVideoUrl,
      _status: 'published',
      meta: {
        title: title,
        description: (c.description ? c.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 160) : '').trim(),
      },
    }

    if (thumbnailId) {
      coursePayloadData.thumbnail = thumbnailId
    }

    if (builtSubjects.length > 0) {
      coursePayloadData.subjects = builtSubjects
    }

    if (mappedLessons.length > 0) {
      coursePayloadData.lessons = mappedLessons
    }

    const existingId = courseIdBySlug.get(slug)

    if (existingId) {
      // Update existing course with refreshed lessons and fields
      await payload.update({
        collection: 'products',
        id: existingId,
        data: coursePayloadData,
        overrideAccess: true,
      })
      coursesUpdated++
    } else {
      // Create new course
      const created = await payload.create({
        collection: 'products',
        data: coursePayloadData,
        overrideAccess: true,
      })
      courseIdBySlug.set(slug, String(created.id))
      coursesCreated++
    }
  }

  console.log(`✅ Synced courses (Created: ${coursesCreated}, Updated: ${coursesUpdated}, Total: ${courseIdBySlug.size})`)

  // --------------------------------------------------------------------------
  // 3. SYNC STUDENTS & USERS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Syncing Users & Students ---')
  const dbUsers = await payload.find({
    collection: 'users',
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  })

  const dbUserIdByEmail = new Map<string, string>()
  const wpIdToEmailMap = new Map<number, string>()

  for (const u of dbUsers.docs as any[]) {
    if (u.email) {
      dbUserIdByEmail.set(String(u.email).trim().toLowerCase(), String(u.id))
    }
  }

  let usersCreated = 0
  const USER_BATCH_SIZE = 25

  for (let i = 0; i < rawUsers.length; i += USER_BATCH_SIZE) {
    const chunk = rawUsers.slice(i, i + USER_BATCH_SIZE)
    await Promise.all(
      chunk.map(async (u: any) => {
        const email = String(u.email || u.user_email || '').trim().toLowerCase()
        const wpId = Number(u.id)

        if (email && email.includes('@')) {
          wpIdToEmailMap.set(wpId, email)

          if (!dbUserIdByEmail.has(email)) {
            const name = u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || email.split('@')[0]
            const phone = u.phone || ''
            const role = Array.isArray(u.roles) && u.roles.includes('administrator') ? 'admin' : 'user'

            try {
              const created = await payload.create({
                collection: 'users',
                data: {
                  name,
                  email,
                  phone: phone || undefined,
                  role,
                  emailVerified: true,
                } as any,
                overrideAccess: true,
              })
              dbUserIdByEmail.set(email, String(created.id))
              usersCreated++
            } catch (err: any) {
              // If duplicate key race, find it
              const found = await payload.find({
                collection: 'users',
                where: { email: { equals: email } },
                limit: 1,
                overrideAccess: true,
              })
              if (found.docs.length > 0) {
                dbUserIdByEmail.set(email, String(found.docs[0].id))
              }
            }
          }
        }
      })
    )
  }

  console.log(`✅ Synced users (New: ${usersCreated}, Total in DB: ${dbUserIdByEmail.size})`)

  // --------------------------------------------------------------------------
  // 4. SYNC ENROLLMENTS
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Syncing Enrollments ---')
  const dbEnrollments = await payload.find({
    collection: 'enrollments' as any,
    limit: 20000,
    depth: 0,
    overrideAccess: true,
  })

  const existingEnrollmentKeys = new Set<string>()
  for (const e of dbEnrollments.docs as any[]) {
    const sId = typeof e.student === 'object' ? e.student?.id : e.student
    const cId = typeof e.course === 'object' ? e.course?.id : e.course
    if (sId && cId) {
      existingEnrollmentKeys.add(`${sId}_${cId}`)
    }
  }

  let enrollmentsCreated = 0
  const ENROLL_BATCH_SIZE = 30

  for (let i = 0; i < rawEnrollments.length; i += ENROLL_BATCH_SIZE) {
    const chunk = rawEnrollments.slice(i, i + ENROLL_BATCH_SIZE)
    await Promise.all(
      chunk.map(async (en: any) => {
        const wpUserId = Number(en.user_id)
        const wpCourseId = Number(en.course_id)

        const studentEmail = en.user_email || wpIdToEmailMap.get(wpUserId)
        if (!studentEmail) return

        const studentMongoId = dbUserIdByEmail.get(String(studentEmail).trim().toLowerCase())
        if (!studentMongoId) return

        const courseSlug = COURSE_SLUG_BY_ID[wpCourseId] || `course-${wpCourseId}`
        const courseMongoId = courseIdBySlug.get(courseSlug)
        if (!courseMongoId) return

        const key = `${studentMongoId}_${courseMongoId}`
        if (existingEnrollmentKeys.has(key)) return

        const status = en.status === 'cancel' || en.status === 'cancelled'
          ? 'revoked'
          : (en.status === 'on-hold' ? 'suspended' : 'active')

        try {
          await payload.create({
            collection: 'enrollments' as any,
            data: {
              student: studentMongoId,
              course: courseMongoId,
              status,
              enrolledAt: en.enrolled_at || new Date().toISOString(),
              completedLessons: [],
            } as any,
            overrideAccess: true,
          })
          existingEnrollmentKeys.add(key)
          enrollmentsCreated++
        } catch (err: any) {
          console.error(`Enrollment sync error for user ${studentEmail} in course ${courseSlug}:`, err?.message || err)
        }
      })
    )
  }

  console.log(`✅ Synced enrollments (New: ${enrollmentsCreated}, Total in DB: ${existingEnrollmentKeys.size})`)

  console.log('\n=============================================================')
  console.log('🎉 LMS Data Sync & Migration Completed Successfully!')
  console.log(`📚 Total Courses in DB: ${courseIdBySlug.size}`)
  console.log(`👤 Total Users in DB: ${dbUserIdByEmail.size}`)
  console.log(`🎟️ Total Enrollments in DB: ${existingEnrollmentKeys.size}`)
  console.log('=============================================================\n')

  return {
    success: true,
    totalCourses: courseIdBySlug.size,
    newCoursesCreated: coursesCreated,
    coursesUpdated,
    totalUsers: dbUserIdByEmail.size,
    newUsersCreated: usersCreated,
    totalEnrollments: existingEnrollmentKeys.size,
    newEnrollmentsCreated: enrollmentsCreated,
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFullDataSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal sync error:', err)
      process.exit(1)
    })
}
