const fs = require('fs');
const fc = JSON.parse(fs.readFileSync('data/full_curriculum.json', 'utf8'));
const published = fc.filter(x => x.course?.status === 'publish');

console.log('Total published courses:', published.length);
published.forEach((item, i) => {
  const c = item.course;
  let totalLessons = 0;
  let withVideo = 0;
  (item.curriculum?.topics || []).forEach(t => {
    (t.lessons || []).forEach(l => {
      totalLessons++;
      if (l.video?.youtube_url) withVideo++;
    });
  });
  console.log(`${i+1}. [${c.id}] ${c.title} | Price: ${c.pricing?.price || 0} | Topics: ${(item.curriculum?.topics || []).length} | Lessons: ${totalLessons} (${withVideo} videos) | Thumb: ${c.thumbnail?.url || 'NONE'}`);
});
