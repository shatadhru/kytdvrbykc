import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload/payload.config.js'

process.on('unhandledRejection', (err: any) => {
  if (err?.message?.includes('Mismatching')) return
  console.error('Unhandled rejection:', err)
})

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

async function seedStudentEnrollments() {
  console.log('🚀 Loading enrollment data from files...')

  const ordersPath = path.join(DATA_DIR, 'orders_enrollments.json')
  const usersPath = path.join(DATA_DIR, 'users.json')

  const rawOrders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'))
  const rawUsers = JSON.parse(fs.readFileSync(usersPath, 'utf8'))

  const userMapByEmail = new Map<string, any>()
  const userMapById = new Map<number, any>()
  for (const u of rawUsers) {
    if (u.email) userMapByEmail.set(String(u.email).trim().toLowerCase(), u)
    if (u.id) userMapById.set(Number(u.id), u)
  }

  // Aggregate student enrollments from completed/processing orders
  interface EnrolledStudent {
    email: string
    name: string
    phone: string
    courseSlugs: Set<string>
    enrolledAt: string
  }

  const studentMap = new Map<string, EnrolledStudent>()

  for (const o of rawOrders) {
    const status = (o.status || '').toLowerCase()
    if (status !== 'completed' && status !== 'processing') continue

    const email = (o.billing?.email || '').trim().toLowerCase()
    if (!email) continue

    const wpId = o.customer_id
    const u = userMapByEmail.get(email) || (wpId ? userMapById.get(Number(wpId)) : null)

    const firstName = (o.billing?.first_name || u?.first_name || '').trim()
    const lastName = (o.billing?.last_name || u?.last_name || '').trim()
    let fullName = `${firstName} ${lastName}`.trim()
    if (!fullName) fullName = (u?.name || u?.username || email.split('@')[0]).trim()

    const phone = (o.billing?.phone || '').trim()
    const dateCompleted = o.date_completed || o.date_created || new Date().toISOString()

    if (!studentMap.has(email)) {
      studentMap.set(email, {
        email,
        name: fullName,
        phone,
        courseSlugs: new Set<string>(),
        enrolledAt: dateCompleted,
      })
    }

    const studentRecord = studentMap.get(email)!
    if (phone && !studentRecord.phone) studentRecord.phone = phone

    // Extract course slugs from order meta
    let foundCourse = false
    for (const m of o.meta_data || []) {
      const key = m.key || ''
      if (key.includes('_tutor_order_for_course_id_')) {
        const cid = Number(key.replace('_tutor_order_for_course_id_', ''))
        const slug = COURSE_SLUG_BY_ID[cid]
        if (slug) {
          studentRecord.courseSlugs.add(slug)
          foundCourse = true
        }
      }
    }

    // Fallback: line_items name
    if (!foundCourse) {
      for (const item of o.line_items || []) {
        const itemName = (item.name || '').trim()
        const slug = TITLE_TO_SLUG[itemName]
        if (slug) {
          studentRecord.courseSlugs.add(slug)
        }
      }
    }
  }

  console.log(`📊 Found ${studentMap.size} unique students with active course enrollments.`)

  console.log('📡 Connecting to Payload database...')
  const payload = await getPayload({ config })

  // Fetch all existing courses from DB
  const coursesRes = await payload.find({
    collection: 'products',
    limit: 200,
    depth: 0,
  })

  const courseIdBySlug = new Map<string, string>()
  for (const c of coursesRes.docs) {
    if (c.slug) courseIdBySlug.set(c.slug, String(c.id))
  }
  console.log(`📚 Loaded ${courseIdBySlug.size} courses from database.`)

  // Fetch all existing users in Payload
  console.log('👥 Loading existing users in DB...')
  const existingUsers = await payload.find({
    collection: 'users',
    limit: 5000,
    depth: 0,
  })
  const dbUserIdByEmail = new Map<string, string>()
  for (const u of existingUsers.docs) {
    if (u.email) dbUserIdByEmail.set(String(u.email).trim().toLowerCase(), String(u.id))
  }
  console.log(`👤 Found ${dbUserIdByEmail.size} existing users in database.`)

  // Fetch all existing enrollments in Payload
  console.log('📝 Loading existing enrollments in DB...')
  const existingEnrollments = await payload.find({
    collection: 'enrollments' as any,
    limit: 10000,
    depth: 0,
  })
  const existingEnrollmentKeys = new Set<string>()
  for (const e of existingEnrollments.docs as any[]) {
    const sId = typeof e.student === 'object' ? e.student?.id : e.student
    const cId = typeof e.course === 'object' ? e.course?.id : e.course
    if (sId && cId) {
      existingEnrollmentKeys.add(`${sId}_${cId}`)
    }
  }
  console.log(`🎟️ Found ${existingEnrollmentKeys.size} existing enrollment records.`)

  let usersCreated = 0
  let enrollmentsCreated = 0
  let skippedAlreadyEnrolled = 0

  const studentsList = Array.from(studentMap.values())
  const BATCH_SIZE = 15

  for (let i = 0; i < studentsList.length; i += BATCH_SIZE) {
    const chunk = studentsList.slice(i, i + BATCH_SIZE)

    await Promise.all(
      chunk.map(async (student) => {
        let userId = dbUserIdByEmail.get(student.email)

        // 1. Create User if not exists
        if (!userId) {
          try {
            const createdUser = await payload.create({
              collection: 'users',
              data: {
                name: student.name,
                email: student.email,
                phone: student.phone || undefined,
                role: 'user',
                emailVerified: true,
              } as any,
            })
            userId = String(createdUser.id)
            dbUserIdByEmail.set(student.email, userId)
            usersCreated++
          } catch (err: any) {
            // If already exists due to race or Better-Auth
            const found = await payload.find({
              collection: 'users',
              where: { email: { equals: student.email } },
              limit: 1,
            })
            if (found.docs.length > 0) {
              userId = String(found.docs[0].id)
              dbUserIdByEmail.set(student.email, userId)
            } else {
              console.error(`Failed to create user ${student.email}:`, err?.message || err)
              return
            }
          }
        }

        // 2. Create Enrollments for student's courses
        for (const slug of student.courseSlugs) {
          const courseId = courseIdBySlug.get(slug)
          if (!courseId) {
            // Course might not be in DB or has slightly different slug
            continue
          }

          const enrollmentKey = `${userId}_${courseId}`
          if (existingEnrollmentKeys.has(enrollmentKey)) {
            skippedAlreadyEnrolled++
            continue
          }

          try {
            await payload.create({
              collection: 'enrollments' as any,
              data: {
                student: userId,
                course: courseId,
                status: 'active',
                enrolledAt: student.enrolledAt,
              } as any,
            })
            existingEnrollmentKeys.add(enrollmentKey)
            enrollmentsCreated++
          } catch (err: any) {
            console.error(`Failed to enroll ${student.email} in ${slug}:`, err?.message || err)
          }
        }
      })
    )

    if ((i + BATCH_SIZE) % 150 === 0 || i + BATCH_SIZE >= studentsList.length) {
      console.log(`⏳ Progress: ${Math.min(i + BATCH_SIZE, studentsList.length)}/${studentsList.length} students processed... (Users created: ${usersCreated}, Enrollments created: ${enrollmentsCreated})`)
    }
  }

  console.log('\n🎉 ================================================')
  console.log(`✅ Student enrollment migration completed!`)
  console.log(`👤 New Users Created: ${usersCreated}`)
  console.log(`🎟️ New Enrollments Created: ${enrollmentsCreated}`)
  console.log(`⏭️ Already Enrolled (Skipped): ${skippedAlreadyEnrolled}`)
  console.log(`📚 Total Active Enrolled Students: ${studentMap.size}`)
  console.log('================================================\n')

  process.exit(0)
}

seedStudentEnrollments().catch((err) => {
  console.error('Fatal error during enrollment seeding:', err)
  process.exit(1)
})

