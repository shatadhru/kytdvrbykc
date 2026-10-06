import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const BASE_URL = 'https://utmeducation.com';
const USER = 'uniqueteachingmethod@gmail.com';
const PASS = 'GkxrdQhydngBixDJfMrwep6l';
const authHeader = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const text = await res.text();
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text) };
    } catch {
      return { ok: res.ok, status: res.status, raw: text };
    }
  } catch (err) {
    return { ok: false, status: 500, error: err.message };
  }
}

async function fetchAllPaginated(endpointPath, name) {
  let page = 1;
  let all = [];
  console.log(`\n⏳ Fetching ${name} (${endpointPath})...`);
  while (true) {
    const separator = endpointPath.includes('?') ? '&' : '?';
    const url = `${BASE_URL}/wp-json/${endpointPath}${separator}per_page=100&page=${page}`;
    const res = await fetchJson(url);
    if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
      if (page === 1 && !res.ok) {
        console.log(`⚠️ Failed to fetch ${name}: HTTP ${res.status}`);
      }
      break;
    }
    all = all.concat(res.data);
    console.log(`  └─ Page ${page}: fetched ${res.data.length} items (Total: ${all.length})`);
    if (res.data.length < 100) break;
    page++;
  }
  return all;
}

async function main() {
  console.log('🚀 Starting Full Site Data Export from:', BASE_URL);
  console.log('👤 Authenticated User:', USER);

  const datasets = [
    { key: 'courses', endpoint: 'wp/v2/courses', file: 'courses.json', name: 'Courses' },
    { key: 'course_categories', endpoint: 'wp/v2/course-category', file: 'course_categories.json', name: 'Course Categories' },
    { key: 'course_tags', endpoint: 'wp/v2/course-tag', file: 'course_tags.json', name: 'Course Tags' },
    { key: 'products', endpoint: 'wc/v3/products', file: 'products.json', name: 'WooCommerce Products (Courses)' },
    { key: 'orders', endpoint: 'wc/v3/orders', file: 'orders_enrollments.json', name: 'Orders / Enrollments' },
    { key: 'customers', endpoint: 'wc/v3/customers', file: 'customers_students.json', name: 'Students / Customers' },
    { key: 'coupons', endpoint: 'wc/v3/coupons', file: 'coupons.json', name: 'Coupons' },
    { key: 'users', endpoint: 'wp/v2/users?context=edit', file: 'users.json', name: 'Users / Instructors' },
    { key: 'media', endpoint: 'wp/v2/media', file: 'media.json', name: 'Media Library' },
    { key: 'posts', endpoint: 'wp/v2/posts', file: 'posts.json', name: 'Blog Posts' },
    { key: 'pages', endpoint: 'wp/v2/pages', file: 'pages.json', name: 'Site Pages' }
  ];

  const summary = {
    exported_at: new Date().toISOString(),
    site_url: BASE_URL,
    authenticated_as: USER,
    counts: {}
  };

  for (const ds of datasets) {
    const data = await fetchAllPaginated(ds.endpoint, ds.name);
    fs.writeFileSync(path.join(DATA_DIR, ds.file), JSON.stringify(data, null, 2), 'utf-8');
    summary.counts[ds.key] = data.length;
    console.log(`✅ Saved ${data.length} ${ds.name} -> data/${ds.file}`);
  }

  fs.writeFileSync(path.join(DATA_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf-8');
  console.log('\n======================================================');
  console.log('🎉 ALL DATA EXPORTED SUCCESSFULLY TO data/ FOLDER!');
  console.log('======================================================');
  console.log(JSON.stringify(summary.counts, null, 2));
}

main().catch(console.error);
