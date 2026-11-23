const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

async function syncCourses() {
  const dbUri = process.env.DATABASE_URL || process.env.DATABASE_URI || process.env.MONGODB_URI;
  if (!dbUri) {
    console.error('DATABASE_URL is not set!');
    process.exit(1);
  }

  console.log('Connecting to database:', dbUri.split('@')[1] || dbUri);
  const client = new MongoClient(dbUri);
  await client.connect();
  const db = client.db();

  console.log('Connected to MongoDB database:', db.databaseName);

  // Collections
  const mediaCol = db.collection('media');
  const teachersCol = db.collection('teachers');
  const categoriesCol = db.collection('categories');
  const subjectsCol = db.collection('subjects');
  const productsCol = db.collection('products');

  // Load downloaded images map
  const imageMapFile = path.resolve(__dirname, 'downloaded-images-map.json');
  let imageMap = {};
  if (fs.existsSync(imageMapFile)) {
    imageMap = JSON.parse(fs.readFileSync(imageMapFile, 'utf8'));
  }

  // Load full curriculum data
  const fcFile = path.resolve(__dirname, '../data/full_curriculum.json');
  const fc = JSON.parse(fs.readFileSync(fcFile, 'utf8'));
  const publishedItems = fc.filter((x) => x.course?.status === 'publish');

  console.log(`Processing ${publishedItems.length} published courses...`);

  // 1. Create / Ensure Media Documents for local images
  const mediaIdMap = {};
  for (const [origUrl, localPath] of Object.entries(imageMap)) {
    const filename = path.basename(localPath);
    let mediaDoc = await mediaCol.findOne({
      $or: [{ filename: filename }, { url: localPath }, { externalUrl: origUrl }],
    });

    if (!mediaDoc) {
      const now = new Date();
      const insertRes = await mediaCol.insertOne({
        alt: filename.replace(/[-_.]/g, ' '),
        filename: filename,
        url: localPath,
        externalUrl: origUrl,
        createdAt: now,
        updatedAt: now,
      });
      mediaIdMap[origUrl] = insertRes.insertedId;
      mediaIdMap[localPath] = insertRes.insertedId;
      console.log(`Created media: ${filename} -> ${insertRes.insertedId}`);
    } else {
      mediaIdMap[origUrl] = mediaDoc._id;
      mediaIdMap[localPath] = mediaDoc._id;
      // Ensure local url is set
      await mediaCol.updateOne(
        { _id: mediaDoc._id },
        { $set: { url: localPath, filename: filename, updatedAt: new Date() } }
      );
    }
  }

  // 2. Ensure Teacher "দেলোয়ার স্যার"
  let teacher = await teachersCol.findOne({
    $or: [
      { name: { $regex: 'দেলোয়ার', $options: 'i' } },
      { _id: new ObjectId('6afee7a3bd88e77d247fb929') },
    ],
  });

  let teacherId;
  const teacherImageId =
    mediaIdMap['/media/course-2195-ssc-26-physics.png'] ||
    new ObjectId('6afee797bd88e77d247fb8fa');

  if (!teacher) {
    const now = new Date();
    const insertRes = await teachersCol.insertOne({
      name: 'দেলোয়ার স্যার',
      designation: 'প্রধান শিক্ষক ও প্রতিষ্ঠাতা, ইউনিক টিচিং মেথড',
      bio: 'দীর্ঘ ২০+ বছরের শিক্ষকতার অভিজ্ঞতায় হাজারো শিক্ষার্থীকে সফলতার শীর্ষে নিয়ে যাওয়া অভিজ্ঞ শিক্ষাবিদ।',
      isActive: true,
      image: teacherImageId,
      createdAt: now,
      updatedAt: now,
    });
    teacherId = insertRes.insertedId;
    console.log(`Created Teacher: দেলোয়ার স্যার -> ${teacherId}`);
  } else {
    teacherId = teacher._id;
    await teachersCol.updateOne(
      { _id: teacher._id },
      {
        $set: {
          name: 'দেলোয়ার স্যার',
          designation: 'প্রধান শিক্ষক ও প্রতিষ্ঠাতা, ইউনিক টিচিং মেথড',
          image: teacher.image || teacherImageId,
          isActive: true,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`Found Teacher: দেলোয়ার স্যার -> ${teacherId}`);
  }

  // 3. Ensure Categories
  const categoryDefs = [
    { title: 'SSC 2027', slug: 'ssc-2027' },
    { title: 'SSC 2028', slug: 'ssc-2028' },
    { title: 'কম্বো কোর্স', slug: 'combo-courses' },
    { title: 'ফ্রি কোর্স', slug: 'free-courses' },
  ];

  const categoryMap = {};
  for (const cat of categoryDefs) {
    let catDoc = await categoriesCol.findOne({
      $or: [{ slug: cat.slug }, { title: cat.title }],
    });

    if (!catDoc) {
      const now = new Date();
      const insertRes = await categoriesCol.insertOne({
        title: cat.title,
        slug: cat.slug,
        createdAt: now,
        updatedAt: now,
      });
      categoryMap[cat.slug] = insertRes.insertedId;
      console.log(`Created Category: ${cat.title} (${cat.slug}) -> ${insertRes.insertedId}`);
    } else {
      categoryMap[cat.slug] = catDoc._id;
      await categoriesCol.updateOne(
        { _id: catDoc._id },
        { $set: { title: cat.title, slug: cat.slug, updatedAt: new Date() } }
      );
      console.log(`Found Category: ${cat.title} (${cat.slug}) -> ${catDoc._id}`);
    }
  }

  // 4. Create Master Subjects in `subjects` collection
  const subjectDefs = [
    {
      name: 'পদার্থবিজ্ঞান',
      slug: 'physics',
      code: 'PHY-SSC',
      description: 'এসএসসি পদার্থবিজ্ঞান: বলবিদ্যা, আলো, বিদ্যুৎ ও আধুনিক পদার্থবিজ্ঞানের পূর্ণাঙ্গ সিলেবাস।',
      order: 1,
    },
    {
      name: 'রসায়ন',
      slug: 'chemistry',
      code: 'CHEM-SSC',
      description: 'এসএসসি রসায়ন: পদার্থের অবস্থা, রাসায়নিক বন্ধন, বিক্রিয়া ও পর্যায় সারণীর বেসিক টু অ্যাডভান্সড।',
      order: 2,
    },
    {
      name: 'সাধারণ গণিত',
      slug: 'math',
      code: 'GEN-MATH-SSC',
      description: 'এসএসসি সাধারণ গণিত: বীজগণিত, জ্যামিতি, পরিমিতি ও ত্রিকোণমিতির কনসেপচুয়াল সমাধান।',
      order: 3,
    },
    {
      name: 'উচ্চতর গণিত',
      slug: 'higher-math',
      code: 'H-MATH-SSC',
      description: 'এসএসসি উচ্চতর গণিত: সেট, স্থানাঙ্ক জ্যামিতি, সম্ভাবনা ও ক্যালকুলাসের ভিত্তি।',
      order: 4,
    },
    {
      name: 'সাধারণ বিষয়',
      slug: 'general',
      code: 'GEN-SSC',
      description: 'রিভিশন, মডেল টেস্ট, গাইডলাইন ও ফেসবুক গ্রুপের নির্দেশিকা।',
      order: 5,
    },
  ];

  const subjectMap = {};
  for (const sub of subjectDefs) {
    let subDoc = await subjectsCol.findOne({ slug: sub.slug });
    if (!subDoc) {
      const now = new Date();
      const insertRes = await subjectsCol.insertOne({
        name: sub.name,
        slug: sub.slug,
        code: sub.code,
        description: sub.description,
        order: sub.order,
        lessons: [],
        createdAt: now,
        updatedAt: now,
      });
      subjectMap[sub.slug] = insertRes.insertedId;
      console.log(`Created Subject: ${sub.name} (${sub.slug}) -> ${insertRes.insertedId}`);
    } else {
      subjectMap[sub.slug] = subDoc._id;
      await subjectsCol.updateOne(
        { _id: subDoc._id },
        {
          $set: {
            name: sub.name,
            code: sub.code,
            description: sub.description,
            order: sub.order,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`Found Subject: ${sub.name} (${sub.slug}) -> ${subDoc._id}`);
    }
  }

  // 5. Helper function to map course title to relevant subjects
  function getSubjectsForCourse(title) {
    const lower = title.toLowerCase();
    const subs = [];
    const isCombo = lower.includes('কম্বো') || lower.includes('combo');

    if (isCombo) {
      if (lower.includes('4-sub') || lower.includes('উচ্চতর গণিত') || lower.includes('৪ বিষয়')) {
        subs.push('physics', 'chemistry', 'math', 'higher-math');
      } else if (lower.includes('3-sub') || (lower.includes('পদার্থবিজ্ঞান') && lower.includes('রসায়ন') && lower.includes('গণিত'))) {
        subs.push('physics', 'chemistry', 'math');
      } else {
        subs.push('physics', 'chemistry');
      }
    } else {
      if (lower.includes('উচ্চতর গণিত') || lower.includes('hmath')) {
        subs.push('higher-math');
      } else if (lower.includes('রসায়ন') || lower.includes('রসায়ন') || lower.includes('chemistry')) {
        subs.push('chemistry');
      } else if (lower.includes('পদার্থবিজ্ঞান') || lower.includes('physics')) {
        subs.push('physics');
      } else if (lower.includes('গণিত') || lower.includes('গনিত') || lower.includes('math')) {
        subs.push('math');
      } else {
        subs.push('general');
      }
    }
    return subs;
  }

  // 6. Helper function to map course title to categories
  function getCategoriesForCourse(title, price) {
    const cats = [];
    const lower = title.toLowerCase();

    if (price === 0 || lower.includes('free') || lower.includes('ফ্রি')) {
      cats.push(categoryMap['free-courses']);
    }
    if (lower.includes('কম্বো') || lower.includes('combo')) {
      cats.push(categoryMap['combo-courses']);
    }
    if (lower.includes('২৭') || lower.includes('27') || lower.includes('2027')) {
      cats.push(categoryMap['ssc-2027']);
    }
    if (lower.includes('২৮') || lower.includes('28') || lower.includes('2028')) {
      cats.push(categoryMap['ssc-2028']);
    }
    if (cats.length === 0) {
      cats.push(categoryMap['ssc-2027']);
    }
    return Array.from(new Set(cats.filter(Boolean)));
  }

  // 7. Process each course and build structured Subjects and Lessons
  let createdCount = 0;
  let updatedCount = 0;

  for (const item of publishedItems) {
    const c = item.course;
    const courseId = c.id;
    const title = c.title;

    // Generate safe unique slug
    let cleanSlug = (c.slug || '')
      .toLowerCase()
      .replace(/%[0-9a-f]{2}/gi, '') // Remove percent encoded leftovers
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug || cleanSlug.length < 3) {
      cleanSlug = `course-${courseId}`;
    }

    const price = typeof c.pricing?.price === 'string' ? parseFloat(c.pricing.price) || 0 : (c.pricing?.price || 0);
    const isFree = price === 0;

    // Determine subjects
    const subSlugs = getSubjectsForCourse(title);
    const courseSubjectIds = subSlugs.map((s) => subjectMap[s]).filter(Boolean);

    // Determine categories
    const courseCategoryIds = getCategoriesForCourse(title, price);

    // Resolve local thumbnail
    const origThumbUrl = c.thumbnail?.url;
    const localThumbPath = (origThumbUrl && imageMap[origThumbUrl]) || `/media/course-${courseId}.png`;
    const mediaId = (origThumbUrl && mediaIdMap[origThumbUrl]) || mediaIdMap[localThumbPath];

    // Extract structured lessons from curriculum topics
    const courseLessons = [];
    let lessonIndex = 1;

    (item.curriculum?.topics || []).forEach((topic) => {
      const topicName = topic.title || 'সাধারণ অধ্যায়';
      (topic.lessons || []).forEach((les) => {
        const isPreview = Boolean(les.is_preview || isFree);
        const youtubeUrl = les.video?.youtube_url || '';
        const duration = les.video?.playtime || (les.video?.duration_sec ? `${Math.round(les.video.duration_sec / 60)}m` : '45m');

        // Determine which subject this lesson belongs to
        let lessonSubSlug = subSlugs[0] || 'general';
        const lesTitleLower = (les.title || '').toLowerCase();
        if (subSlugs.length > 1) {
          if (lesTitleLower.includes('রসায়ন') || lesTitleLower.includes('chemistry')) lessonSubSlug = 'chemistry';
          else if (lesTitleLower.includes('পদার্থ') || lesTitleLower.includes('physics')) lessonSubSlug = 'physics';
          else if (lesTitleLower.includes('উচ্চতর') || lesTitleLower.includes('hmath')) lessonSubSlug = 'higher-math';
          else if (lesTitleLower.includes('গণিত') || lesTitleLower.includes('math')) lessonSubSlug = 'math';
        }

        const subMeta = subjectDefs.find((s) => s.slug === lessonSubSlug) || subjectDefs[0];

        // Unique stable lesson ID
        const lessonDocId = `les-${courseId}-${les.id || lessonIndex}`;

        courseLessons.push({
          id: lessonDocId,
          lessonTitle: les.title || `ক্লাস ${lessonIndex}`,
          moduleName: topicName,
          subjectName: subMeta.name,
          subjectSlug: subMeta.slug,
          duration: duration,
          order: lessonIndex,
          isFreePreview: isPreview,
          youtubeVideoIdOrUrl: youtubeUrl,
          hasSlide: false,
          hasNote: false,
        });

        lessonIndex++;
      });
    });

    // Content description
    const rawDesc = c.description || '';
    const cleanDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDesc = cleanDesc.slice(0, 160) || `${title} — ইউনিক টিচিং মেথডের ডিজিটাল ক্লাসরুমে পূর্ণাঙ্গ প্রস্তুতি নিন।`;

    const descriptionRichText = {
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
                type: 'text',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                text: cleanDesc || metaDesc,
                version: 1,
              },
            ],
            direction: 'ltr',
          },
        ],
        direction: 'ltr',
      },
    };

    // Check if course already exists in MongoDB
    const existingCourse = await productsCol.findOne({
      $or: [
        { slug: cleanSlug },
        { title: title },
        { legacyId: courseId },
      ],
    });

    const now = new Date();
    const courseDoc = {
      title,
      slug: cleanSlug,
      legacyId: courseId,
      priceInBDT: price,
      price: price,
      isCourse: true,
      isFree: isFree,
      _status: 'published',
      draft: false,
      teachers: [teacherId],
      categories: courseCategoryIds,
      subjects: courseSubjectIds,
      lessons: courseLessons,
      thumbnail: mediaId || undefined,
      thumbnailUrl: localThumbPath,
      introductoryVideo: (c.intro_video?.youtube_url) || '',
      description: descriptionRichText,
      meta: {
        title: title,
        description: metaDesc,
      },
      updatedAt: now,
    };

    if (!existingCourse) {
      courseDoc.createdAt = now;
      await productsCol.insertOne(courseDoc);
      createdCount++;
      console.log(`+ Created Course: [${courseId}] ${title} (${cleanSlug}) | Lessons: ${courseLessons.length}`);
    } else {
      await productsCol.updateOne(
        { _id: existingCourse._id },
        { $set: courseDoc }
      );
      updatedCount++;
      console.log(`✓ Updated Course: [${courseId}] ${title} (${cleanSlug}) | Lessons: ${courseLessons.length}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Course & Subject Sync Complete!`);
  console.log(`Created: ${createdCount}, Updated: ${updatedCount}, Total: ${publishedItems.length}`);
  console.log(`========================================\n`);

  await client.close();
}

syncCourses().catch((err) => {
  console.error('Fatal Sync Error:', err);
  process.exit(1);
});
