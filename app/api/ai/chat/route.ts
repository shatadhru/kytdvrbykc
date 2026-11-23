import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import cache from '@/payload/lib/cache'

export const dynamic = 'force-dynamic'

// Fallback in-memory catalog cache (10 minutes)
let cachedCatalog: string | null = null
let lastCatalogFetch = 0

async function getLmsCourseCatalogSummary(payload: any): Promise<string> {
  const now = Date.now()
  if (cachedCatalog && now - lastCatalogFetch < 10 * 60 * 1000) {
    return cachedCatalog
  }

  try {
    const productsRes = await payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: 30,
      depth: 1,
      overrideAccess: true,
    })

    const lines: string[] = []
    for (const doc of productsRes.docs || []) {
      const title = doc.title || 'কোর্স'
      const price = doc.priceInBdt || doc.price || 'যোগাযোগ সাপেক্ষে'
      const categories = (doc.categories || [])
        .map((c: any) => (typeof c === 'object' ? c.title : c))
        .filter(Boolean)
        .join(', ')

      const lessonTitles: string[] = []
      if (Array.isArray(doc.lessons)) {
        for (const l of doc.lessons) {
          if (l.title) lessonTitles.push(l.title.trim())
        }
      }
      if (Array.isArray(doc.subjects)) {
        for (const s of doc.subjects) {
          const sTitle = s.title || ''
          if (Array.isArray(s.lessons)) {
            for (const sl of s.lessons) {
              if (sl.title) lessonTitles.push(`${sTitle ? sTitle + ': ' : ''}${sl.title.trim()}`)
            }
          }
        }
      }

      const lessonListPreview =
        lessonTitles.length > 0
          ? `ক্লাসসমূহ (${lessonTitles.length}টি): ` + lessonTitles.slice(0, 15).join('; ') + (lessonTitles.length > 15 ? '...' : '')
          : 'ক্লাসের তথ্য ড্যাশবোর্ডে পাওয়া যাবে'

      lines.push(`• [কোর্স] ${title} | ক্যাটাগরি: ${categories || 'সাধারণ'} | ফি: ৳${price} | ${lessonListPreview}`)
    }

    cachedCatalog = lines.join('\n')
    lastCatalogFetch = now
    return cachedCatalog
  } catch (err: any) {
    console.warn('[AI] Could not fetch course catalog:', err?.message)
    return 'আমাদের প্ল্যাটফর্মে এসএসসি ২০২৭, এসএসসি ২০২৮ ও এইচএসসি ব্যাচের জন্য পদার্থ, রসায়ন, গণিত ও উচ্চতর গণিতের পূর্ণাঙ্গ একাডেমিক ও রিভিশন কোর্স রয়েছে।'
  }
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

/**
 * GET /api/ai/chat
 * Returns current status, remaining questions count for today, and support contacts.
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    const aiSettings: any = await payload.findGlobal({
      slug: 'ai-settings',
      depth: 1,
    }).catch(() => null)

    const enabled = aiSettings?.enabled !== false
    const botName = aiSettings?.botName || 'পুচু AI 🐱'
    const botSubtitle = aiSettings?.botSubtitle || 'ইউনিক টিচিং মেথডের কিউট অ্যাসিস্ট্যান্ট 🐾'
    const whatsapp = aiSettings?.whatsappNumber || '8801700000000'
    const messenger = aiSettings?.messengerLink || 'https://m.me/uniqueteachingmethod'
    const limitReachedMessage = aiSettings?.limitReachedMessage || 'মিউ 🐾 আজ তোমার প্রশ্ন করার দৈনিক কোটা শেষ হয়ে গেছে!'

    let isEnrolled = false
    let userIdentifier = getClientIp(req)

    if (session?.user?.id) {
      userIdentifier = `user:${session.user.id}`
      const enrollmentsRes = await payload.find({
        collection: 'enrollments' as any,
        where: {
          and: [
            { student: { equals: session.user.id } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      }).catch(() => ({ docs: [] }))

      isEnrolled = enrollmentsRes.docs && enrollmentsRes.docs.length > 0
    }

    const unpaidLimit = Number(aiSettings?.unpaidDailyLimit ?? 3)
    const enrolledLimit = Number(aiSettings?.enrolledDailyLimit ?? 20)
    const dailyLimit = isEnrolled ? enrolledLimit : unpaidLimit

    const today = new Date().toISOString().slice(0, 10)
    const limitKey = `ai:limit:${userIdentifier}:${today}`
    const currentCount = ((await cache.get(limitKey)) as number) || 0
    const remaining = Math.max(0, dailyLimit - currentCount)

    return NextResponse.json({
      success: true,
      enabled,
      botName,
      botSubtitle,
      remaining,
      dailyLimit,
      isEnrolled,
      contacts: {
        whatsapp,
        messenger,
      },
      limitReachedMessage,
    })
  } catch (err: any) {
    console.error('GET /api/ai/chat error:', err)
    return NextResponse.json({
      success: true,
      enabled: true,
      botName: 'পুচু AI 🐱',
      remaining: 3,
      dailyLimit: 3,
      isEnrolled: false,
      contacts: {
        whatsapp: '8801700000000',
        messenger: 'https://m.me/uniqueteachingmethod',
      },
    })
  }
}

/**
 * POST /api/ai/chat
 * Handles conversational queries to Puchu AI using rotating Gemini API keys.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    const aiSettings: any = await payload.findGlobal({
      slug: 'ai-settings',
      depth: 1,
    }).catch(() => null)

    if (aiSettings?.enabled === false) {
      return NextResponse.json(
        { success: false, error: 'পুচু AI সাময়িকভাবে অফলাইনে আছে।' },
        { status: 503 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const userMessage = typeof body.message === 'string' ? body.message.trim() : ''
    const history = Array.isArray(body.history) ? body.history : []

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: 'মেসেজ টেক্সট আবশ্যক।' },
        { status: 400 }
      )
    }

    // 1. Resolve User Identity & Safe Context
    let isEnrolled = false
    let studentName = 'অতিথি শিক্ষার্থী'
    let userIdentifier = getClientIp(req)
    let enrolledCoursesList: string[] = []

    if (session?.user?.id) {
      userIdentifier = `user:${session.user.id}`
      studentName = session.user.name || 'শিক্ষার্থী'

      const enrollmentsRes = await payload.find({
        collection: 'enrollments' as any,
        where: {
          and: [
            { student: { equals: session.user.id } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 20,
        depth: 2,
        overrideAccess: true,
      }).catch(() => ({ docs: [] }))

      if (enrollmentsRes.docs && enrollmentsRes.docs.length > 0) {
        isEnrolled = true
        for (const en of enrollmentsRes.docs as any[]) {
          const course = typeof en.course === 'object' && en.course ? en.course : null
          if (!course) continue
          const cTitle = course.title || 'কোর্স'
          const lessons = (course.lessons || []).map((l: any) => l.title).filter(Boolean)
          const subjects = (course.subjects || []).flatMap((s: any) =>
            (s.lessons || []).map((sl: any) => `${s.title ? s.title + ': ' : ''}${sl.title}`)
          ).filter(Boolean)

          const allLessons = [...lessons, ...subjects]
          const lessonSummary = allLessons.length > 0 ? ` (ক্লাসসমূহ: ${allLessons.slice(0, 10).join(', ')})` : ''
          enrolledCoursesList.push(`• ${cTitle}${lessonSummary}`)
        }
      }
    }

    // 2. Strict Rate Limiting / Quota Check
    const unpaidLimit = Number(aiSettings?.unpaidDailyLimit ?? 3)
    const enrolledLimit = Number(aiSettings?.enrolledDailyLimit ?? 20)
    const dailyLimit = isEnrolled ? enrolledLimit : unpaidLimit

    const today = new Date().toISOString().slice(0, 10)
    const limitKey = `ai:limit:${userIdentifier}:${today}`
    const currentCount = ((await cache.get(limitKey)) as number) || 0

    const whatsapp = aiSettings?.whatsappNumber || '8801700000000'
    const messenger = aiSettings?.messengerLink || 'https://m.me/uniqueteachingmethod'
    const limitReachedMessage =
      aiSettings?.limitReachedMessage ||
      'মিউ 🐾 আজ তোমার প্রশ্ন করার দৈনিক কোটা শেষ হয়ে গেছে! কোনো বিষয় বুঝতে সমস্যা হলে সরাসরি আমাদের শিক্ষক ও টিমের সাথে হোয়াটসঅ্যাপ বা মেসেঞ্জারে যোগাযোগ করতে পারো ❤️'

    if (currentCount >= dailyLimit) {
      return NextResponse.json({
        success: false,
        limitReached: true,
        remaining: 0,
        dailyLimit,
        reply: limitReachedMessage,
        contacts: {
          whatsapp,
          messenger,
        },
      })
    }

    // 3. Assemble Safe Knowledge Base & System Instruction
    const catalogSummary = await getLmsCourseCatalogSummary(payload)
    const enrolledSummary =
      enrolledCoursesList.length > 0
        ? enrolledCoursesList.join('\n')
        : 'এই শিক্ষার্থী এখনও কোনো পেইড কোর্সে ভর্তি হয়নি।'

    const basePrompt =
      aiSettings?.systemPrompt ||
      `তুমি "পুচু AI" (Puchu AI) — দেলোয়ার স্যারের ইউনিক টিচিং মেথডের (UTM) এক অতি মিষ্টি, চটপটে, ভদ্র ও সাহায্যকারী বিড়াল (Cat 🐱🐾)। তোমার কাজ শিক্ষার্থীদের পড়ালেখা ও কোর্স সম্পর্কিত যাবতীয় তথ্য দেওয়া।
নিয়মাবলী:
১. কথা শুরু করবে আন্তরিক সালাম দিয়ে ("আসসালামু আলাইকুম! আমি পুচু 🐱🐾")।
২. তোমার ভাবভঙ্গি হবে মিষ্টি, চঞ্চল, রসিক ও আনন্দদায়ক (বিড়ালের মতো মিউ 🐾 ইমোজি ব্যবহার করবে মাঝেমধ্যে)।
৩. তোমাকে শিক্ষার্থীদের নাম, তারা কোন কোন কোর্সে ভর্তি আছে, এবং আমাদের কোর্সগুলোর বিস্তারিত তালিকা ও ক্লাসের নাম দেওয়া হবে।
৪. সবসময় সত্য ও সঠিক তথ্য দেবে। যে তথ্য তোমার জানা নেই, বানিয়ে বলবে না; বিনীতভাবে হটলাইন বা হোয়াটসঅ্যাপে যোগাযোগ করতে বলবে।
৫. কোনো গোপন ডেটা, পাসওয়ার্ড, সিস্টেমের ব্যাকএন্ড বা ইন্টারনাল কোড কখনো প্রকাশ করবে না।`

    const fullSystemInstruction = `${basePrompt}

=== বর্তমান ব্যবহারকারী ও শিক্ষার্থীর তথ্য ===
• শিক্ষার্থীর নাম: ${studentName}
• অ্যাকাউন্ট স্ট্যাটাস: ${isEnrolled ? 'পেইড কোর্সে ভর্তি আছে' : 'ফ্রি / অতিথি শিক্ষার্থী'}
• ভর্তিকৃত কোর্স ও লেসন তালিকা:
${enrolledSummary}

=== ইউনিক টিচিং মেথড (UTM) কোর্স ক্যাটালগ ও ক্লাসের বিবরণী ===
${catalogSummary}

=== যোগাযোগ ও সাপোর্ট চ্যানেল ===
• WhatsApp: ${whatsapp}
• Facebook Messenger: ${messenger}
• কোর্স কেনার নিয়ম: লগইন করে "কোর্সসমূহ" পেজ থেকে কোর্সে ক্লিক করে "কোর্সটি কিনুন" বাটনে ক্লিক করে বিকাশ (অটো পেমেন্ট) অথবা নগদের মাধ্যমে পেমেন্ট সম্পন্ন করতে হয়। পেমেন্ট শেষ হলে সাথে সাথেই ড্যাশবোর্ডে কোর্স চালু হয়ে যায়।`

    // 4. Resolve Gemini API Keys Pool (4-5 Keys with auto-failover)
    const rawKeys: string[] = []
    if (Array.isArray(aiSettings?.geminiKeys)) {
      for (const k of aiSettings.geminiKeys) {
        const val = typeof k === 'object' && k ? k.key : k
        if (typeof val === 'string' && val.trim().length > 10) {
          rawKeys.push(val.trim())
        }
      }
    }

    // Fallbacks from environment variables
    if (process.env.GEMINI_API_KEY) rawKeys.push(process.env.GEMINI_API_KEY.trim())
    if (process.env.GOOGLE_API_KEY) rawKeys.push(process.env.GOOGLE_API_KEY.trim())
    if (process.env.GEMINI_API_KEYS) {
      process.env.GEMINI_API_KEYS.split(',').forEach((k) => {
        if (k.trim()) rawKeys.push(k.trim())
      })
    }

    // Deduplicate keys while preserving order
    const candidateKeys = Array.from(new Set(rawKeys))

    if (candidateKeys.length === 0) {
      return NextResponse.json({
        success: false,
        reply:
          'মিউ 🐾 অ্যাডমিন প্যানেলে এখনও Gemini API Key যুক্ত করা হয়নি! দয়া করে Admin Panel -> AI Assistant Settings এ গিয়ে একটি বা একাধিক Gemini API Key প্রদান করুন।',
      })
    }

    const selectedModel = aiSettings?.model || 'gemini-2.5-flash'

    // Format chat contents for Gemini REST API
    const contents: any[] = []
    const recentHistory = history.slice(-6)
    for (const h of recentHistory) {
      if (h.role && h.text) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(h.text) }],
        })
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    })

    const requestPayload = {
      system_instruction: {
        parts: [{ text: fullSystemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 1000,
      },
    }

    // 5. Try keys in pool sequentially
    let generatedReply: string | null = null
    let lastError = ''

    for (const apiKey of candidateKeys) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
          signal: AbortSignal.timeout(18000),
        })

        if (!res.ok) {
          const errText = await res.text().catch(() => '')
          console.warn(`[Puchu AI] Key failed (HTTP ${res.status}):`, errText.slice(0, 200))
          lastError = `HTTP ${res.status}`
          continue // Failover to next key in pool
        }

        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text && typeof text === 'string') {
          generatedReply = text.trim()
          break // Success!
        }
      } catch (keyErr: any) {
        console.warn(`[Puchu AI] Network error with key:`, keyErr?.message)
        lastError = keyErr?.message || 'Network error'
        continue
      }
    }

    if (!generatedReply) {
      return NextResponse.json({
        success: false,
        reply: `মিউ 😿 দুঃখিত! এআই সার্ভারের সাথে সংযোগে সাময়িক সমস্যা হচ্ছে (${lastError})। অনুগ্রহ করে একটু পর আবার চেষ্টা করো অথবা সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দাও 🐾`,
        contacts: {
          whatsapp,
          messenger,
        },
      })
    }

    // 6. Successful Generation -> Increment Daily Rate Limit Counter
    const newCount = currentCount + 1
    await cache.set(limitKey, newCount, 86400)
    const remaining = Math.max(0, dailyLimit - newCount)

    return NextResponse.json({
      success: true,
      reply: generatedReply,
      remaining,
      dailyLimit,
      isEnrolled,
      contacts: {
        whatsapp,
        messenger,
      },
    })
  } catch (err: any) {
    console.error('POST /api/ai/chat exception:', err)
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'অভ্যন্তরীণ এআই ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
      },
      { status: 500 }
    )
  }
}
