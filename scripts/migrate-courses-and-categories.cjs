const { MongoClient, ObjectId } = require('mongodb')

async function run() {
  const dbUri = process.env.DATABASE_URL || process.env.MONGODB_URI
  if (!dbUri) {
    console.error('DATABASE_URL is not set!')
    process.exit(1)
  }

  console.log('Connecting to database...')
  const client = new MongoClient(dbUri)
  await client.connect()
  const db = client.db()

  console.log('Successfully connected to MongoDB database:', db.databaseName)

  // 1. Create / Ensure Categories
  const categoriesCol = db.collection('categories')
  const productsCol = db.collection('products')
  const teachersCol = db.collection('teachers')

  const targetCategories = [
    { title: 'SSC 2027', slug: 'ssc-2027' },
    { title: 'SSC 2028', slug: 'ssc-2028' },
    { title: 'কম্বো কোর্স', slug: 'combo-courses' },
    { title: 'ফ্রি কোর্স', slug: 'free-courses' },
  ]

  const categoryMap = {}

  for (const cat of targetCategories) {
    let existing = await categoriesCol.findOne({
      $or: [{ slug: cat.slug }, { title: cat.title }],
    })

    if (!existing) {
      const now = new Date()
      const insertRes = await categoriesCol.insertOne({
        title: cat.title,
        slug: cat.slug,
        createdAt: now,
        updatedAt: now,
      })
      categoryMap[cat.slug] = insertRes.insertedId
      console.log(`Created category: ${cat.title} (${cat.slug}) -> ${insertRes.insertedId}`)
    } else {
      categoryMap[cat.slug] = existing._id
      // Ensure slug and title are properly set
      await categoriesCol.updateOne(
        { _id: existing._id },
        { $set: { title: cat.title, slug: cat.slug, updatedAt: new Date() } }
      )
      console.log(`Found category: ${cat.title} (${cat.slug}) -> ${existing._id}`)
    }
  }

  // 2. Find or Create Teacher "দেলোয়ার স্যার"
  let teacher = await teachersCol.findOne({
    $or: [
      { name: { $regex: 'দেলোয়ার', $options: 'i' } },
      { _id: new ObjectId('6afee7a3bd88e77d247fb929') },
    ],
  })

  let teacherId
  if (!teacher) {
    const now = new Date()
    const insertTeacher = await teachersCol.insertOne({
      name: 'দেলোয়ার স্যার',
      designation: 'প্রধান শিক্ষক ও প্রতিষ্ঠাতা, দেলোয়ার স্যার একাডেমি',
      bio: 'দীর্ঘ ২০+ বছরের শিক্ষকতার অভিজ্ঞতায় হাজারো শিক্ষার্থীকে সফলতার শীর্ষে নিয়ে যাওয়া অভিজ্ঞ শিক্ষাবিদ।',
      isActive: true,
      image: new ObjectId('6afee797bd88e77d247fb8fa'),
      createdAt: now,
      updatedAt: now,
    })
    teacherId = insertTeacher.insertedId
    console.log('Created teacher: দেলোয়ার স্যার ->', teacherId)
  } else {
    teacherId = teacher._id
    // Ensure image is set to the media document if null
    if (!teacher.image) {
      await teachersCol.updateOne(
        { _id: teacher._id },
        {
          $set: {
            image: new ObjectId('6afee797bd88e77d247fb8fa'),
            designation: teacher.designation || 'শিক্ষক ও প্রতিষ্ঠাতা',
            updatedAt: new Date(),
          },
        }
      )
    }
    console.log('Found teacher: দেলোয়ার স্যার ->', teacherId)
  }

  // 3. Analyze and Update Courses
  const allCourses = await productsCol.find({}).toArray()
  console.log(`Found ${allCourses.length} courses to update.`)

  let updatedCount = 0

  for (const course of allCourses) {
    const updates = {}
    const title = course.title || ''

    // (A) Link Delowar Sir as Teacher
    updates.teachers = [teacherId]

    // (B) Publish & Draft status
    updates._status = 'published'
    updates.draft = false

    // (C) Content Section Description from meta.description or title
    const metaDesc = (course.meta && course.meta.description) ? course.meta.description.trim() : ''
    const fallbackDesc = `${title} — ইউনিক টিচিং মেথডের ডিজিটাল ক্লাসরুমে বিষয়ভিত্তিক সকল রেকর্ডেড ক্লাস, অনুশীলন ও মানসম্মত নোটের সাথে পূর্ণাঙ্গ প্রস্তুতি নিন।`
    const finalDescText = metaDesc.length > 10 ? metaDesc : fallbackDesc

    // If description is empty or missing root
    if (!course.description || !course.description.root) {
      updates.description = {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  mode: 'normal',
                  text: finalDescText,
                  type: 'text',
                  style: '',
                  detail: 0,
                  format: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
            },
          ],
          direction: 'ltr',
        },
      }
    }

    // (D) Course Category Analysis
    const assignedCatIds = []
    const is28 = title.includes('২৮') || title.includes('28') || title.includes('২০২৮')
    const is27 = title.includes('২৭') || title.includes('27') || title.includes('২০২৭')
    const isCombo = title.includes('কম্বো') || title.toLowerCase().includes('combo') || title.includes('অল ইন ওয়ান')
    const isFree = (course.priceInBDT === 0 || course.price === 0) || title.includes('ফ্রি') || title.toLowerCase().includes('free')

    if (is28 && categoryMap['ssc-2028']) {
      assignedCatIds.push(categoryMap['ssc-2028'])
    }
    if (is27 && categoryMap['ssc-2027']) {
      assignedCatIds.push(categoryMap['ssc-2027'])
    }
    if (isCombo && categoryMap['combo-courses']) {
      assignedCatIds.push(categoryMap['combo-courses'])
    }
    if (isFree && categoryMap['free-courses']) {
      assignedCatIds.push(categoryMap['free-courses'])
    }

    // Default if no year matched
    if (assignedCatIds.length === 0) {
      assignedCatIds.push(categoryMap['ssc-2028'] || categoryMap['ssc-2027'])
    }

    updates.categories = assignedCatIds

    await productsCol.updateOne(
      { _id: course._id },
      { $set: updates }
    )
    updatedCount++
  }

  console.log(`Successfully updated ${updatedCount} courses with categories, descriptions, and Delowar Sir as teacher.`)
  await client.close()
  console.log('Migration finished successfully!')
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})

