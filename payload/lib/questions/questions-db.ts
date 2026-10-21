import path from 'path'
import fs from 'fs'
import { DatabaseSync } from 'node:sqlite'

const dbPath = path.resolve(process.cwd(), 'data', 'questions.db')

let dbInstance: DatabaseSync | null = null

export function getQuestionDb(): DatabaseSync | null {
  if (!dbInstance) {
    if (!fs.existsSync(dbPath)) {
      console.warn(`[questions-db] Warning: Database file not found at ${dbPath}`)
      return null
    }
    try {
      dbInstance = new DatabaseSync(dbPath, { readOnly: true })
      dbInstance.exec('PRAGMA query_only = ON;')
    } catch (err) {
      console.error('[questions-db] Failed to open SQLite database:', err)
      return null
    }
  }
  return dbInstance
}

export interface QuestionCategory {
  id: string
  name: string
  slug: string
  total_mcq: number
  total_cq: number
}

export interface QuestionSubject {
  id: string
  category_id: string
  name: string
  slug: string
  folder: string
  total_mcq: number
  total_cq: number
}

export interface QuestionChapter {
  id: string
  subject_id: string
  category_id: string
  title: string
  file_name: string
  chapter_index: number
  total_mcq: number
  total_cq: number
}

export interface McqQuestionPublic {
  id: number
  topic: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

export interface CqQuestion {
  id: number
  topic: string
  questionType: string
  questionText: string
  explanation?: string
}

export interface GradedAnswerReview {
  questionId: number
  questionText: string
  topic: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  selectedOption: string | null
  correctIndex: string
  correctAnswer: string
  isCorrect: boolean
  explanation?: string
}

export interface ExamGradingResult {
  totalQuestions: number
  attempted: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  percentage: number
  passed: boolean
  reviews: GradedAnswerReview[]
}

/**
 * Converts SQLite null-prototype result objects into plain JavaScript objects
 * compatible with React Server Component (RSC) serialization.
 */
function toPlain<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export function getAllCategories(): QuestionCategory[] {
  const db = getQuestionDb()
  if (!db) return []
  const rows = db.prepare('SELECT * FROM categories ORDER BY id ASC').all()
  return toPlain<QuestionCategory[]>(rows)
}

export function getSubjectsByCategory(categoryId?: string): QuestionSubject[] {
  const db = getQuestionDb()
  if (!db) return []
  if (categoryId) {
    const rows = db
      .prepare('SELECT * FROM subjects WHERE category_id = ? ORDER BY id ASC')
      .all(categoryId)
    return toPlain<QuestionSubject[]>(rows)
  }
  const rows = db.prepare('SELECT * FROM subjects ORDER BY category_id, id ASC').all()
  return toPlain<QuestionSubject[]>(rows)
}

export function getSubjectById(subjectId: string): QuestionSubject | null {
  const db = getQuestionDb()
  if (!db) return null
  const rows = db.prepare('SELECT * FROM subjects WHERE id = ?').all(subjectId)
  return rows[0] ? toPlain<QuestionSubject>(rows[0]) : null
}

export function getChaptersBySubject(subjectId: string): QuestionChapter[] {
  const db = getQuestionDb()
  if (!db) return []
  const rows = db
    .prepare('SELECT * FROM chapters WHERE subject_id = ? ORDER BY chapter_index ASC')
    .all(subjectId)
  return toPlain<QuestionChapter[]>(rows)
}

export function getChapterById(chapterId: string): QuestionChapter | null {
  const db = getQuestionDb()
  if (!db) return null
  const rows = db.prepare('SELECT * FROM chapters WHERE id = ?').all(chapterId)
  return rows[0] ? toPlain<QuestionChapter>(rows[0]) : null
}

/**
 * Cleans raw LaTeX math tags and formatting into readable plain text.
 */
export function cleanLatexCode(str: string): string {
  if (!str) return ''
  let out = str

  // 1. Boxed answers e.g. \boxed{\mathbf{~ক~}} or \boxed{1. A} -> 【 ক 】
  out = out.replace(/\\boxed\{([^{}]*\{[^{}]*\}[^{}]*|[^{}]*)\}/g, (match, inner) => {
    let cleaned = inner.replace(/\\(?:mathbf|text|mathrm|mathit)\{([^{}]*)\}/g, '$1')
    cleaned = cleaned.replace(/[~\s]+/g, ' ').trim()
    return '\n【 ' + cleaned + ' 】\n'
  })

  // 2. Line breaks
  out = out.replace(/\\\(\s*\\\\\\\\\s*\\\)/g, '\n')
  out = out.replace(/\\\\/g, '\n')

  // 3. Delimiters \(, \), \[, \]
  out = out.replace(/\\\(/g, '')
  out = out.replace(/\\\)/g, '')
  out = out.replace(/\\\[/g, '')
  out = out.replace(/\\\]/g, '')

  // 4. Arrays and tables
  out = out.replace(/\\begin\{array\}(?:\{[^}]*\})?/g, '')
  out = out.replace(/\\end\{array\}/g, '')
  out = out.replace(/\\hline/g, '')

  // 5. Unwrap formatting tags
  for (let i = 0; i < 3; i++) {
    out = out.replace(/\\(?:text|mathbf|mathrm|mathit|underline)\s*\{([^{}]*)\}/g, '$1')
  }

  // 6. Common math symbols & operators
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

  // 7. Unwrap remaining braces
  for (let i = 0; i < 2; i++) {
    out = out.replace(/\{([^{}]*)\}/g, '$1')
  }

  // 8. Table cell separators
  out = out.replace(/\s*&\s*/g, ' | ')

  // 9. Remove stray backslash command names
  out = out.replace(/\\[a-zA-Z]+/g, ' ')

  // 10. Clean up duplicate spaces and newlines
  out = out.replace(/[ \t]+/g, ' ')
  out = out.replace(/\n\s*\n\s*\n+/g, '\n\n')
  return out.trim()
}

/**
 * Returns randomized MCQ questions for an exam without revealing correct answers.
 * Strictly selects questions with verified answer keys (A, B, C, D).
 */
export function getExamQuestions(chapterId: string, limit: number = 25): McqQuestionPublic[] {
  const db = getQuestionDb()
  if (!db) return []

  const rows = db
    .prepare(
      `SELECT id, topic, question_text, option_a, option_b, option_c, option_d 
       FROM questions 
       WHERE chapter_id = ? AND is_mcq = 1 AND correct_index IN ('A', 'B', 'C', 'D')
       ORDER BY RANDOM() 
       LIMIT ?`,
    )
    .all(chapterId, limit) as any[]

  return toPlain<McqQuestionPublic[]>(
    rows.map((r) => ({
      id: Number(r.id),
      topic: cleanLatexCode(r.topic || 'সাধারণ'),
      questionText: cleanLatexCode(r.question_text),
      optionA: cleanLatexCode(r.option_a),
      optionB: cleanLatexCode(r.option_b),
      optionC: cleanLatexCode(r.option_c),
      optionD: cleanLatexCode(r.option_d),
    })),
  )
}

/**
 * Grades a student's MCQ exam submission on the server side.
 */
export function gradeExamSubmission(
  chapterId: string,
  userAnswers: { questionId: number; selectedOption: string | null }[],
): ExamGradingResult {
  const db = getQuestionDb()
  if (!db || userAnswers.length === 0) {
    return {
      totalQuestions: 0,
      attempted: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      score: 0,
      percentage: 0,
      passed: false,
      reviews: [],
    }
  }

  const questionIds = userAnswers.map((a) => a.questionId)
  const placeholders = questionIds.map(() => '?').join(',')

  const rawRows = db
    .prepare(
      `SELECT id, topic, question_text, option_a, option_b, option_c, option_d, correct_index, correct_answer, explanation 
       FROM questions 
       WHERE id IN (${placeholders})`,
    )
    .all(...questionIds) as any[]

  const questionMap = new Map<number, any>()
  for (const q of rawRows) {
    questionMap.set(Number(q.id), q)
  }

  let attempted = 0
  let correctAnswers = 0
  let incorrectAnswers = 0
  const reviews: GradedAnswerReview[] = []

  for (const item of userAnswers) {
    const q = questionMap.get(item.questionId)
    if (!q) continue

    const selected = item.selectedOption?.trim().toUpperCase() || null
    const rawIdx = (q.correct_index || '').trim().toUpperCase()
    let rawAns = (q.correct_answer || '').trim()
    if (rawAns === 'N/A' || rawAns === 'সঠিক উত্তর নেই' || rawAns === 'No correct answer') {
      rawAns = ''
    }

    const optionMap: Record<string, string> = {
      A: cleanLatexCode(q.option_a || '').trim(),
      B: cleanLatexCode(q.option_b || '').trim(),
      C: cleanLatexCode(q.option_c || '').trim(),
      D: cleanLatexCode(q.option_d || '').trim(),
    }

    // Determine canonical correct index (A, B, C, D)
    let resolvedIndex = ['A', 'B', 'C', 'D'].includes(rawIdx) ? rawIdx : ''

    // If index was not in A..D, check if rawAns matches an option's text
    if (!resolvedIndex && rawAns) {
      for (const [k, v] of Object.entries(optionMap)) {
        if (v && v.toLowerCase() === rawAns.toLowerCase()) {
          resolvedIndex = k
          break
        }
      }
    }

    // Determine canonical answer text
    const resolvedAnswerText =
      resolvedIndex && optionMap[resolvedIndex]
        ? optionMap[resolvedIndex]
        : rawAns || (resolvedIndex ? `অপশন (${resolvedIndex})` : '')

    let isCorrect = false

    if (selected) {
      attempted++
      if (resolvedIndex && selected === resolvedIndex) {
        isCorrect = true
      } else if (rawAns && optionMap[selected]?.toLowerCase() === rawAns.toLowerCase()) {
        isCorrect = true
      }

      if (isCorrect) {
        correctAnswers++
      } else {
        incorrectAnswers++
      }
    }

    reviews.push({
      questionId: Number(q.id),
      questionText: cleanLatexCode(q.question_text),
      topic: cleanLatexCode(q.topic || 'সাধারণ'),
      optionA: optionMap.A,
      optionB: optionMap.B,
      optionC: optionMap.C,
      optionD: optionMap.D,
      selectedOption: item.selectedOption,
      correctIndex: resolvedIndex,
      correctAnswer: resolvedAnswerText,
      isCorrect,
      explanation: cleanLatexCode(q.explanation || ''),
    })
  }

  const totalQuestions = userAnswers.length
  const score = correctAnswers
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  const passed = percentage >= 33 // Standard HSC/SSC pass mark 33%

  return toPlain<ExamGradingResult>({
    totalQuestions,
    attempted,
    correctAnswers,
    incorrectAnswers,
    score,
    percentage,
    passed,
    reviews,
  })
}

/**
 * Returns paginated CQ questions for reading and preparation mode.
 */
export function getCqQuestions(
  chapterId: string,
  page: number = 1,
  limit: number = 25,
  topic?: string,
): { total: number; questions: CqQuestion[] } {
  const db = getQuestionDb()
  if (!db) return { total: 0, questions: [] }

  let countSql = 'SELECT COUNT(*) as count FROM questions WHERE chapter_id = ? AND is_mcq = 0'
  let querySql =
    'SELECT id, topic, question_type, question_text, explanation FROM questions WHERE chapter_id = ? AND is_mcq = 0'
  const params: any[] = [chapterId]

  if (topic && topic !== 'all') {
    countSql += ' AND topic = ?'
    querySql += ' AND topic = ?'
    params.push(topic)
  }

  const countRow = db.prepare(countSql).all(...params) as any[]
  const total = countRow[0]?.count || 0

  const offset = Math.max(0, (page - 1) * limit)
  querySql += ' LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const rows = db.prepare(querySql).all(...params) as any[]

  const questions: CqQuestion[] = rows.map((r) => ({
    id: Number(r.id),
    topic: cleanLatexCode(r.topic || 'General'),
    questionType: r.question_type || 'সৃজনশীল প্রশ্ন',
    questionText: cleanLatexCode(r.question_text),
    explanation: cleanLatexCode(r.explanation || ''),
  }))

  return { total, questions }
}

