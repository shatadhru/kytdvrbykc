// scripts/repair-courses.js
// Fixes subjects array and lessons array for all products in db.products

const teacher = db.teachers.findOne({ name: /দেলোয়ার/i });
const teacherId = teacher ? teacher._id : new ObjectId('6afee7a3bd88e77d247fb929');

const masterSubjects = db.subjects.find().toArray();
const subMap = {};
masterSubjects.forEach(s => {
  subMap[s.slug] = s;
});

// Also ensure master subjects have proper names if missing
const defaultSubjectNames = {
  'physics': 'পদার্থবিজ্ঞান',
  'chemistry': 'রসায়ন',
  'math': 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  'general': 'সাধারণ বিষয়'
};

Object.keys(defaultSubjectNames).forEach(slug => {
  if (subMap[slug] && (!subMap[slug].name || subMap[slug].name === '')) {
    db.subjects.updateOne({ _id: subMap[slug]._id }, { $set: { name: defaultSubjectNames[slug] } });
    subMap[slug].name = defaultSubjectNames[slug];
  }
});

const products = db.products.find().toArray();
print("Found " + products.length + " products to repair.");

let repaired = 0;

products.forEach(p => {
  const allLessons = [];
  const existingLessons = Array.isArray(p.lessons) ? p.lessons : [];
  
  // Determine subjects for this course
  let subjectSlugs = [];
  if (p.slug && p.slug.includes('physics')) subjectSlugs.push('physics');
  if (p.slug && p.slug.includes('chemistry')) subjectSlugs.push('chemistry');
  if (p.slug && (p.slug.includes('math') || p.slug.includes('gonit'))) subjectSlugs.push('math');
  if (p.slug && p.slug.includes('higher-math')) subjectSlugs.push('higher-math');
  if (p.slug && p.slug.includes('combo')) {
    subjectSlugs = ['physics', 'chemistry', 'math', 'higher-math'];
  }
  
  // If no subject slugs detected from slug, check existing subject refs or titles
  if (subjectSlugs.length === 0) {
    if (p.title && p.title.includes('পদার্থ')) subjectSlugs.push('physics');
    if (p.title && p.title.includes('রসায়ন')) subjectSlugs.push('chemistry');
    if (p.title && p.title.includes('উচ্চতর গণিত')) subjectSlugs.push('higher-math');
    else if (p.title && (p.title.includes('গণিত') || p.title.includes('গনিত'))) subjectSlugs.push('math');
    if (p.title && p.title.includes('কম্বো')) {
      subjectSlugs = ['physics', 'chemistry', 'math', 'higher-math'];
    }
  }
  
  if (subjectSlugs.length === 0) {
    subjectSlugs = ['general'];
  }
  
  // Deduplicate
  subjectSlugs = [...new Set(subjectSlugs)];
  
  // Group lessons by subjectSlug
  const lessonsBySubject = {};
  existingLessons.forEach(l => {
    let sSlug = l.subjectSlug || 'general';
    if (!lessonsBySubject[sSlug]) lessonsBySubject[sSlug] = [];
    lessonsBySubject[sSlug].push(l);
  });
  
  // Build proper subjects array
  const formattedSubjects = subjectSlugs.map(sSlug => {
    const masterSub = subMap[sSlug] || subMap['general'];
    const subName = masterSub ? (masterSub.name || defaultSubjectNames[sSlug] || 'সাধারণ বিষয়') : (defaultSubjectNames[sSlug] || 'সাধারণ বিষয়');
    const subLessonsRaw = lessonsBySubject[sSlug] || (subjectSlugs.length === 1 ? existingLessons : []);
    
    const formattedLessons = subLessonsRaw.map((l, idx) => {
      const lesId = new ObjectId();
      return {
        _id: lesId,
        id: lesId.toHexString(),
        lessonTitle: l.lessonTitle || ('লেকচার ' + (idx + 1)),
        moduleName: l.moduleName || '',
        duration: l.duration || '45m',
        order: idx + 1,
        isFreePreview: !!l.isFreePreview,
        youtubeVideoIdOrUrl: l.youtubeVideoIdOrUrl || '',
        hasSlide: !!l.hasSlide,
        hasNote: !!l.hasNote,
        quranVersePreset: l.quranVersePreset || 'none'
      };
    });
    
    // Add to allLessons
    formattedLessons.forEach(fl => allLessons.push(fl));
    
    const subDocId = new ObjectId();
    return {
      _id: subDocId,
      id: subDocId.toHexString(),
      subjectRef: masterSub ? masterSub._id : null,
      overrideSubjectLessons: false,
      subjectName: subName,
      subjectSlug: sSlug,
      description: subName + ' এর পাঠ্যক্রম ও ভিডিও ক্লাসসমূহ।',
      lessons: formattedLessons
    };
  });
  
  // Ensure top-level lessons also have valid 24-hex string IDs and ObjectIds
  const formattedTopLessons = allLessons.map((l, idx) => {
    const lId = l._id || new ObjectId();
    return {
      _id: lId,
      id: lId.toHexString(),
      lessonTitle: l.lessonTitle,
      moduleName: l.moduleName,
      duration: l.duration,
      order: idx + 1,
      isFreePreview: l.isFreePreview,
      youtubeVideoIdOrUrl: l.youtubeVideoIdOrUrl,
      hasSlide: l.hasSlide,
      hasNote: l.hasNote,
      quranVersePreset: l.quranVersePreset
    };
  });
  
  // Ensure teachers array has teacherId
  let teachers = p.teachers;
  if (!Array.isArray(teachers) || teachers.length === 0) {
    teachers = [teacherId];
  } else {
    teachers = teachers.map(t => (t instanceof ObjectId ? t : new ObjectId(t)));
  }
  
  // Ensure categories array
  let categories = p.categories;
  if (Array.isArray(categories)) {
    categories = categories.map(c => (c instanceof ObjectId ? c : new ObjectId(c)));
  } else {
    categories = [];
  }
  
  // Thumbnail
  let thumbnail = p.thumbnail;
  if (thumbnail && !(thumbnail instanceof ObjectId) && typeof thumbnail === 'string' && thumbnail.length === 24) {
    thumbnail = new ObjectId(thumbnail);
  } else if (!thumbnail || !(thumbnail instanceof ObjectId)) {
    thumbnail = null;
  }
  
  // Update document
  db.products.updateOne(
    { _id: p._id },
    {
      $set: {
        subjects: formattedSubjects,
        lessons: formattedTopLessons,
        teachers: teachers,
        categories: categories,
        thumbnail: thumbnail,
        updatedAt: new Date()
      }
    }
  );
  
  repaired++;
});

print("Successfully repaired " + repaired + " courses with valid subjects, lessons, and ObjectIds.");
