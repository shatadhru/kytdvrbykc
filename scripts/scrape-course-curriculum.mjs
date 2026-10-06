import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('data/courses.json', 'utf-8'));

async function inspectCourse(course) {
  try {
    const res = await fetch(course.link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await res.text();
    
    // Check for youtube / vimeo / iframe embeds
    const iframes = html.match(/<iframe[^>]+src=["']([^"']+)["']/gi) || [];
    const videos = html.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)\/[^\s"'<>]+/gi) || [];
    const lessonLinks = html.match(/href=["'](https?:\/\/utmeducation\.com\/lessons\/[^"']+)["']/gi) || [];
    const topicMatches = html.match(/tutor-topics-title[^>]*>([^<]+)</gi) || [];

    console.log(`\n📚 [Course ${course.id}] ${course.title?.rendered}`);
    console.log(`   🔗 URL: ${course.link}`);
    console.log(`   🎬 Videos found: ${videos.length}`);
    if (videos.length > 0) {
      [...new Set(videos)].forEach(v => console.log(`      🎥 ${v}`));
    }
    console.log(`   📑 Lesson links found: ${lessonLinks.length}`);
    if (lessonLinks.length > 0) {
      [...new Set(lessonLinks)].forEach(l => console.log(`      📝 ${l}`));
    }
    if (topicMatches.length > 0) {
      console.log(`   📂 Topics found: ${topicMatches.length}`);
      topicMatches.forEach(t => console.log(`      📁 ${t}`));
    }

    return {
      course_id: course.id,
      title: course.title?.rendered,
      link: course.link,
      videos: [...new Set(videos)],
      lessons: [...new Set(lessonLinks)],
      topics: topicMatches
    };
  } catch (e) {
    console.error(`Error on course ${course.id}:`, e.message);
    return null;
  }
}

async function run() {
  console.log(`Checking curriculum & video links for ${courses.length} courses...`);
  const results = [];
  for (const c of courses) {
    const res = await inspectCourse(c);
    if (res) results.push(res);
  }
  fs.writeFileSync('data/course_video_links.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('\n✅ Scraped course video and lesson links saved to data/course_video_links.json');
}

run();
