import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('data/courses.json', 'utf-8'));
const products = JSON.parse(fs.readFileSync('data/products.json', 'utf-8'));
const pages = JSON.parse(fs.readFileSync('data/pages.json', 'utf-8'));

console.log(`Analyzing ${courses.length} courses, ${products.length} products, and ${pages.length} pages...`);

function findMediaLinks(items, label) {
  items.forEach(item => {
    const raw = JSON.stringify(item);
    const urls = raw.match(/https?:\/\/[^\s\"\'\<\>]+(?:\.mp4|\.m3u8|youtube\.com|youtu\.be|vimeo\.com|player\.vimeo|drive\.google\.com|facebook\.com\/[^\/]+\/videos)[^\s\"\'\<\>]*/gi);
    if (urls && urls.length > 0) {
      const unique = [...new Set(urls)];
      console.log(`\n[${label}] ID: ${item.id} - ${item.title?.rendered || item.name || 'Untitled'}`);
      unique.forEach(u => console.log('  🎥', u));
    }
  });
}

findMediaLinks(courses, 'Course');
findMediaLinks(products, 'Product');
findMediaLinks(pages, 'Page');
