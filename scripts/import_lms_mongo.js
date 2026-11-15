// import_lms_mongo.js - Executes inside mongosh against 'nextload' DB
const fs = require('fs');

print('🚀 Starting MongoDB Direct LMS Import & Sync...');

const DATA_DIR = '/tmp/data';

const COURSE_SLUG_BY_ID = {
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
};

const SUBJECT_KEYWORDS = [
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
];

function detectSubject(title) {
  const lower = (title || '').toLowerCase();
  for (const [kw, name, slug] of SUBJECT_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      return { name, slug };
    }
  }
  return { name: 'সাধারণ পাঠ্যক্রম (General)', slug: 'general' };
}

// 1. Read exported data files
const rawCourses = JSON.parse(fs.readFileSync(`${DATA_DIR}/courses.json`, 'utf8'));
const rawTopics = JSON.parse(fs.readFileSync(`${DATA_DIR}/topics.json`, 'utf8'));
const rawLessons = JSON.parse(fs.readFileSync(`${DATA_DIR}/lessons.json`, 'utf8'));
const rawUsers = JSON.parse(fs.readFileSync(`${DATA_DIR}/users.json`, 'utf8'));
const rawEnrollments = JSON.parse(fs.readFileSync(`${DATA_DIR}/enrollments.json`, 'utf8'));

print(`Loaded: ${rawCourses.length} courses, ${rawTopics.length} topics, ${rawLessons.length} lessons, ${rawUsers.length} users, ${rawEnrollments.length} enrollments.`);

// Map Topics
const topicMap = new Map();
for (const t of rawTopics) {
  topicMap.set(Number(t.id), t);
}

// Map Lessons by Course ID
const lessonsByCourseId = new Map();
for (const l of rawLessons) {
  let cid = Number(l.course_id);
  if (!cid && l.topic_id && topicMap.has(Number(l.topic_id))) {
    cid = Number(topicMap.get(Number(l.topic_id)).course_id);
  }
  if (cid) {
    if (!lessonsByCourseId.has(cid)) lessonsByCourseId.set(cid, []);
    lessonsByCourseId.get(cid).push(l);
  }
}

// -----------------------------------------------------------------------------
// 1. SYNC MEDIA (Thumbnails)
// -----------------------------------------------------------------------------
print('\n--- 1. Syncing Media Thumbnails ---');
const mediaUrlMap = new Map();
db.media.find().forEach((m) => {
  if (m.url) mediaUrlMap.set(m.url, m._id);
  if (m.alt) mediaUrlMap.set(m.alt, m._id);
});

let mediaCreated = 0;
for (const c of rawCourses) {
  const thumbUrl = c.thumbnail && c.thumbnail.url;
  if (!thumbUrl) continue;

  if (!mediaUrlMap.has(thumbUrl) && !mediaUrlMap.has(c.title)) {
    const doc = {
      alt: c.title || 'Course Thumbnail',
      url: thumbUrl,
      externalUrl: thumbUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    };
    const res = db.media.insertOne(doc);
    mediaUrlMap.set(thumbUrl, res.insertedId);
    mediaUrlMap.set(c.title, res.insertedId);
    mediaCreated++;
  } else {
    const existingId = mediaUrlMap.get(thumbUrl) || mediaUrlMap.get(c.title);
    if (existingId) {
      db.media.updateOne(
        { _id: existingId },
        { $set: { externalUrl: thumbUrl, updatedAt: new Date() } }
      );
    }
  }
}
print(`✅ Media thumbnails synced: ${mediaCreated} created, total available: ${mediaUrlMap.size}`);

const fallbackThumbnailId = db.media.findOne()?._id || null;

// -----------------------------------------------------------------------------
// 2. SYNC COURSES & LESSONS
// -----------------------------------------------------------------------------
print('\n--- 2. Syncing Courses & Lessons ---');
const courseIdBySlug = new Map();
const courseIdByWpId = new Map();
db.products.find().forEach((p) => {
  if (p.slug) courseIdBySlug.set(p.slug, p._id);
});

let coursesCreated = 0;
let coursesUpdated = 0;
let totalLessonsAttached = 0;

const validCourses = rawCourses.filter((c) => c.status !== 'trash');

for (const c of validCourses) {
  const wpId = Number(c.id);
  const slug = COURSE_SLUG_BY_ID[wpId] || `course-${wpId}`;
  const title = c.title;
  const introVideoUrl = (c.intro_video && c.intro_video.youtube_url) || '';
  const thumbUrl = c.thumbnail && c.thumbnail.url;
  const thumbnailId = (thumbUrl ? mediaUrlMap.get(thumbUrl) : null) || fallbackThumbnailId;

  const priceNum = parseFloat((c.pricing && (c.pricing.sale_price || c.pricing.price)) || '0') || 0;
  const isFree = priceNum === 0 || [4235, 4271, 4278, 5463, 5547].includes(wpId);
  const price = isFree ? 0 : priceNum;

  const courseLessons = lessonsByCourseId.get(wpId) || [];
  const subjectsMap = new Map();

  const mappedLessons = courseLessons.map((l, idx) => {
    const topicObj = l.topic_id ? topicMap.get(Number(l.topic_id)) : null;
    const moduleName = (topicObj && topicObj.title) || 'সাধারণ পাঠ্যক্রম (General)';
    const subInfo = detectSubject(moduleName !== 'সাধারণ পাঠ্যক্রম (General)' ? moduleName : l.title);

    const ytUrl = (l.video && l.video.youtube_url) || '';
    const duration = (l.video && l.video.playtime) || '45m';
    const noteUrl = (l.attachments && l.attachments[0] && l.attachments[0].url) || (l.class_links_in_content && l.class_links_in_content[0]) || '';
    const slideUrl = (l.attachments && l.attachments[1] && l.attachments[1].url) || '';

    const lessonItem = {
      id: new ObjectId().toHexString(),
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
    };

    if (!subjectsMap.has(subInfo.slug)) {
      subjectsMap.set(subInfo.slug, {
        subjectName: subInfo.name,
        subjectSlug: subInfo.slug,
        lessons: [],
      });
    }
    subjectsMap.get(subInfo.slug).lessons.push(lessonItem);
    return lessonItem;
  });

  const builtSubjects = Array.from(subjectsMap.values());
  totalLessonsAttached += mappedLessons.length;

  const courseDoc = {
    title,
    slug,
    isCourse: true,
    priceInBDT: price,
    price,
    isFree,
    introductoryVideo: introVideoUrl,
    thumbnail: thumbnailId,
    thumbnailUrl: thumbUrl || '',
    _status: 'published',
    meta: {
      title,
      description: (c.description ? c.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 160) : '').trim(),
    },
    subjects: builtSubjects,
    lessons: mappedLessons,
    updatedAt: new Date(),
  };

  const existingId = courseIdBySlug.get(slug);
  if (existingId) {
    db.products.updateOne(
      { _id: existingId },
      { $set: courseDoc }
    );
    courseIdByWpId.set(wpId, existingId);
    coursesUpdated++;
  } else {
    courseDoc.createdAt = new Date();
    courseDoc.__v = 0;
    const res = db.products.insertOne(courseDoc);
    courseIdBySlug.set(slug, res.insertedId);
    courseIdByWpId.set(wpId, res.insertedId);
    coursesCreated++;
  }
}
print(`✅ Courses synced: ${coursesCreated} created, ${coursesUpdated} updated (Total attached lessons: ${totalLessonsAttached})`);

// -----------------------------------------------------------------------------
// 3. SYNC USERS
// -----------------------------------------------------------------------------
print('\n--- 3. Syncing Users ---');
const userMongoIdByEmail = new Map();
const wpIdToEmailMap = new Map();

db.users.find().forEach((u) => {
  if (u.email) userMongoIdByEmail.set(u.email.toLowerCase().trim(), u._id);
});

let usersCreated = 0;
for (const u of rawUsers) {
  const email = String(u.email || u.user_email || '').trim().toLowerCase();
  const wpId = Number(u.id);

  if (email && email.includes('@')) {
    wpIdToEmailMap.set(wpId, email);

    if (!userMongoIdByEmail.has(email)) {
      const name = u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || email.split('@')[0];
      const phone = u.phone || '';
      const role = Array.isArray(u.roles) && u.roles.includes('administrator') ? 'admin' : 'user';

      const userDoc = {
        name,
        email,
        phone: phone || undefined,
        role,
        emailVerified: true,
        createdAt: u.registered_at ? new Date(u.registered_at) : new Date(),
        updatedAt: new Date(),
        __v: 0,
      };

      try {
        const res = db.users.insertOne(userDoc);
        userMongoIdByEmail.set(email, res.insertedId);
        usersCreated++;
      } catch (err) {
        const existing = db.users.findOne({ email });
        if (existing) userMongoIdByEmail.set(email, existing._id);
      }
    }
  }
}
print(`✅ Users synced: ${usersCreated} created, total users in DB: ${userMongoIdByEmail.size}`);

// -----------------------------------------------------------------------------
// 4. SYNC ENROLLMENTS
// -----------------------------------------------------------------------------
print('\n--- 4. Syncing Enrollments ---');
const existingEnrollmentKeys = new Set();
db.enrollments.find().forEach((e) => {
  const sId = String(e.student);
  const cId = String(e.course);
  existingEnrollmentKeys.add(`${sId}_${cId}`);
});

let enrollmentsCreated = 0;
for (const en of rawEnrollments) {
  const wpUserId = Number(en.user_id);
  const wpCourseId = Number(en.course_id);

  const studentEmail = en.user_email || wpIdToEmailMap.get(wpUserId);
  if (!studentEmail) continue;

  const studentMongoId = userMongoIdByEmail.get(String(studentEmail).trim().toLowerCase());
  if (!studentMongoId) continue;

  const courseSlug = COURSE_SLUG_BY_ID[wpCourseId] || `course-${wpCourseId}`;
  const courseMongoId = courseIdBySlug.get(courseSlug) || courseIdByWpId.get(wpCourseId);
  if (!courseMongoId) continue;

  const key = `${studentMongoId}_${courseMongoId}`;
  if (existingEnrollmentKeys.has(key)) continue;

  const status = (en.status === 'cancel' || en.status === 'cancelled')
    ? 'revoked'
    : (en.status === 'on-hold' ? 'suspended' : 'active');

  const enrollmentDoc = {
    student: studentMongoId,
    course: courseMongoId,
    status,
    enrolledAt: en.enrolled_at ? new Date(en.enrolled_at) : new Date(),
    completedLessons: [],
    createdAt: en.enrolled_at ? new Date(en.enrolled_at) : new Date(),
    updatedAt: new Date(),
    __v: 0,
  };

  try {
    db.enrollments.insertOne(enrollmentDoc);
    existingEnrollmentKeys.add(key);
    enrollmentsCreated++;
  } catch (err) {
    print(`Error enrolling ${studentEmail}: ` + err);
  }
}
print(`✅ Enrollments synced: ${enrollmentsCreated} created, total in DB: ${existingEnrollmentKeys.size}`);

print('\n=============================================================');
print('🎉 All Courses, Lessons & Enrollments Safely Synchronized!');
print(`📚 Courses in DB: ${db.products.countDocuments({ isCourse: true })}`);
print(`🎬 Lessons attached across courses: ${totalLessonsAttached}`);
print(`👤 Users in DB: ${db.users.countDocuments()}`);
print(`🎟️ Active Enrollments in DB: ${db.enrollments.countDocuments({ status: 'active' })}`);
print(`📊 Total Enrollments in DB: ${db.enrollments.countDocuments()}`);
print('=============================================================\n');

