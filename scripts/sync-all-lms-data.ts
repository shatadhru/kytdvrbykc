import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload/payload.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../data')

const COURSE_SLUG_BY_ID: Record<number, string> = {
  327: 'ssc-27-physics-basic-to-premium',
  319: 'ssc-27-chemistry-basic-to-premium',
  334: 'ssc-27-higher-math-basic-to-premium',
  526: 'ssc-28-general-math-basic-to-premium',
  529: 'ssc-28-higher-math-basic-to-premium',
  527: 'ssc-28-physics-basic-to-premium',
  528: 'ssc-28-chemistry-basic-to-premium',
  867: 'ssc-27-pcm-combo',
  892: 'ssc-27-pcm-combo',
  887: 'ssc-28-pcm-combo',
  897: 'ssc-28-pcm-combo',
  1044: 'ssc-28-4-subject-combo',
  1052: 'ssc-27-4-subject-combo',
  329: 'ssc-27-general-math-basic-to-premium',
  5641: 'ssc-26-chemistry-extreme-revision',
  2195: 'ssc-2026-physics',
  2407: 'ssc-2026-chemistry',
  2484: 'ssc-2026-physics-chemistry-combo',
  5547: 'ssc-27-28-high-voltage-physics-free',
  5548: 'ssc-27-28-high-voltage-chemistry',
  5546: 'ssc-27-28-high-voltage-higher-math',
  5463: 'ssc-27-28-high-voltage-math-free',
  4235: '7-days-chemistry-challenge-free',
  4271: 'physics-bullet-mcq-free',
  4278: 'chemistry-top-25-bullet-mcq-free',
}

const TITLE_TO_SLUG: Record<string, string> = {
  'এস এস সি ২৭ – সাধারন গণিত – বেসিক টু প্রিমিয়াম': 'ssc-27-general-math-basic-to-premium',
  'এস এস সি ২৭ – গণিত – বেসিক টু প্রিমিয়াম': 'ssc-27-general-math-basic-to-premium',
  'এস এস সি ২৭ – পদার্থবিজ্ঞান- বেসিক টু প্রিমিয়াম': 'ssc-27-physics-basic-to-premium',
  'এস এস সি ২৭ - রসায়ন - বেসিক টু প্রিমিয়াম': 'ssc-27-chemistry-basic-to-premium',
  'এস এস সি ২৭ – উচ্চতর গণিত – বেসিক টু প্রিমিয়াম': 'ssc-27-higher-math-basic-to-premium',
  'SSC 26 রসায়ন এক্সট্রিম রিভিশন': 'ssc-26-chemistry-extreme-revision',
  'এস এস সি ২৮ – সাধারন গণিত – বেসিক টু প্রিমিয়াম': 'ssc-28-general-math-basic-to-premium',
  'এস এস সি ২৮ – পদার্থবিজ্ঞান – বেসিক টু প্রিমিয়াম': 'ssc-28-physics-basic-to-premium',
  'এস এস সি ২৮ – রসায়ন – বেসিক টু প্রিমিয়াম': 'ssc-28-chemistry-basic-to-premium',
  'এস এস সি ২৮ – রসায়ন – বেসিক টু প্রিমিয়াম কোর্স': 'ssc-28-chemistry-basic-to-premium',
  'এস এস সি ২৮ – উচ্চতর গণিত – বেসিক টু প্রিমিয়াম': 'ssc-28-higher-math-basic-to-premium',
  'SSC 27 - পদার্থবিজ্ঞান, রসায়ন, গণিত কম্বো কোর্স': 'ssc-27-pcm-combo',
  'SSC 27 - পদার্থবিজ্ঞান, রসায়ন, গনিত, উচ্চতর গণিত কম্বো কোর্স': 'ssc-27-4-subject-combo',
  'SSC 28 - পদার্থবিজ্ঞান, রসায়ন, গণিত কম্বো কোর্স': 'ssc-28-pcm-combo',
  'SSC 28 - পদার্থবিজ্ঞান, রসায়ন, গনিত, উচ্চতর গণিত কম্বো কোর্স': 'ssc-28-4-subject-combo',
  'এস এস সি - ২০২৬ পদার্থবিজ্ঞান': 'ssc-2026-physics',
  'এস এস সি - ২০২৬ রসায়ন': 'ssc-2026-chemistry',
  'এস এস সি ২০২৬ পদার্থবিজ্ঞান ও রসায়ন কম্বো কোর্স': 'ssc-2026-physics-chemistry-combo',
}

function extractYoutubeUrl(rawVideoMeta: string | undefined): string {
  if (!rawVideoMeta) return 'https://youtu.be/rnshfIpWurk'
  const match = rawVideoMeta.match(/https?:\/\/[^\s";\\]+/)
  return match ? match[0] : 'https://youtu.be/rnshfIpWurk'
}

function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function runFullDataSync(payloadInstance?: any) {
  console.log('🚀 Starting Full LMS Data Sync & Migration...')
  const payload = payloadInstance || (await getPayload({ config }))

  // --------------------------------------------------------------------------
  // 1. SYNC COUPONS
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Syncing Coupons ---')
  const couponsFile = path.join(DATA_DIR, 'coupons.json')
  let couponsCreated = 0
  if (fs.existsSync(couponsFile)) {
    const rawCoupons = JSON.parse(fs.readFileSync(couponsFile, 'utf8'))
    for (const c of rawCoupons) {
      const code = String(c.code).trim().toUpperCase()
      const isPercent = c.discount_type === 'percent'
      const value = parseFloat(c.amount) || 0
      const expiresAt = c.date_expires ? new Date(c.date_expires).toISOString() : undefined

      const found = await payload.find({
        collection: 'coupons',
        where: { code: { equals: code } },
        limit: 1,
        overrideAccess: true,
      })

      if (found.docs.length === 0) {
        await payload.create({
          collection: 'coupons',
          data: {
            code,
            type: isPercent ? 'percentage' : 'fixed',
            value,
            active: true,
            expiresAt,
            maxUses: c.usage_limit ? Number(c.usage_limit) : 0,
            usageCount: c.usage_count ? Number(c.usage_count) : 0,
          } as any,
          overrideAccess: true,
        })
        couponsCreated++
      }
    }
    console.log(`✅ Synced coupons (New: ${couponsCreated})`)
  }

  // --------------------------------------------------------------------------
  // 2. SYNC COURSES & LESSONS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Syncing Courses & Lessons ---')
  const coursesFile = path.join(DATA_DIR, 'courses.json')
  const lessonsFile = path.join(DATA_DIR, 'lessons.json')

  let coursesCreated = 0
  let coursesUpdated = 0

  if (fs.existsSync(coursesFile)) {
    const rawCourses = JSON.parse(fs.readFileSync(coursesFile, 'utf8'))
    let lessonsByCourseId = new Map<number, any[]>()

    if (fs.existsSync(lessonsFile)) {
      const rawLessons = JSON.parse(fs.readFileSync(lessonsFile, 'utf8'))
      for (const l of rawLessons) {
        const cid = Number(l.postmeta?._tutor_course_id_for_lesson || l.meta?._tutor_course_id_for_lesson)
        if (cid) {
          if (!lessonsByCourseId.has(cid)) lessonsByCourseId.set(cid, [])
          lessonsByCourseId.get(cid)!.push(l)
        }
      }
    }

    // Default fallback media ID for thumbnail
    const mediaRes = await payload.find({ collection: 'media', limit: 1, overrideAccess: true })
    const thumbnailId = mediaRes.docs[0]?.id

    for (const c of rawCourses) {
      const courseId = Number(c.id)
      const slug = COURSE_SLUG_BY_ID[courseId] || `course-${courseId}`
      const rawTitle = cleanText(c.title?.rendered || `কোর্স ${courseId}`)
      const rawDesc = cleanText(c.content?.rendered || '')
      const isFree = [4235, 4271, 4278, 5463, 5547].includes(courseId)
      const price = isFree ? 0 : 2

      // Lessons for this course
      const rawCourseLessons = lessonsByCourseId.get(courseId) || []
      const lessonsData = rawCourseLessons.map((l: any, idx: number) => {
        const videoMeta = l.postmeta?._video || l.meta?._video || ''
        const youtubeUrl = extractYoutubeUrl(videoMeta)
        return {
          lessonTitle: cleanText(l.title?.rendered || l.title || `ক্লাস ${idx + 1}`),
          moduleName: `অধ্যায় ১`,
          subjectName: 'সাধারণ',
          subjectSlug: 'general',
          duration: '45m',
          order: idx + 1,
          isFreePreview: idx === 0,
          youtubeVideoIdOrUrl: youtubeUrl,
        }
      })

      const existingCourse = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: true,
      })

      if (existingCourse.docs.length > 0) {
        const existingDoc = existingCourse.docs[0] as any
        const existingLessons = existingDoc.lessons || []
        // Update if existing has fewer lessons than real catalog
        if (existingLessons.length < lessonsData.length && lessonsData.length > 0) {
          await payload.update({
            collection: 'products',
            id: existingDoc.id,
            data: {
              lessons: lessonsData,
            } as any,
            overrideAccess: true,
          })
          coursesUpdated++
        }
      } else {
        await payload.create({
          collection: 'products',
          data: {
            title: rawTitle,
            slug,
            productType: 'course',
            priceInBDT: price,
            price: price,
            isCourse: true,
            isFree,
            thumbnail: thumbnailId || undefined,
            meta: {
              description: rawDesc.slice(0, 160),
            },
            lessons: lessonsData,
          } as any,
          overrideAccess: true,
        })
        coursesCreated++
      }
    }
    console.log(`✅ Synced courses (Created: ${coursesCreated}, Updated with lessons: ${coursesUpdated})`)
  }

  // --------------------------------------------------------------------------
  // 3. SYNC STUDENTS & ENROLLMENTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Syncing Students & Enrollments ---')
  const ordersPath = path.join(DATA_DIR, 'orders_enrollments.json')
  const usersPath = path.join(DATA_DIR, 'users.json')

  if (!fs.existsSync(ordersPath)) {
    console.log('⚠️ orders_enrollments.json not found, skipping student enrollment sync.')
    return
  }

  const rawOrders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'))
  let rawUsers: any[] = []
  if (fs.existsSync(usersPath)) {
    rawUsers = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
  }

  const userMetaByWpId = new Map<number, { name: string; email: string; phone?: string }>()
  for (const u of rawUsers) {
    const wpId = Number(u.id || u.ID)
    const email = String(u.user_email || u.email || '').trim().toLowerCase()
    const name = u.display_name || u.name || email.split('@')[0]
    const phone = u.meta?.billing_phone || u.postmeta?.billing_phone || ''
    if (wpId && email) {
      userMetaByWpId.set(wpId, { name, email, phone })
    }
  }

  interface StudentEnrollmentRecord {
    email: string
    name: string
    phone: string
    courseSlugs: Set<string>
    enrolledAt: string
  }

  const studentMap = new Map<string, StudentEnrollmentRecord>()

  for (const o of rawOrders) {
    if (o.status !== 'completed') continue

    const customerId = Number(o.customer_id)
    const email = String(o.billing?.email || userMetaByWpId.get(customerId)?.email || '')
      .trim()
      .toLowerCase()

    if (!email || !email.includes('@')) continue

    const name =
      `${o.billing?.first_name || ''} ${o.billing?.last_name || ''}`.trim() ||
      userMetaByWpId.get(customerId)?.name ||
      email.split('@')[0]

    const phone =
      String(o.billing?.phone || userMetaByWpId.get(customerId)?.phone || '').trim()

    const lineItems = Array.isArray(o.line_items) ? o.line_items : []
    const matchedSlugs: string[] = []

    for (const item of lineItems) {
      const pid = Number(item.product_id)
      const directSlug = COURSE_SLUG_BY_ID[pid]
      if (directSlug) {
        matchedSlugs.push(directSlug)
      } else {
        const itemName = cleanText(item.name || '')
        const slugByName = TITLE_TO_SLUG[itemName]
        if (slugByName) matchedSlugs.push(slugByName)
      }
    }

    if (matchedSlugs.length === 0) continue

    const enrolledAt = o.date_completed || o.date_created || new Date().toISOString()

    if (!studentMap.has(email)) {
      studentMap.set(email, {
        email,
        name,
        phone,
        courseSlugs: new Set(matchedSlugs),
        enrolledAt,
      })
    } else {
      const existing = studentMap.get(email)!
      matchedSlugs.forEach((s) => existing.courseSlugs.add(s))
      if (!existing.phone && phone) existing.phone = phone
    }
  }

  console.log(`📊 Found ${studentMap.size} unique students with active course enrollments.`)

  // Preload courses from DB
  const dbCourses = await payload.find({ collection: 'products', limit: 200, depth: 0, overrideAccess: true })
  const courseIdBySlug = new Map<string, string>()
  for (const c of dbCourses.docs) {
    if (c.slug) courseIdBySlug.set(c.slug, String(c.id))
  }

  // Preload existing users from DB
  const dbUsers = await payload.find({ collection: 'users', limit: 10000, depth: 0, overrideAccess: true })
  const dbUserIdByEmail = new Map<string, string>()
  for (const u of dbUsers.docs) {
    if (u.email) dbUserIdByEmail.set(String(u.email).trim().toLowerCase(), String(u.id))
  }

  // Preload existing enrollments from DB
  const dbEnrollments = await payload.find({ collection: 'enrollments' as any, limit: 10000, depth: 0, overrideAccess: true })
  const existingEnrollmentKeys = new Set<string>()
  for (const e of dbEnrollments.docs as any[]) {
    const sId = typeof e.student === 'object' ? e.student?.id : e.student
    const cId = typeof e.course === 'object' ? e.course?.id : e.course
    if (sId && cId) existingEnrollmentKeys.add(`${sId}_${cId}`)
  }

  let usersCreated = 0
  let enrollmentsCreated = 0

  const studentsList = Array.from(studentMap.values())
  const BATCH_SIZE = 15

  for (let i = 0; i < studentsList.length; i += BATCH_SIZE) {
    const chunk = studentsList.slice(i, i + BATCH_SIZE)
    await Promise.all(
      chunk.map(async (student) => {
        let userId = dbUserIdByEmail.get(student.email)

        if (!userId) {
          try {
            const created = await payload.create({
              collection: 'users',
              data: {
                name: student.name,
                email: student.email,
                phone: student.phone || undefined,
                role: 'user',
                emailVerified: true,
              } as any,
              overrideAccess: true,
            })
            userId = String(created.id)
            dbUserIdByEmail.set(student.email, userId)
            usersCreated++
          } catch {
            const found = await payload.find({
              collection: 'users',
              where: { email: { equals: student.email } },
              limit: 1,
              overrideAccess: true,
            })
            if (found.docs.length > 0) {
              userId = String(found.docs[0].id)
              dbUserIdByEmail.set(student.email, userId)
            } else {
              return
            }
          }
        }

        for (const slug of student.courseSlugs) {
          const courseId = courseIdBySlug.get(slug)
          if (!courseId) continue

          const key = `${userId}_${courseId}`
          if (existingEnrollmentKeys.has(key)) continue

          try {
            await payload.create({
              collection: 'enrollments' as any,
              data: {
                student: userId,
                course: courseId,
                status: 'active',
                enrolledAt: student.enrolledAt,
                completedLessons: [],
              } as any,
              overrideAccess: true,
            })
            existingEnrollmentKeys.add(key)
            enrollmentsCreated++
          } catch (err: any) {
            console.error(`Failed to enroll ${student.email} in ${slug}:`, err?.message || err)
          }
        }
      })
    )
  }

  console.log('\n================================================')
  console.log('🎉 LMS Full Sync Completed Successfully!')
  console.log(`👤 Users in DB: ${dbUserIdByEmail.size}`)
  console.log(`🎟️ Enrollments in DB: ${existingEnrollmentKeys.size}`)
  console.log('================================================\n')

  return {
    success: true,
    totalStudents: studentMap.size,
    newUsersCreated: usersCreated,
    newEnrollmentsCreated: enrollmentsCreated,
    totalEnrollments: existingEnrollmentKeys.size,
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

