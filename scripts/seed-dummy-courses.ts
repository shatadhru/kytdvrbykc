import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload/payload.config.js'

// Ignore version checker mismatch in standalone script
process.on('unhandledRejection', (err: any) => {
  if (err?.message?.includes('Mismatching')) return
  console.error('Unhandled error:', err)
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../data')

interface UniqueVideoItem {
  video_url: string
  title: string
  duration: string
  subject: string
}

const SLUG_MAPPINGS: Record<number, string> = {
  327: 'ssc-27-physics-basic-to-premium',
  319: 'ssc-27-chemistry-basic-to-premium',
  334: 'ssc-27-higher-math-basic-to-premium',
  526: 'ssc-28-general-math-basic-to-premium',
  529: 'ssc-28-higher-math-basic-to-premium',
  527: 'ssc-28-physics-basic-to-premium',
  528: 'ssc-28-chemistry-basic-to-premium',
  892: 'ssc-27-pcm-combo',
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

// 5 selected free courses (৳ 0)
const FREE_COURSE_IDS = new Set([4235, 4271, 4278, 5463, 5547])

const QURAN_PRESETS = [
  'verse-inshirah-5-6',
  'verse-taha-114',
  'verse-baqarah-286',
  'verse-ali-imran-139',
  'verse-rad-28',
  'verse-talaq-3',
  'verse-ankabut-69',
  'verse-najm-39',
]

function cleanText(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function seed() {
  console.log('🌱 Starting Dummy Courses Seeding...')
  const payload = await getPayload({ config })

  // 1. Get fallback media ID for thumbnails
  const existingMedia = await payload.find({
    collection: 'media',
    limit: 1,
    depth: 0,
  })

  let thumbnailId = existingMedia.docs[0]?.id
  if (!thumbnailId) {
    console.error('❌ No media found in database to use as course thumbnail.')
    process.exit(1)
  }
  console.log(`📸 Using Media ID for thumbnails: ${thumbnailId}`)

  // 2. Load JSON data
  const rawCourses = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'courses.json'), 'utf8'))
  const physicsVideos: UniqueVideoItem[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'subjects/physics_unique.json'), 'utf8')
  )
  const chemistryVideos: UniqueVideoItem[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'subjects/chemistry_unique.json'), 'utf8')
  )
  const mathVideos: UniqueVideoItem[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'subjects/math_unique.json'), 'utf8')
  )
  const hmathVideos: UniqueVideoItem[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'subjects/higher_math_unique.json'), 'utf8')
  )

  console.log(`📚 Found ${rawCourses.length} courses in data/courses.json`)

  let createdCount = 0
  let updatedCount = 0

  for (let idx = 0; idx < rawCourses.length; idx++) {
    const raw = rawCourses[idx]
    const courseId = raw.id
    const rawTitle = cleanText(raw.title?.rendered || `কোর্স ${idx + 1}`)
    const slug = SLUG_MAPPINGS[courseId] || `course-${courseId}`
    const isFree = FREE_COURSE_IDS.has(courseId)
    const price = isFree ? 0 : 2

    // Build subjects structure
    let courseSubjects: any[] = []

    if ([892, 897].includes(courseId)) {
      // 3-Subject Combo: Physics, Chemistry, Math
      courseSubjects = [
        {
          subjectName: 'পদার্থবিজ্ঞান (Physics)',
          subjectSlug: 'physics',
          description: 'পদার্থবিজ্ঞান বেসিক থেকে বোর্ড পরীক্ষার প্রস্তুতি।',
          lessons: physicsVideos.slice(idx * 2, idx * 2 + 5).map((v, lIdx) => ({
            lessonTitle: v.title || `পদার্থবিজ্ঞান ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'পদার্থবিজ্ঞান',
            subjectSlug: 'physics',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[lIdx % QURAN_PRESETS.length],
          })),
        },
        {
          subjectName: 'রসায়ন (Chemistry)',
          subjectSlug: 'chemistry',
          description: 'রসায়নের সকল মৌলিক বিষয় ও বিক্রিয়া সহজ ব্যাখ্যা।',
          lessons: chemistryVideos.slice(idx * 2, idx * 2 + 5).map((v, lIdx) => ({
            lessonTitle: v.title || `রসায়ন ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'রসায়ন',
            subjectSlug: 'chemistry',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[(lIdx + 1) % QURAN_PRESETS.length],
          })),
        },
        {
          subjectName: 'সাধারণ গণিত (Math)',
          subjectSlug: 'math',
          description: 'গণিতের সূত্রাবলী, সমাধান ও বোর্ড সৃজনশীল প্র্যাকটিস।',
          lessons: mathVideos.slice(idx * 2, idx * 2 + 5).map((v, lIdx) => ({
            lessonTitle: v.title || `গণিত ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'সাধারণ গণিত',
            subjectSlug: 'math',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[(lIdx + 2) % QURAN_PRESETS.length],
          })),
        },
      ]
    } else if ([1044, 1052].includes(courseId)) {
      // 4-Subject Combo: Physics, Chemistry, Math, Higher Math
      courseSubjects = [
        {
          subjectName: 'পদার্থবিজ্ঞান (Physics)',
          subjectSlug: 'physics',
          description: 'পদার্থবিজ্ঞান বেসিক কনসেপ্ট ও গাণিতিক সমস্যা।',
          lessons: physicsVideos.slice(idx * 2, idx * 2 + 4).map((v, lIdx) => ({
            lessonTitle: v.title || `পদার্থবিজ্ঞান ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'পদার্থবিজ্ঞান',
            subjectSlug: 'physics',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[lIdx % QURAN_PRESETS.length],
          })),
        },
        {
          subjectName: 'রসায়ন (Chemistry)',
          subjectSlug: 'chemistry',
          description: 'রসায়নের অধ্যায়ভিত্তিক ব্যাখ্যা ও MCQ/CQ প্রস্তুতি।',
          lessons: chemistryVideos.slice(idx * 2, idx * 2 + 4).map((v, lIdx) => ({
            lessonTitle: v.title || `রসায়ন ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'রসায়ন',
            subjectSlug: 'chemistry',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[(lIdx + 1) % QURAN_PRESETS.length],
          })),
        },
        {
          subjectName: 'সাধারণ গণিত (General Math)',
          subjectSlug: 'math',
          description: 'গণিতের অধ্যায়ভিত্তিক শর্টকাট ও বেসিক পরিষ্কার।',
          lessons: mathVideos.slice(idx * 2, idx * 2 + 4).map((v, lIdx) => ({
            lessonTitle: v.title || `গণিত ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'সাধারণ গণিত',
            subjectSlug: 'math',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[(lIdx + 2) % QURAN_PRESETS.length],
          })),
        },
        {
          subjectName: 'উচ্চতর গণিত (Higher Math)',
          subjectSlug: 'higher-math',
          description: 'উচ্চতর গণিতের জ্যামিতি, ত্রিকোণমিতি ও স্থানাঙ্ক।',
          lessons: hmathVideos.slice(idx * 2, idx * 2 + 4).map((v, lIdx) => ({
            lessonTitle: v.title || `উচ্চতর গণিত ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'উচ্চতর গণিত',
            subjectSlug: 'higher-math',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[(lIdx + 3) % QURAN_PRESETS.length],
          })),
        },
      ]
    } else if (courseId === 2484) {
      // 2-Subject Combo: Physics + Chemistry
      courseSubjects = [
        {
          subjectName: 'পদার্থবিজ্ঞান (Physics)',
          subjectSlug: 'physics',
          description: 'পদার্থবিজ্ঞান লেকচার ও প্র্যাকটিস।',
          lessons: physicsVideos.slice(5, 10).map((v, lIdx) => ({
            lessonTitle: v.title || `পদার্থবিজ্ঞান ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'পদার্থবিজ্ঞান',
            subjectSlug: 'physics',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[lIdx % QURAN_PRESETS.length],
          })),
        },
        {
          subjectName: 'রসায়ন (Chemistry)',
          subjectSlug: 'chemistry',
          description: 'রসায়ন লেকচার ও রিভিশন।',
          lessons: chemistryVideos.slice(5, 10).map((v, lIdx) => ({
            lessonTitle: v.title || `রসায়ন ক্লাস ${lIdx + 1}`,
            moduleName: `অধ্যায় ${lIdx + 1}`,
            subjectName: 'রসায়ন',
            subjectSlug: 'chemistry',
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: lIdx === 0,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[(lIdx + 1) % QURAN_PRESETS.length],
          })),
        },
      ]
    } else {
      // Single Subject Course
      let subName = 'পদার্থবিজ্ঞান (Physics)'
      let subSlug = 'physics'
      let videoPool = physicsVideos

      if (rawTitle.includes('রসায়ন') || rawTitle.includes('রসায়ন') || rawTitle.includes('Chemistry')) {
        subName = 'রসায়ন (Chemistry)'
        subSlug = 'chemistry'
        videoPool = chemistryVideos
      } else if (rawTitle.includes('উচ্চতর')) {
        subName = 'উচ্চতর গণিত (Higher Math)'
        subSlug = 'higher-math'
        videoPool = hmathVideos
      } else if (rawTitle.includes('গণিত') || rawTitle.includes('গনিত') || rawTitle.includes('Math')) {
        subName = 'সাধারণ গণিত (General Math)'
        subSlug = 'math'
        videoPool = mathVideos
      }

      const lessonCount = 6 + (idx % 3)
      const startIndex = (idx * 5) % Math.max(1, videoPool.length - lessonCount)
      const selectedVideos = videoPool.slice(startIndex, startIndex + lessonCount)

      courseSubjects = [
        {
          subjectName: subName,
          subjectSlug: subSlug,
          description: `এই কোর্সের সম্পূর্ণ ${subName} পাঠ্যক্রম।`,
          lessons: selectedVideos.map((v, lIdx) => ({
            lessonTitle: v.title || `ক্লাস ${lIdx + 1}`,
            moduleName: `মডিউল ${Math.floor(lIdx / 3) + 1}`,
            subjectName: subName.split(' ')[0],
            subjectSlug: subSlug,
            duration: v.duration && v.duration !== '0:0:0' ? v.duration : '45m',
            order: lIdx + 1,
            isFreePreview: isFree || lIdx <= 1,
            youtubeVideoIdOrUrl: v.video_url || 'https://youtu.be/rnshfIpWurk',
            quranVersePreset: QURAN_PRESETS[lIdx % QURAN_PRESETS.length],
          })),
        },
      ]
    }

    // Flatten all lessons across subjects for backward compatibility
    const allLessons = courseSubjects.flatMap((s) => s.lessons)

    const courseData = {
      title: rawTitle,
      slug,
      priceInBDT: price,
      priceInBDTEnabled: true,
      thumbnail: thumbnailId,
      gallery: [{ image: thumbnailId }],
      _status: 'published' as const,
      inventory: 0,
      meta: {
        title: rawTitle,
        description: cleanText(raw.excerpt?.rendered || raw.content?.rendered || rawTitle).slice(0, 160),
      },
      subjects: courseSubjects,
      lessons: allLessons,
    }

    // Check if course already exists by slug
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'products',
        id: existing.docs[0].id,
        data: courseData as any,
      })
      updatedCount++
      console.log(`  🔄 [${idx + 1}/${rawCourses.length}] Updated: "${rawTitle}" -> ৳${price} (${courseSubjects.length} subjects, ${allLessons.length} lessons)`)
    } else {
      await payload.create({
        collection: 'products',
        data: courseData as any,
      })
      createdCount++
      console.log(`  ✅ [${idx + 1}/${rawCourses.length}] Created: "${rawTitle}" -> ৳${price} (${courseSubjects.length} subjects, ${allLessons.length} lessons)`)
    }
  }

  console.log('\n======================================================')
  console.log(`🎉 SEEDING COMPLETE!`)
  console.log(`   - Created: ${createdCount}`)
  console.log(`   - Updated: ${updatedCount}`)
  console.log(`   - Free Courses (৳ 0): ${FREE_COURSE_IDS.size}`)
  console.log(`   - Paid Courses (৳ 2): ${rawCourses.length - FREE_COURSE_IDS.size}`)
  console.log('======================================================')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})

