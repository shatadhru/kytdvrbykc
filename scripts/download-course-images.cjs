const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const mediaDir = path.resolve(__dirname, '../public/media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const fc = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/full_curriculum.json'), 'utf8'));
const published = fc.filter(x => x.course?.status === 'publish');

const uniqueUrls = new Map();
published.forEach(p => {
  const url = p.course?.thumbnail?.url;
  if (url && !uniqueUrls.has(url)) {
    // Generate clean filename
    const extMatch = url.match(/\.(png|jpg|jpeg|webp)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
    const cleanName = `course-${p.course.id}-${p.course.slug || 'thumb'}.${ext}`
      .replace(/[^a-zA-Z0-9.-]/g, '_');
    uniqueUrls.set(url, cleanName);
  }
});

console.log(`Found ${uniqueUrls.size} unique thumbnails to download into public/media...`);

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const encodedUrl = encodeURI(url);
    const client = encodedUrl.startsWith('https') ? https : http;
    const req = client.get(encodedUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
      fileStream.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function run() {
  const results = {};
  for (const [url, filename] of uniqueUrls.entries()) {
    const targetFile = path.join(mediaDir, filename);
    try {
      if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
        console.log(`Already exists: ${filename} (${fs.statSync(targetFile).size} bytes)`);
        results[url] = `/media/${filename}`;
        continue;
      }
      console.log(`Downloading ${url} -> ${filename}...`);
      await downloadFile(url, targetFile);
      const size = fs.statSync(targetFile).size;
      console.log(`✓ Saved ${filename} (${size} bytes)`);
      results[url] = `/media/${filename}`;
    } catch (err) {
      console.error(`✗ Failed to download ${url}:`, err.message);
      // Fallback placeholder
      results[url] = '/images/course-placeholder.png';
    }
  }

  // Save map for reference
  fs.writeFileSync(
    path.resolve(__dirname, 'downloaded-images-map.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log('Finished downloading thumbnails. Map saved to scripts/download-images-map.json');
}

run().catch(console.error);
