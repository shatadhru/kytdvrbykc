const fs = require('fs')
const path = require('path')
const { DatabaseSync } = require('node:sqlite')
const xlsx = require('/tmp/quesdatabase/node_modules/xlsx')

const rootDir = path.resolve(__dirname, '..')

const sourceDir = '/tmp/quesdatabase'
const metaCachePath = path.join(sourceDir, 'meta_cache.json')
const targetDbPath = path.join(rootDir, 'data', 'questions.db')

if (!fs.existsSync(metaCachePath)) {
  console.error(`Error: ${metaCachePath} not found. Please ensure quesdatabase is cloned to ${sourceDir}`)
  process.exit(1)
}

function containsImage(q) {
  const allText = [q.text, q.optionA, q.optionB, q.optionC, q.optionD, q.explanation].join(' ')

  if (/imageShouldbeAdded/i.test(allText)) return true
  if (/<img|data:image/i.test(allText)) return true
  if (/\b[\w-]+\.(?:png|jpg|jpeg|webp|gif|svg)\b/i.test(allText)) return true
  if (/\[(?:ছবি|চিত্র|image)\]/i.test(allText)) return true

  // MCQ questions must have at least 2 valid non-empty options
  if (q.isMcq) {
    if (!q.optionA || !q.optionB) return true
    if (q.optionA.trim() === '' || q.optionB.trim() === '') return true
  }

  // Explicit dependence on missing image/diagram
  if (
    /(?:নিচের|পাশের|উদ্দীপকের|উপরের)\s*(?:চিত্র|ছবি|সার্কিট|বর্তনী|লেখচিত্র)(?:টি|টিতে|র)?\s*(?:লক্ষ|দেখ|অনুযায়ী|অনুসারে|হতে|থেকে)/i.test(
      q.text,
    )
  ) {
    return true
  }

  return false
}

function cleanLatex(str) {
  if (!str) return ''
  let out = str

  out = out.replace(/\\boxed\{([^{}]*\{[^{}]*\}[^{}]*|[^{}]*)\}/g, (match, inner) => {
    let cleaned = inner.replace(/\\(?:mathbf|text|mathrm|mathit)\{([^{}]*)\}/g, '$1')
    cleaned = cleaned.replace(/[~\s]+/g, ' ').trim()
    return '\n【 ' + cleaned + ' 】\n'
  })

  out = out.replace(/\\\(\s*\\\\\\\\\s*\\\)/g, '\n')
  out = out.replace(/\\\\/g, '\n')
  out = out.replace(/\\\(/g, '')
  out = out.replace(/\\\)/g, '')
  out = out.replace(/\\\[/g, '')
  out = out.replace(/\\\]/g, '')

  out = out.replace(/\\begin\{array\}(?:\{[^}]*\})?/g, '')
  out = out.replace(/\\end\{array\}/g, '')
  out = out.replace(/\\hline/g, '')

  for (let i = 0; i < 3; i++) {
    out = out.replace(/\\(?:text|mathbf|mathrm|mathit|underline)\s*\{([^{}]*)\}/g, '$1')
  }

  out = out.replace(/\\rightarrow/g, ' → ')
  out = out.replace(/\\leftarrow/g, ' ← ')
  out = out.replace(/\\times/g, ' × ')
  out = out.replace(/\\div/g, ' ÷ ')
  out = out.replace(/\\pm/g, ' ± ')
  out = out.replace(/\\degree/g, '°')
  out = out.replace(/\^\s*\\circ/g, '°')
  out = out.replace(/\\approx/g, ' ≈ ')
  out = out.replace(/\\neq/g, ' ≠ ')
  out = out.replace(/\\le\b|\\leq\b/g, ' ≤ ')
  out = out.replace(/\\ge\b|\\geq\b/g, ' ≥ ')
  out = out.replace(/\\alpha/g, 'α')
  out = out.replace(/\\beta/g, 'β')
  out = out.replace(/\\gamma/g, 'γ')
  out = out.replace(/\\theta/g, 'θ')
  out = out.replace(/\\pi/g, 'π')
  out = out.replace(/\\mu/g, 'μ')
  out = out.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
  out = out.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1/$2)')

  for (let i = 0; i < 2; i++) {
    out = out.replace(/\{([^{}]*)\}/g, '$1')
  }

  out = out.replace(/\s*&\s*/g, ' | ')
  out = out.replace(/\\[a-zA-Z]+/g, ' ')
  out = out.replace(/[ \t]+/g, ' ')
  out = out.replace(/\n\s*\n\s*\n+/g, '\n\n')
  return out.trim()
}

// Remove old database if exists
if (fs.existsSync(targetDbPath)) {
  try {
    fs.unlinkSync(targetDbPath)
  } catch {}
}

const db = new DatabaseSync(targetDbPath)
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA synchronous = NORMAL;')
db.exec('PRAGMA cache_size = -64000;')

db.exec(`
  CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    total_mcq INTEGER DEFAULT 0,
    total_cq INTEGER DEFAULT 0
  );

  CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    folder TEXT NOT NULL,
    total_mcq INTEGER DEFAULT 0,
    total_cq INTEGER DEFAULT 0
  );

  CREATE TABLE chapters (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    chapter_index INTEGER NOT NULL,
    total_mcq INTEGER DEFAULT 0,
    total_cq INTEGER DEFAULT 0
  );

  CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_id TEXT,
    chapter_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    is_mcq INTEGER NOT NULL,
    question_type TEXT,
    topic TEXT,
    question_text TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_index TEXT,
    correct_answer TEXT,
    explanation TEXT
  );

  CREATE INDEX idx_q_chapter ON questions(chapter_id, is_mcq);
  CREATE INDEX idx_q_subject ON questions(subject_id, is_mcq);
  CREATE INDEX idx_q_category ON questions(category_id);
`)

const meta = JSON.parse(fs.readFileSync(metaCachePath, 'utf8'))

const insertCat = db.prepare(
  'INSERT INTO categories (id, name, slug, total_mcq, total_cq) VALUES (?, ?, ?, ?, ?)',
)
const insertSubj = db.prepare(
  'INSERT INTO subjects (id, category_id, name, slug, folder, total_mcq, total_cq) VALUES (?, ?, ?, ?, ?, ?, ?)',
)
const insertChap = db.prepare(
  'INSERT INTO chapters (id, subject_id, category_id, title, file_name, chapter_index, total_mcq, total_cq) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
)
const insertQ = db.prepare(
  'INSERT INTO questions (original_id, chapter_id, subject_id, category_id, is_mcq, question_type, topic, question_text, option_a, option_b, option_c, option_d, correct_index, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
)

const categoryConfig = {
  HSC: { id: 'hsc', name: 'এইচএসসি (HSC)', slug: 'hsc' },
  SSC: { id: 'ssc', name: 'এসএসসি (SSC)', slug: 'ssc' },
  'অন্যান্য / সাধারণ': { id: 'general', name: 'সাধারণ ও অন্যান্য (General)', slug: 'general' },
}

console.log('Starting full question sanitization and SQLite compilation...')
const startTime = Date.now()

let globalTotalQ = 0
let globalMcq = 0
let globalCq = 0
let globalSubjects = 0
let globalChapters = 0

for (const catKey of Object.keys(meta)) {
  const cat = categoryConfig[catKey] || {
    id: catKey.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: catKey,
    slug: catKey.toLowerCase(),
  }

  let catMcq = 0
  let catCq = 0

  const subjs = meta[catKey]
  for (const subjName of Object.keys(subjs)) {
    globalSubjects++
    const sData = subjs[subjName]
    const subjId = `${cat.id}-sub-${globalSubjects}`
    const subjSlug =
      subjName
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
        .replace(/^-|-$/g, '') || `subject-${globalSubjects}`

    let subjMcq = 0
    let subjCq = 0

    let chIndex = 0
    for (const ch of sData.chapters) {
      chIndex++
      globalChapters++
      const chapId = `${subjId}-ch-${chIndex}`
      const fPath = path.join(sourceDir, sData.folder, ch.fileName)

      let chapMcq = 0
      let chapCq = 0

      if (fs.existsSync(fPath)) {
        try {
          const wb = xlsx.readFile(fPath)
          const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])

          db.exec('BEGIN TRANSACTION;')

          for (let rIdx = 0; rIdx < rows.length; rIdx++) {
            const r = rows[rIdx]
            const rawType = (r['Question Type'] || '').trim()
            const isMcq = rawType === 'বহুনির্বাচনি প্রশ্ন' || Boolean(r['Option A'] && r['Option B'])

            const rawIdx = (r['Correct Index'] || '').trim().toUpperCase()
            const rawAns = (r['Correct Answer'] || '').trim()
            const isInvalidAns =
              !['A', 'B', 'C', 'D'].includes(rawIdx) ||
              ['N/A', 'সঠিক উত্তর নেই', 'No correct answer'].includes(rawAns)

            // If question is an MCQ without a valid answer key, skip it
            if (isMcq && isInvalidAns) {
              continue
            }

            const q = {
              text: cleanLatex((r['Question Text'] || '').trim()),
              optionA: cleanLatex((r['Option A'] || '').trim()),
              optionB: cleanLatex((r['Option B'] || '').trim()),
              optionC: cleanLatex((r['Option C'] || '').trim()),
              optionD: cleanLatex((r['Option D'] || '').trim()),
              explanation: cleanLatex((r['Explanation'] || '').trim()),
              type: rawType,
              isMcq,
            }

            if (!containsImage(q)) {
              insertQ.run(
                r['Question ID'] ? String(r['Question ID']) : null,
                chapId,
                subjId,
                cat.id,
                isMcq ? 1 : 0,
                rawType || (isMcq ? 'বহুনির্বাচনি প্রশ্ন' : 'সৃজনশীল প্রশ্ন'),
                cleanLatex((r['Topic'] || 'General').trim()),
                q.text,
                q.optionA,
                q.optionB,
                q.optionC,
                q.optionD,
                isMcq ? rawIdx : '',
                rawAns === 'N/A' ? '' : rawAns,
                q.explanation,
              )

              globalTotalQ++
              if (isMcq) {
                chapMcq++
                subjMcq++
                catMcq++
                globalMcq++
              } else {
                chapCq++
                subjCq++
                catCq++
                globalCq++
              }
            }
          }

          db.exec('COMMIT;')
        } catch (err) {
          try {
            db.exec('ROLLBACK;')
          } catch {}
          console.warn(`Warning reading ${fPath}:`, err.message)
        }
      }

      insertChap.run(chapId, subjId, cat.id, ch.title, ch.fileName, chIndex, chapMcq, chapCq)
    }

    insertSubj.run(subjId, cat.id, subjName, subjSlug, sData.folder, subjMcq, subjCq)
  }

  insertCat.run(cat.id, cat.name, cat.slug, catMcq, catCq)
}

const duration = ((Date.now() - startTime) / 1000).toFixed(1)
console.log(`Success! SQLite Question Database built in ${duration}s at ${targetDbPath}`)
console.log(`Subjects: ${globalSubjects}, Chapters: ${globalChapters}`)
console.log(`Total Clean Questions: ${globalTotalQ} (MCQ: ${globalMcq}, CQ: ${globalCq})`)

