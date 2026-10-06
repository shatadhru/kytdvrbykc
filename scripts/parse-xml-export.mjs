import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

function parsePhpSerialized(str) {
  if (!str || typeof str !== 'string') return null;
  const result = {};

  // Extract source
  const sourceMatch = str.match(/s:6:"source";s:\d+:"([^"]+)"/);
  if (sourceMatch) result.source = sourceMatch[1];

  // Extract YouTube URL
  const ytMatch = str.match(/s:14:"source_youtube";s:\d+:"([^"]+)"/);
  if (ytMatch) result.source_youtube = ytMatch[1];

  // Extract Vimeo URL
  const vimeoMatch = str.match(/s:12:"source_vimeo";s:\d+:"([^"]+)"/);
  if (vimeoMatch) result.source_vimeo = vimeoMatch[1];

  // Extract External URL
  const extMatch = str.match(/s:19:"source_external_url";s:\d+:"([^"]+)"/);
  if (extMatch) result.source_external_url = extMatch[1];

  // Extract HTML5 URL
  const html5Match = str.match(/s:12:"source_html5";s:\d+:"([^"]+)"/);
  if (html5Match) result.source_html5 = html5Match[1];

  // Extract Embedded Code
  const embedMatch = str.match(/s:15:"source_embedded";s:\d+:"([^"]+)"/);
  if (embedMatch) result.source_embedded = embedMatch[1];

  // Extract Shortcode
  const scMatch = str.match(/s:16:"source_shortcode";s:\d+:"([^"]+)"/);
  if (scMatch) result.source_shortcode = scMatch[1];

  // Extract Runtime
  const hours = str.match(/s:5:"hours";s:\d+:"([^"]+)"/);
  const minutes = str.match(/s:7:"minutes";s:\d+:"([^"]+)"/);
  const seconds = str.match(/s:7:"seconds";s:\d+:"([^"]+)"/);

  if (hours || minutes || seconds) {
    result.runtime = {
      hours: hours ? hours[1] : '00',
      minutes: minutes ? minutes[1] : '00',
      seconds: seconds ? seconds[1] : '00'
    };
    result.formatted_duration = `${result.runtime.hours}:${result.runtime.minutes}:${result.runtime.seconds}`;
  }

  return result;
}

function parseXmlFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  console.log(`📖 Parsing: ${path.basename(filePath)}...`);
  const xmlContent = fs.readFileSync(filePath, 'utf-8');

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  const items = [];

  while ((match = itemRegex.exec(xmlContent)) !== null) {
    const itemXml = match[1];

    function getTag(tag) {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
      const m = itemXml.match(r);
      if (m) return m[1];
      const r2 = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const m2 = itemXml.match(r2);
      return m2 ? m2[1] : '';
    }

    const title = getTag('title');
    const link = getTag('link');
    const post_id = getTag('wp:post_id');
    const post_date = getTag('wp:post_date');
    const post_name = getTag('wp:post_name');
    const post_type = getTag('wp:post_type') || (link.includes('/cb-lesson/') ? 'cb-lesson' : 'lesson');
    const post_parent = getTag('wp:post_parent');
    const content = getTag('content:encoded');
    const status = getTag('wp:status');

    // Extract all postmeta
    const postmeta = {};
    const metaRegex = /<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g;
    let metaMatch;
    while ((metaMatch = metaRegex.exec(itemXml)) !== null) {
      postmeta[metaMatch[1]] = metaMatch[2];
    }
    const metaRegex2 = /<wp:postmeta>[\s\S]*?<wp:meta_key>([\s\S]*?)<\/wp:meta_key>[\s\S]*?<wp:meta_value>([\s\S]*?)<\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g;
    while ((metaMatch = metaRegex2.exec(itemXml)) !== null) {
      if (!postmeta[metaMatch[1]]) {
        postmeta[metaMatch[1]] = metaMatch[2];
      }
    }

    items.push({
      post_id: parseInt(post_id, 10) || items.length + 1,
      title,
      link,
      post_name,
      post_type,
      post_parent: parseInt(post_parent, 10) || 0,
      post_date,
      status,
      content,
      postmeta
    });
  }
  return items;
}

function main() {
  const file1 = path.join(DATA_DIR, 'uniqueteachingmethod.WordPress.2026-10-05.xml');
  const file2 = path.join(DATA_DIR, 'uniqueteachingmethod.WordPress.2026-10-05 (1).xml');

  const items1 = parseXmlFile(file1);
  const items2 = parseXmlFile(file2);
  const allItems = [...items1, ...items2];

  console.log(`\nTotal items extracted: ${allItems.length}`);

  let youtubeCount = 0;
  let vimeoCount = 0;
  let otherVideoCount = 0;

  const lessons = allItems.map(item => {
    const videoMetaRaw = item.postmeta._video || item.postmeta.video || item.postmeta._lesson_video || '';
    const parsedVideo = parsePhpSerialized(videoMetaRaw);

    let video_url = '';
    let video_type = '';

    if (parsedVideo?.source_youtube) {
      video_url = parsedVideo.source_youtube;
      video_type = 'youtube';
      youtubeCount++;
    } else if (parsedVideo?.source_vimeo) {
      video_url = parsedVideo.source_vimeo;
      video_type = 'vimeo';
      vimeoCount++;
    } else if (parsedVideo?.source_external_url) {
      video_url = parsedVideo.source_external_url;
      video_type = 'external';
      otherVideoCount++;
    } else if (parsedVideo?.source_html5) {
      video_url = parsedVideo.source_html5;
      video_type = 'html5';
      otherVideoCount++;
    } else if (parsedVideo?.source_embedded) {
      video_url = parsedVideo.source_embedded;
      video_type = 'embedded';
      otherVideoCount++;
    }

    // Fallback: search for youtube links in content or other meta fields
    if (!video_url) {
      const fallbackYt = item.content?.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s"'<>]+/i);
      if (fallbackYt) {
        video_url = fallbackYt[0];
        video_type = 'youtube';
        youtubeCount++;
      }
    }

    return {
      lesson_id: item.post_id,
      title: item.title,
      slug: item.post_name,
      post_type: item.post_type,
      status: item.status,
      post_date: item.post_date,
      parent_topic_or_course_id: item.post_parent,
      video: {
        type: video_type || parsedVideo?.source || 'none',
        url: video_url,
        duration: parsedVideo?.formatted_duration || '',
        runtime_details: parsedVideo?.runtime || null,
        raw_meta: parsedVideo
      },
      content: item.content
    };
  });

  // Save clean full lessons JSON
  fs.writeFileSync(path.join(DATA_DIR, 'lessons_with_videos.json'), JSON.stringify(lessons, null, 2), 'utf-8');

  // Save YouTube-only catalog
  const youtubeCatalog = lessons
    .filter(l => l.video?.url && l.video.type === 'youtube')
    .map(l => ({
      lesson_id: l.lesson_id,
      title: l.title,
      parent_id: l.parent_topic_or_course_id,
      youtube_url: l.video.url,
      duration: l.video.duration
    }));

  fs.writeFileSync(path.join(DATA_DIR, 'youtube_lessons_catalog.json'), JSON.stringify(youtubeCatalog, null, 2), 'utf-8');

  console.log('\n======================================================');
  console.log('🎉 LESSONS & VIDEO EXTRACTION COMPLETED!');
  console.log('======================================================');
  console.log(`Total Lessons: ${lessons.length}`);
  console.log(`🎥 Lessons with YouTube URLs: ${youtubeCount}`);
  console.log(`🎥 Lessons with Vimeo URLs: ${vimeoCount}`);
  console.log(`🎥 Lessons with Other Videos: ${otherVideoCount}`);
  console.log(`💾 Saved -> data/lessons_with_videos.json (${lessons.length} items)`);
  console.log(`💾 Saved -> data/youtube_lessons_catalog.json (${youtubeCatalog.length} items)`);
}

main();
