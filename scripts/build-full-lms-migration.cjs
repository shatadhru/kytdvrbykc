const fs = require('fs');
const path = require('path');

const imageMap = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'downloaded-images-map.json'), 'utf8'));
const fc = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/full_curriculum.json'), 'utf8'));
const users = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/users.json'), 'utf8'));
const enrollments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/enrollments.json'), 'utf8'));

// Filter courses: publish or has lessons
const validCourses = fc.filter((x) => {
  const status = x.course?.status;
  const topics = x.curriculum?.topics || [];
  const lessonCount = topics.reduce((acc, t) => acc + (t.lessons?.length || 0), 0);
  return (status === 'publish' || lessonCount > 0) && x.course?.title && !x.course.title.toLowerCase().includes('new course');
});

console.log(`Processing ${validCourses.length} valid courses, ${users.length} users, ${enrollments.length} enrollments`);

function htmlToLexicalRichText(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return {
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
            children: [{ type: 'text', format: 0, detail: 0, mode: 'normal', style: '', text: 'কোর্সের বিস্তারিত তথ্য শীঘ্রই যুক্ত করা হবে।', version: 1 }],
            direction: 'ltr',
          },
        ],
        direction: 'ltr',
      },
    };
  }

  // Split HTML into blocks by tags like <p>, <h1>, <h2>, <h3>, <li>, <br/>
  const cleanBlocks = rawHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h1|h2|h3|h4|h5|h6|li|tr|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (cleanBlocks.length === 0) {
    cleanBlocks.push('কোর্সের বিস্তারিত তথ্য শীঘ্রই যুক্ত করা হবে।');
  }

  const children = cleanBlocks.map((block) => ({
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
        text: block,
        version: 1,
      },
    ],
    direction: 'ltr',
  }));

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: 'ltr',
    },
  };
}

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

const lines = [];

lines.push(`// ==============================================================`);
lines.push(`// Full LMS Migration Script: Courses, Curriculum, Users & Enrollments`);
lines.push(`// Generated: ${new Date().toISOString()}`);
lines.push(`// ==============================================================`);
lines.push(``);

// 1. Categories
lines.push(`print(">>> 1. Ensuring Categories...");`);
lines.push(`const categories = [`);
lines.push(`  { title: 'SSC 2027', slug: 'ssc-2027' },`);
lines.push(`  { title: 'SSC 2028', slug: 'ssc-2028' },`);
lines.push(`  { title: 'কম্বো কোর্স', slug: 'combo-courses' },`);
lines.push(`  { title: 'ফ্রি কোর্স', slug: 'free-courses' },`);
lines.push(`];`);
lines.push(`const categoryMap = {};`);
lines.push(`for (const cat of categories) {`);
lines.push(`  let existing = db.categories.findOne({ $or: [{ slug: cat.slug }, { title: cat.title }] });`);
lines.push(`  if (!existing) {`);
lines.push(`    const res = db.categories.insertOne({ title: cat.title, slug: cat.slug, createdAt: new Date(), updatedAt: new Date() });`);
lines.push(`    categoryMap[cat.slug] = res.insertedId;`);
lines.push(`  } else {`);
lines.push(`    categoryMap[cat.slug] = existing._id;`);
lines.push(`    db.categories.updateOne({ _id: existing._id }, { $set: { title: cat.title, slug: cat.slug, updatedAt: new Date() } });`);
lines.push(`  }`);
lines.push(`}`);
lines.push(``);

// 2. Media Docs
lines.push(`print(">>> 2. Ensuring Media Images...");`);
lines.push(`const mediaMap = {};`);
for (const [origUrl, localPath] of Object.entries(imageMap)) {
  const filename = path.basename(localPath);
  lines.push(`(() => {`);
  lines.push(`  const origUrl = ${JSON.stringify(origUrl)};`);
  lines.push(`  const localPath = ${JSON.stringify(localPath)};`);
  lines.push(`  const filename = ${JSON.stringify(filename)};`);
  lines.push(`  let doc = db.media.findOne({ $or: [{ filename: filename }, { url: localPath }, { externalUrl: origUrl }] });`);
  lines.push(`  if (!doc) {`);
  lines.push(`    const res = db.media.insertOne({ alt: filename, filename: filename, url: localPath, externalUrl: origUrl, createdAt: new Date(), updatedAt: new Date() });`);
  lines.push(`    mediaMap[localPath] = res.insertedId;`);
  lines.push(`    mediaMap[origUrl] = res.insertedId;`);
  lines.push(`  } else {`);
  lines.push(`    mediaMap[localPath] = doc._id;`);
  lines.push(`    mediaMap[origUrl] = doc._id;`);
  lines.push(`    db.media.updateOne({ _id: doc._id }, { $set: { url: localPath, filename: filename, updatedAt: new Date() } });`);
  lines.push(`  }`);
  lines.push(`})();`);
}
lines.push(``);

// 3. Teacher Delowar Sir
lines.push(`print(">>> 3. Ensuring Teacher দেলোয়ার স্যার...");`);
lines.push(`let defaultTeacherImage = mediaMap['/media/course-2195-ssc-26-physics.png'] || ObjectId('6afee797bd88e77d247fb8fa');`);
lines.push(`let teacher = db.teachers.findOne({ $or: [{ name: /দেলোয়ার/i }, { _id: ObjectId('6afee7a3bd88e77d247fb929') }] });`);
lines.push(`let teacherId;`);
lines.push(`if (!teacher) {`);
lines.push(`  const res = db.teachers.insertOne({ _id: ObjectId('6afee7a3bd88e77d247fb929'), name: 'দেলোয়ার স্যার', designation: 'প্রধান শিক্ষক ও প্রতিষ্ঠাতা, ইউনিক টিচিং মেথড', bio: 'দীর্ঘ ২০+ বছরের শিক্ষকতার অভিজ্ঞতায় হাজারো শিক্ষার্থীকে সফলতার শীর্ষে নিয়ে যাওয়া অভিজ্ঞ শিক্ষাবিদ।', isActive: true, image: defaultTeacherImage, createdAt: new Date(), updatedAt: new Date() });`);
lines.push(`  teacherId = res.insertedId;`);
lines.push(`} else {`);
lines.push(`  teacherId = teacher._id;`);
lines.push(`  db.teachers.updateOne({ _id: teacher._id }, { $set: { name: 'দেলোয়ার স্যার', designation: 'প্রধান শিক্ষক ও প্রতিষ্ঠাতা, ইউনিক টিচিং মেথড', image: teacher.image || defaultTeacherImage, isActive: true, updatedAt: new Date() } });`);
lines.push(`}`);
lines.push(``);

// 4. Subjects
lines.push(`print(">>> 4. Ensuring Subjects...");`);
lines.push(`const subjectDefs = [`);
lines.push(`  { name: 'পদার্থবিজ্ঞান', slug: 'physics', code: 'PHY-SSC', description: 'এসএসসি পদার্থবিজ্ঞান: বলবিদ্যা, আলো, বিদ্যুৎ ও আধুনিক পদার্থবিজ্ঞানের পূর্ণাঙ্গ সিলেবাস।', order: 1 },`);
lines.push(`  { name: 'রসায়ন', slug: 'chemistry', code: 'CHEM-SSC', description: 'এসএসসি রসায়ন: পদার্থের অবস্থা, রাসায়নিক বন্ধন, বিক্রিয়া ও পর্যায় সারণীর বেসিক টু অ্যাডভান্সড।', order: 2 },`);
lines.push(`  { name: 'সাধারণ গণিত', slug: 'math', code: 'GEN-MATH-SSC', description: 'এসএসসি সাধারণ গণিত: বীজগণিত, জ্যামিতি, পরিমিতি ও ত্রিকোণমিতির কনসেপচুয়াল সমাধান।', order: 3 },`);
lines.push(`  { name: 'উচ্চতর গণিত', slug: 'higher-math', code: 'H-MATH-SSC', description: 'এসএসসি উচ্চতর গণিত: সেট, স্থানাঙ্ক জ্যামিতি, সম্ভাবনা ও ক্যালকুলাসের ভিত্তি।', order: 4 },`);
lines.push(`  { name: 'সাধারণ বিষয়', slug: 'general', code: 'GEN-SSC', description: 'রিভিশন, মডেল টেস্ট, গাইডলাইন ও ফেসবুক গ্রুপের নির্দেশিকা।', order: 5 },`);
lines.push(`];`);
lines.push(`const subjectMap = {};`);
lines.push(`for (const sub of subjectDefs) {`);
lines.push(`  let existing = db.subjects.findOne({ slug: sub.slug });`);
lines.push(`  if (!existing) {`);
lines.push(`    const res = db.subjects.insertOne({ name: sub.name, slug: sub.slug, code: sub.code, description: sub.description, order: sub.order, lessons: [], createdAt: new Date(), updatedAt: new Date() });`);
lines.push(`    subjectMap[sub.slug] = res.insertedId;`);
lines.push(`  } else {`);
lines.push(`    subjectMap[sub.slug] = existing._id;`);
lines.push(`    db.subjects.updateOne({ _id: existing._id }, { $set: { name: sub.name, code: sub.code, description: sub.description, order: sub.order, updatedAt: new Date() } });`);
lines.push(`  }`);
lines.push(`}`);
lines.push(``);

// 5. Courses Loop
lines.push(`print(">>> 5. Migrating Courses & Full Curriculum...");`);
lines.push(`let createdCourses = 0;`);
lines.push(`let updatedCourses = 0;`);

for (const item of validCourses) {
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
  const cleanPlainText = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const metaDesc = cleanPlainText.slice(0, 160) || `${title} — ইউনিক টিচিং মেথডের ডিজিটাল ক্লাসরুমে পূর্ণাঙ্গ প্রস্তুতি নিন।`;
  const descriptionRichText = htmlToLexicalRichText(rawDesc);

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

  lines.push(`(() => {`);
  lines.push(`  const slug = ${JSON.stringify(cleanSlug)};`);
  lines.push(`  const legacyId = ${courseId};`);
  lines.push(`  const title = ${JSON.stringify(title)};`);
  lines.push(`  const subSlugs = ${JSON.stringify(subSlugs)};`);
  lines.push(`  const catSlugs = ${JSON.stringify(catSlugs)};`);
  lines.push(`  const localThumb = ${JSON.stringify(localThumbPath)};`);
  lines.push(`  const mediaId = mediaMap[localThumb] || null;`);
  lines.push(`  const courseSubjects = subSlugs.map(s => subjectMap[s]).filter(Boolean);`);
  lines.push(`  const courseCategories = catSlugs.map(s => categoryMap[s]).filter(Boolean);`);
  lines.push(`  const courseData = ${JSON.stringify(courseData)};`);
  lines.push(`  courseData.teachers = [teacherId];`);
  lines.push(`  courseData.subjects = courseSubjects;`);
  lines.push(`  courseData.categories = courseCategories;`);
  lines.push(`  if (mediaId) courseData.thumbnail = mediaId;`);
  lines.push(`  courseData.updatedAt = new Date();`);
  lines.push(`  let existing = db.products.findOne({ $or: [{ slug: slug }, { title: title }, { legacyId: legacyId }] });`);
  lines.push(`  if (!existing) {`);
  lines.push(`    courseData.createdAt = new Date();`);
  lines.push(`    db.products.insertOne(courseData);`);
  lines.push(`    createdCourses++;`);
  lines.push(`  } else {`);
  lines.push(`    db.products.updateOne({ _id: existing._id }, { $set: courseData });`);
  lines.push(`    updatedCourses++;`);
  lines.push(`  }`);
  lines.push(`})();`);
}

lines.push(`print("Courses migrated: Created " + createdCourses + ", Updated " + updatedCourses);`);
lines.push(``);

// 6. Users Migration
lines.push(`print(">>> 6. Ensuring Students & Users...");`);
lines.push(`const userMap = {};`);
lines.push(`db.users.find({}, { _id: 1, email: 1 }).forEach(u => {`);
lines.push(`  if (u.email) userMap[u.email.toLowerCase().trim()] = u._id;`);
lines.push(`});`);
lines.push(``);

// Chunk users to avoid huge payloads
const rawUsersData = users.map((u) => {
  const em = (u.email || '').toLowerCase().trim();
  const name = u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Student';
  const isAdmin = Array.isArray(u.roles) && u.roles.includes('administrator');
  return {
    email: em,
    name,
    phone: u.phone || '',
    role: isAdmin ? 'admin' : 'user',
    registeredAt: u.registered_at || null,
  };
}).filter((u) => u.email.includes('@'));

lines.push(`const usersList = ${JSON.stringify(rawUsersData)};`);
lines.push(`let newUsersCount = 0;`);
lines.push(`const bulkUsers = [];`);
lines.push(`for (const u of usersList) {`);
lines.push(`  if (!userMap[u.email]) {`);
lines.push(`    bulkUsers.push({`);
lines.push(`      email: u.email,`);
lines.push(`      name: u.name,`);
lines.push(`      phone: u.phone,`);
lines.push(`      role: u.role,`);
lines.push(`      emailVerified: false,`);
lines.push(`      createdAt: u.registeredAt ? new Date(u.registeredAt) : new Date(),`);
lines.push(`      updatedAt: new Date(),`);
lines.push(`    });`);
lines.push(`  }`);
lines.push(`}`);
lines.push(`if (bulkUsers.length > 0) {`);
lines.push(`  const insertRes = db.users.insertMany(bulkUsers);`);
lines.push(`  newUsersCount = bulkUsers.length;`);
lines.push(`  db.users.find({}, { _id: 1, email: 1 }).forEach(u => {`);
lines.push(`    if (u.email) userMap[u.email.toLowerCase().trim()] = u._id;`);
lines.push(`  });`);
lines.push(`}`);
lines.push(`print("Users synced: New users added: " + newUsersCount + ", Total in map: " + Object.keys(userMap).length);`);
lines.push(``);

// 7. Enrollments Migration
lines.push(`print(">>> 7. Migrating Student Enrollments...");`);
lines.push(`const productMap = {};`);
lines.push(`db.products.find({}, { _id: 1, legacyId: 1, title: 1 }).forEach(p => {`);
lines.push(`  if (p.legacyId) productMap[p.legacyId] = p._id;`);
lines.push(`  if (p.title) productMap[p.title.trim()] = p._id;`);
lines.push(`});`);
lines.push(``);
lines.push(`const existingEnr = new Set();`);
lines.push(`db.enrollments.find({}, { student: 1, course: 1 }).forEach(e => {`);
lines.push(`  if (e.student && e.course) {`);
lines.push(`    existingEnr.add(e.student.toString() + '_' + e.course.toString());`);
lines.push(`  }`);
lines.push(`});`);
lines.push(``);

const rawEnrData = enrollments.map((e) => ({
  email: (e.user_email || '').toLowerCase().trim(),
  courseId: e.course_id,
  courseTitle: e.course_title || '',
  enrolledAt: e.enrolled_at || null,
})).filter((e) => e.email && e.courseId);

lines.push(`const enrollmentsList = ${JSON.stringify(rawEnrData)};`);
lines.push(`const bulkEnr = [];`);
lines.push(`let skippedEnr = 0;`);
lines.push(`for (const enr of enrollmentsList) {`);
lines.push(`  const studentId = userMap[enr.email];`);
lines.push(`  const courseId = productMap[enr.courseId] || productMap[enr.courseTitle.trim()];`);
lines.push(`  if (!studentId || !courseId) {`);
lines.push(`    skippedEnr++;`);
lines.push(`    continue;`);
lines.push(`  }`);
lines.push(`  const key = studentId.toString() + '_' + courseId.toString();`);
lines.push(`  if (!existingEnr.has(key)) {`);
lines.push(`    existingEnr.add(key);`);
lines.push(`    bulkEnr.push({`);
lines.push(`      student: studentId,`);
lines.push(`      course: courseId,`);
lines.push(`      status: 'active',`);
lines.push(`      completedLessons: [],`);
lines.push(`      enrolledAt: enr.enrolledAt ? new Date(enr.enrolledAt) : new Date(),`);
lines.push(`      createdAt: enr.enrolledAt ? new Date(enr.enrolledAt) : new Date(),`);
lines.push(`      updatedAt: new Date(),`);
lines.push(`    });`);
lines.push(`  }`);
lines.push(`}`);
lines.push(`if (bulkEnr.length > 0) {`);
lines.push(`  db.enrollments.insertMany(bulkEnr);`);
lines.push(`}`);
lines.push(`print("Enrollments synced: Inserted " + bulkEnr.length + ", Skipped (unmatched or exists): " + skippedEnr + ", Total now: " + db.enrollments.countDocuments());`);
lines.push(``);
lines.push(`print("\\n=== MIGRATION COMPLETED SUCCESSFULLY! ===");`);

const outPath = path.resolve(__dirname, 'run-full-migration.js');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Generated:', outPath);
console.log('Size:', (fs.statSync(outPath).size / 1024).toFixed(2), 'KB');
