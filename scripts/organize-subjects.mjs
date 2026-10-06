import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const SUBJECTS_DIR = path.join(DATA_DIR, 'subjects');

if (!fs.existsSync(SUBJECTS_DIR)) {
  fs.mkdirSync(SUBJECTS_DIR, { recursive: true });
}

const lessons = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'lessons_with_videos.json'), 'utf-8'));
const courses = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'courses.json'), 'utf-8'));

console.log(`Processing ${lessons.length} total lessons across ${courses.length} courses...`);

function detectSubject(title = '', slug = '', content = '') {
  const text = `${title} ${slug} ${content}`.toLowerCase();

  // Higher Math check first (before general math)
  if (
    text.includes('উচ্চতর গণিত') ||
    text.includes('উচ্চতর গনীত') ||
    text.includes('উচ্চতর') ||
    text.includes('higher-math') ||
    text.includes('higher math') ||
    text.includes('hmath') ||
    text.includes('h_math')
  ) {
    return 'higher_math';
  }

  // Physics check
  if (
    text.includes('পদার্থ') ||
    text.includes('পদার্থবিজ্ঞান') ||
    text.includes('পদার্থবিদ্যা') ||
    text.includes('physics') ||
    text.includes('phy')
  ) {
    return 'physics';
  }

  // Chemistry check
  if (
    text.includes('রসায়ন') ||
    text.includes('রসায়ন') ||
    text.includes('chemistry') ||
    text.includes('chem') ||
    text.includes('chy')
  ) {
    return 'chemistry';
  }

  // General Math check
  if (
    text.includes('গণিত') ||
    text.includes('গনিত') ||
    text.includes('সাধারন গণিত') ||
    text.includes('math') ||
    text.includes('general math')
  ) {
    return 'math';
  }

  return 'other';
}

function normalizeVideoUrl(url = '') {
  if (!url) return '';
  let clean = url.trim();
  // Extract YouTube video ID if applicable
  const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  }
  return clean;
}

const subjects = {
  physics: [],
  chemistry: [],
  math: [],
  higher_math: [],
  other: []
};

// Also create a global map to group duplicate videos across all subjects
const urlToLessonMap = new Map();

lessons.forEach(l => {
  const normUrl = normalizeVideoUrl(l.video?.url);
  const subject = detectSubject(l.title, l.slug, l.content);

  const lessonRecord = {
    lesson_id: l.lesson_id,
    title: l.title,
    slug: l.slug,
    subject,
    status: l.status,
    post_date: l.post_date,
    parent_topic_or_course_id: l.parent_topic_or_course_id,
    video_url: normUrl || l.video?.url || '',
    raw_video_url: l.video?.url || '',
    duration: l.video?.duration || '',
    content: l.content || ''
  };

  subjects[subject].push(lessonRecord);

  // Grouping duplicate videos
  if (normUrl) {
    if (!urlToLessonMap.has(normUrl)) {
      urlToLessonMap.set(normUrl, {
        video_url: normUrl,
        primary_title: l.title,
        duration: l.video?.duration || '',
        subject,
        occurrences_count: 0,
        lesson_instances: []
      });
    }
    const group = urlToLessonMap.get(normUrl);
    group.occurrences_count++;
    group.lesson_instances.push({
      lesson_id: l.lesson_id,
      title: l.title,
      parent_id: l.parent_topic_or_course_id,
      post_date: l.post_date
    });
  }
});

// Function to deduplicate within a subject
function deduplicateSubject(list) {
  const map = new Map();
  list.forEach(item => {
    const key = item.video_url || `title_${item.title.trim()}`;
    if (!map.has(key)) {
      map.set(key, {
        video_url: item.video_url,
        title: item.title,
        duration: item.duration,
        subject: item.subject,
        count: 0,
        lesson_ids: []
      });
    }
    const entry = map.get(key);
    entry.count++;
    entry.lesson_ids.push(item.lesson_id);
  });
  return Array.from(map.values());
}

// Write subject files (both full and deduplicated unique)
const summary = {
  organized_at: new Date().toISOString(),
  total_lessons: lessons.length,
  total_unique_videos: urlToLessonMap.size,
  subjects: {}
};

for (const [subj, list] of Object.entries(subjects)) {
  const uniqueList = deduplicateSubject(list);
  
  fs.writeFileSync(
    path.join(SUBJECTS_DIR, `${subj}_all.json`),
    JSON.stringify(list, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(SUBJECTS_DIR, `${subj}_unique.json`),
    JSON.stringify(uniqueList, null, 2),
    'utf-8'
  );

  summary.subjects[subj] = {
    total_items: list.length,
    unique_items: uniqueList.length
  };

  console.log(`✅ [${subj.toUpperCase()}]: ${list.length} total -> ${uniqueList.length} unique`);
}

// Write master grouped by video file
const allGroupedVideos = Array.from(urlToLessonMap.values()).sort((a, b) => b.occurrences_count - a.occurrences_count);
fs.writeFileSync(
  path.join(SUBJECTS_DIR, 'all_grouped_unique_videos.json'),
  JSON.stringify(allGroupedVideos, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(SUBJECTS_DIR, 'summary.json'),
  JSON.stringify(summary, null, 2),
  'utf-8'
);

console.log('\n======================================================');
console.log(`🎉 Subject Separation & Deduplication Finished!`);
console.log(`📁 Files saved in: data/subjects/`);
console.log('======================================================');
console.log(JSON.stringify(summary, null, 2));
