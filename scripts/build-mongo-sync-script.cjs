const fs = require('fs');
const path = require('path');

const imageMap = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'downloaded-images-map.json'), 'utf8'));
const fc = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/full_curriculum.json'), 'utf8'));
const publishedItems = fc.filter((x) => x.course?.status === 'publish');

const scriptLines = [];

scriptLines.push(`// Standalone MongoDB Migration Script for DelowarSir LMS`);
scriptLines.push(`// Generated at ${new Date().toISOString()}`);
scriptLines.push(``);

// 1. Categories
scriptLines.push(`// 1. Ensure Categories`);
scriptLines.push(`const categories = [`);
scriptLines.push(`  { title: 'SSC 2027', slug: 'ssc-2027' },`);
scriptLines.push(`  { title: 'SSC 2028', slug: 'ssc-2028' },`);
scriptLines.push(`  { title: 'কম্বো কোর্স', slug: 'combo-courses' },`);
scriptLines.push(`  { title: 'ফ্রি কোর্স', slug: 'free-courses' },`);
scriptLines.push(`];`);
scriptLines.push(`const categoryMap = {};`);
scriptLines.push(`for (const cat of categories) {`);
scriptLines.push(`  let existing = db.categories.findOne({ $or: [{ slug: cat.slug }, { title: cat.title }] });`);
scriptLines.push(`  if (!existing) {`);
scriptLines.push(`    const res = db.categories.insertOne({ title: cat.title, slug: cat.slug, createdAt: new Date(), updatedAt: new Date() });`);
scriptLines.push(`    categoryMap[cat.slug] = res.insertedId;`);
scriptLines.push(`    print("Created category: " + cat.title);`);
scriptLines.push(`  } else {`);
scriptLines.push(`    categoryMap[cat.slug] = existing._id;`);
scriptLines.push(`    db.categories.updateOne({ _id: existing._id }, { $set: { title: cat.title, slug: cat.slug, updatedAt: new Date() } });`);
scriptLines.push(`  }`);
scriptLines.push(`}`);
scriptLines.push(``);

// 2. Media Docs for downloaded images
scriptLines.push(`// 2. Ensure Media Documents`);
scriptLines.push(`const mediaMap = {};`);
for (const [origUrl, localPath] of Object.entries(imageMap)) {
  const filename = path.basename(localPath);
  scriptLines.push(`(() => {`);
  scriptLines.push(`  const origUrl = ${JSON.stringify(origUrl)};`);
  scriptLines.push(`  const localPath = ${JSON.stringify(localPath)};`);
  scriptLines.push(`  const filename = ${JSON.stringify(filename)};`);
  scriptLines.push(`  let doc = db.media.findOne({ $or: [{ filename: filename }, { url: localPath }, { externalUrl: origUrl }] });`);
  scriptLines.push(`  if (!doc) {`);
  scriptLines.push(`    const res = db.media.insertOne({ alt: filename, filename: filename, url: localPath, externalUrl: origUrl, createdAt: new Date(), updatedAt: new Date() });`);
  scriptLines.push(`    mediaMap[localPath] = res.insertedId;`);
  scriptLines.push(`    mediaMap[origUrl] = res.insertedId;`);
  scriptLines.push(`  } else {`);
  scriptLines.push(`    mediaMap[localPath] = doc._id;`);
  scriptLines.push(`    mediaMap[origUrl] = doc._id;`);
  scriptLines.push(`    db.media.updateOne({ _id: doc._id }, { $set: { url: localPath, filename: filename, updatedAt: new Date() } });`);
  scriptLines.push(`  }`);
  scriptLines.push(`})();`);
}
scriptLines.push(``);

// 3. Teacher
scriptLines.push(`// 3. Ensure Teacher দেলোয়ার স্যার`);
scriptLines.push(`let teacher = db.teachers.findOne({ $or: [{ name: /দেলোয়ার/i }, { _id: ObjectId('6afee7a3bd88e77d247fb929') }] });`);
scriptLines.push(`let teacherId;`);
scriptLines.push(`let defaultTeacherImage = mediaMap['/media/course-2195-ssc-26-physics.png'] || ObjectId('6afee797bd88e77d247fb8fa');`);
scriptLines.push(`if (!teacher) {`);
scriptLines.push(`  const res = db.teachers.insertOne({ name: 'দেলোয়ার স্যার', designation: 'প্রধান শিক্ষক ও প্রতিষ্ঠাতা, ইউনিক টিচিং মেথড', bio: 'দীর্ঘ ২০+ বছরের শিক্ষকতার অভিজ্ঞতায় হাজারো শিক্ষার্থীকে সফলতার শীর্ষে নিয়ে যাওয়া অভিজ্ঞ শিক্ষাবিদ।', isActive: true, image: defaultTeacherImage, createdAt: new Date(), updatedAt: new Date() });`);
scriptLines.push(`  teacherId = res.insertedId;`);
scriptLines.push(`  print("Created Teacher: দেলোয়ার স্যার -> " + teacherId);`);
scriptLines.push(`} else {`);
scriptLines.push(`  teacherId = teacher._id;`);
scriptLines.push(`  db.teachers.updateOne({ _id: teacher._id }, { $set: { name: 'দেলোয়ার স্যার', designation: 'প্রধান শিক্ষক ও প্রতিষ্ঠাতা, ইউনিক টিচিং মেথড', image: teacher.image || defaultTeacherImage, isActive: true, updatedAt: new Date() } });`);
scriptLines.push(`  print("Found Teacher: দেলোয়ার স্যার -> " + teacherId);`);
scriptLines.push(`}`);
scriptLines.push(``);

// 4. Subjects
scriptLines.push(`// 4. Ensure Subjects`);
scriptLines.push(`const subjectDefs = [`);
scriptLines.push(`  { name: 'পদার্থবিজ্ঞান', slug: 'physics', code: 'PHY-SSC', description: 'এসএসসি পদার্থবিজ্ঞান: বলবিদ্যা, আলো, বিদ্যুৎ ও আধুনিক পদার্থবিজ্ঞানের পূর্ণাঙ্গ সিলেবাস।', order: 1 },`);
scriptLines.push(`  { name: 'রসায়ন', slug: 'chemistry', code: 'CHEM-SSC', description: 'এসএসসি রসায়ন: পদার্থের অবস্থা, রাসায়নিক বন্ধন, বিক্রিয়া ও পর্যায় সারণীর বেসিক টু অ্যাডভান্সড।', order: 2 },`);
scriptLines.push(`  { name: 'সাধারণ গণিত', slug: 'math', code: 'GEN-MATH-SSC', description: 'এসএসসি সাধারণ গণিত: বীজগণিত, জ্যামিতি, পরিমিতি ও ত্রিকোণমিতির কনসেপচুয়াল সমাধান।', order: 3 },`);
scriptLines.push(`  { name: 'উচ্চতর গণিত', slug: 'higher-math', code: 'H-MATH-SSC', description: 'এসএসসি উচ্চতর গণিত: সেট, স্থানাঙ্ক জ্যামিতি, সম্ভাবনা ও ক্যালকুলাসের ভিত্তি।', order: 4 },`);
scriptLines.push(`  { name: 'সাধারণ বিষয়', slug: 'general', code: 'GEN-SSC', description: 'রিভিশন, মডেল টেস্ট, গাইডলাইন ও ফেসবুক গ্রুপের নির্দেশিকা।', order: 5 },`);
scriptLines.push(`];`);
scriptLines.push(`const subjectMap = {};`);
scriptLines.push(`for (const sub of subjectDefs) {`);
scriptLines.push(`  let existing = db.subjects.findOne({ slug: sub.slug });`);
scriptLines.push(`  if (!existing) {`);
scriptLines.push(`    const res = db.subjects.insertOne({ name: sub.name, slug: sub.slug, code: sub.code, description: sub.description, order: sub.order, lessons: [], createdAt: new Date(), updatedAt: new Date() });`);
scriptLines.push(`    subjectMap[sub.slug] = res.insertedId;`);
scriptLines.push(`    print("Created Subject: " + sub.name + " -> " + res.insertedId);`);
scriptLines.push(`  } else {`);
scriptLines.push(`    subjectMap[sub.slug] = existing._id;`);
scriptLines.push(`    db.subjects.updateOne({ _id: existing._id }, { $set: { name: sub.name, code: sub.code, description: sub.description, order: sub.order, updatedAt: new Date() } });`);
scriptLines.push(`  }`);
scriptLines.push(`}`);
scriptLines.push(``);

// 5. Courses Loop
scriptLines.push(`// 5. Courses & Lessons Population`);
scriptLines.push(`let createdCourses = 0;`);
scriptLines.push(`let updatedCourses = 0;`);

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

function getCategorySlugs(title, price) {
  const cats = [];
  const lower = title.toLowerCase();
  if (price === 0 || lower.includes('free') || lower.includes('ফ্রি')) {
    cats.push('free-courses');
  }
  if (lower.includes('কম্বো') || lower.includes('combo')) {
    cats.push('combo-courses');
  }
  if (lower.includes('২৭') || lower.includes('27') || lower.includes('2027')) {
    cats.push('ssc-2027');
  }
  if (lower.includes('২৮') || lower.includes('28') || lower.includes('2028')) {
    cats.push('ssc-2028');
  }
  if (cats.length === 0) {
    cats.push('ssc-2027');
  }
  return Array.from(new Set(cats));
}

for (const item of publishedItems) {
  const c = item.course;
  const courseId = c.id;
  const title = c.title;

  let cleanSlug = (c.slug || '')
    .toLowerCase()
    .replace(/%[0-9a-f]{2}/gi, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleanSlug || cleanSlug.length < 3) {
    cleanSlug = `course-${courseId}`;
  }

  const price = typeof c.pricing?.price === 'string' ? parseFloat(c.pricing.price) || 0 : (c.pricing?.price || 0);
  const isFree = price === 0;

  const subSlugs = getSubjectsForCourse(title);
  const catSlugs = getCategorySlugs(title, price);

  const origThumbUrl = c.thumbnail?.url;
  const localThumbPath = (origThumbUrl && imageMap[origThumbUrl]) || `/media/course-${courseId}.png`;

  // Lessons
  const courseLessons = [];
  let lessonIdx = 1;

  (item.curriculum?.topics || []).forEach((topic) => {
    const topicName = topic.title || 'সাধারণ অধ্যায়';
    (topic.lessons || []).forEach((les) => {
      const isPreview = Boolean(les.is_preview || isFree);
      const youtubeUrl = les.video?.youtube_url || '';
      const duration = les.video?.playtime || (les.video?.duration_sec ? `${Math.round(les.video.duration_sec / 60)}m` : '45m');

      let lessonSubSlug = subSlugs[0] || 'general';
      const lesTitleLower = (les.title || '').toLowerCase();
      if (subSlugs.length > 1) {
        if (lesTitleLower.includes('রসায়ন') || lesTitleLower.includes('chemistry')) lessonSubSlug = 'chemistry';
        else if (lesTitleLower.includes('পদার্থ') || lesTitleLower.includes('physics')) lessonSubSlug = 'physics';
        else if (lesTitleLower.includes('উচ্চতর') || lesTitleLower.includes('hmath')) lessonSubSlug = 'higher-math';
        else if (lesTitleLower.includes('গণিত') || lesTitleLower.includes('math')) lessonSubSlug = 'math';
      }

      courseLessons.push({
        id: `les-${courseId}-${les.id || lessonIdx}`,
        lessonTitle: les.title || `ক্লাস ${lessonIdx}`,
        moduleName: topicName,
        subjectName: lessonSubSlug === 'physics' ? 'পদার্থবিজ্ঞান' : (lessonSubSlug === 'chemistry' ? 'রসায়ন' : (lessonSubSlug === 'higher-math' ? 'উচ্চতর গণিত' : 'সাধারণ গণিত')),
        subjectSlug: lessonSubSlug,
        duration: duration,
        order: lessonIdx,
        isFreePreview: isPreview,
        youtubeVideoIdOrUrl: youtubeUrl,
        hasSlide: false,
        hasNote: false,
      });

      lessonIdx++;
    });
  });

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

  const courseData = {
    title,
    slug: cleanSlug,
    legacyId: courseId,
    priceInBDT: price,
    price: price,
    isCourse: true,
    isFree: isFree,
    _status: 'published',
    draft: false,
    thumbnailUrl: localThumbPath,
    introductoryVideo: (c.intro_video?.youtube_url) || '',
    description: descriptionRichText,
    meta: {
      title: title,
      description: metaDesc,
    },
    lessons: courseLessons,
  };

  scriptLines.push(`(() => {`);
  scriptLines.push(`  const slug = ${JSON.stringify(cleanSlug)};`);
  scriptLines.push(`  const legacyId = ${courseId};`);
  scriptLines.push(`  const title = ${JSON.stringify(title)};`);
  scriptLines.push(`  const subSlugs = ${JSON.stringify(subSlugs)};`);
  scriptLines.push(`  const catSlugs = ${JSON.stringify(catSlugs)};`);
  scriptLines.push(`  const localThumb = ${JSON.stringify(localThumbPath)};`);
  scriptLines.push(`  const mediaId = mediaMap[localThumb] || null;`);
  scriptLines.push(`  const courseSubjects = subSlugs.map(s => subjectMap[s]).filter(Boolean);`);
  scriptLines.push(`  const courseCategories = catSlugs.map(s => categoryMap[s]).filter(Boolean);`);
  scriptLines.push(`  const courseData = ${JSON.stringify(courseData)};`);
  scriptLines.push(`  courseData.teachers = [teacherId];`);
  scriptLines.push(`  courseData.subjects = courseSubjects;`);
  scriptLines.push(`  courseData.categories = courseCategories;`);
  scriptLines.push(`  if (mediaId) courseData.thumbnail = mediaId;`);
  scriptLines.push(`  courseData.updatedAt = new Date();`);
  scriptLines.push(`  let existing = db.products.findOne({ $or: [{ slug: slug }, { title: title }, { legacyId: legacyId }] });`);
  scriptLines.push(`  if (!existing) {`);
  scriptLines.push(`    courseData.createdAt = new Date();`);
  scriptLines.push(`    db.products.insertOne(courseData);`);
  scriptLines.push(`    createdCourses++;`);
  scriptLines.push(`    print("+ Created Course: " + title + " (" + slug + ")");`);
  scriptLines.push(`  } else {`);
  scriptLines.push(`    db.products.updateOne({ _id: existing._id }, { $set: courseData });`);
  scriptLines.push(`    updatedCourses++;`);
  scriptLines.push(`    print("✓ Updated Course: " + title + " (" + slug + ")");`);
  scriptLines.push(`  }`);
  scriptLines.push(`})();`);
}

scriptLines.push(``);
scriptLines.push(`print("\\n=== Sync Finished! Created: " + createdCourses + ", Updated: " + updatedCourses + " ===");`);

fs.writeFileSync(path.resolve(__dirname, 'sync-mongo-remote.js'), scriptLines.join('\n'), 'utf8');
console.log('Successfully generated scripts/sync-mongo-remote.js!');
console.log('File size:', fs.statSync(path.resolve(__dirname, 'sync-mongo-remote.js')).size, 'bytes');
