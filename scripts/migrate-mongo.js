// 1. Ensure Categories
const categories = [
  { title: 'SSC 2027', slug: 'ssc-2027' },
  { title: 'SSC 2028', slug: 'ssc-2028' },
  { title: 'কম্বো কোর্স', slug: 'combo-courses' },
  { title: 'ফ্রি কোর্স', slug: 'free-courses' },
]

const categoryMap = {}

for (const cat of categories) {
  let existing = db.categories.findOne({
    $or: [{ slug: cat.slug }, { title: cat.title }],
  })

  if (!existing) {
    const now = new Date()
    const res = db.categories.insertOne({
      title: cat.title,
      slug: cat.slug,
      createdAt: now,
      updatedAt: now,
    })
    categoryMap[cat.slug] = res.insertedId
    print(`Created category: ${cat.title} (${cat.slug}) -> ${res.insertedId}`)
  } else {
    categoryMap[cat.slug] = existing._id
    db.categories.updateOne(
      { _id: existing._id },
      { $set: { title: cat.title, slug: cat.slug, updatedAt: new Date() } }
    )
    print(`Found category: ${cat.title} (${cat.slug}) -> ${existing._id}`)
  }
}

// 2. Find Teacher "দেলোয়ার স্যার"
let teacher = db.teachers.findOne({
  $or: [
    { name: /দেলোয়ার/i },
    { _id: ObjectId('6afee7a3bd88e77d247fb929') },
  ],
})

let teacherId
if (!teacher) {
  const now = new Date()
  const res = db.teachers.insertOne({
    name: 'দেলোয়ার স্যার',
    designation: 'শিক্ষক ও প্রতিষ্ঠাতা',
    bio: 'দীর্ঘ ২০+ বছরের শিক্ষকতার অভিজ্ঞতায় হাজারো শিক্ষার্থীকে সফলতার শীর্ষে নিয়ে যাওয়া অভিজ্ঞ শিক্ষাবিদ।',
    isActive: true,
    image: ObjectId('6afee797bd88e77d247fb8fa'),
    createdAt: now,
    updatedAt: now,
  })
  teacherId = res.insertedId
  print(`Created teacher: দেলোয়ার স্যার -> ${teacherId}`)
} else {
  teacherId = teacher._id
  if (!teacher.image) {
    db.teachers.updateOne(
      { _id: teacher._id },
      { $set: { image: ObjectId('6afee797bd88e77d247fb8fa'), updatedAt: new Date() } }
    )
  }
  print(`Found teacher: দেলোয়ার স্যার -> ${teacherId}`)
}

// 3. Update Courses
const allCourses = db.products.find({}).toArray()
print(`Found ${allCourses.length} courses to update.`)

let count = 0
for (const course of allCourses) {
  const updates = {}
  const title = course.title || ''

  // Set Delowar Sir as teacher
  updates.teachers = [teacherId]
  updates._status = 'published'
  updates.draft = false

  // Description in Content section (Requirement 13)
  const metaDesc = (course.meta && course.meta.description) ? course.meta.description.trim() : ''
  const fallbackDesc = `${title} — ইউনিক টিচিং মেথডের ডিজিটাল ক্লাসরুমে বিষয়ভিত্তিক সকল রেকর্ডেড ক্লাস, অনুশীলন ও মানসম্মত নোটের সাথে পূর্ণাঙ্গ প্রস্তুতি নিন।`
  const finalDescText = metaDesc.length > 10 ? metaDesc : fallbackDesc

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

  // Categorize
  const assignedCats = []
  const is28 = title.includes('২৮') || title.includes('28') || title.includes('২০২৮')
  const is27 = title.includes('২৭') || title.includes('27') || title.includes('২০২৭')
  const isCombo = title.includes('কম্বো') || title.toLowerCase().includes('combo') || title.includes('অল ইন ওয়ান')
  const isFree = (course.priceInBDT === 0 || course.price === 0) || title.includes('ফ্রি') || title.toLowerCase().includes('free')

  if (is28 && categoryMap['ssc-2028']) assignedCats.push(categoryMap['ssc-2028'])
  if (is27 && categoryMap['ssc-2027']) assignedCats.push(categoryMap['ssc-2027'])
  if (isCombo && categoryMap['combo-courses']) assignedCats.push(categoryMap['combo-courses'])
  if (isFree && categoryMap['free-courses']) assignedCats.push(categoryMap['free-courses'])

  if (assignedCats.length === 0) {
    assignedCats.push(categoryMap['ssc-2028'] || categoryMap['ssc-2027'])
  }

  updates.categories = assignedCats

  db.products.updateOne(
    { _id: course._id },
    { $set: updates }
  )
  count++
}

print(`Successfully updated ${count} courses!`)
