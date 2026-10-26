import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload/payload.config.js'

// Ignore version checker mismatch in standalone script
process.on('unhandledRejection', (err: any) => {
  if (err?.message?.includes('Mismatching')) return
  console.error('Unhandled error:', err)
})

function buildLexicalContent(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            mode: 'normal',
            text,
            type: 'text',
            style: '',
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      })),
    },
  }
}

async function seedEdTechPosts() {
  console.log('🌱 Starting EdTech Posts & Notices Seeding...')
  const payload = await getPayload({ config })

  // 1. Categories
  const categoryDefs = [
    {
      title: 'এডটেক ও ডিজিটাল শিক্ষা',
      slug: 'edtech',
      description: 'আধুনিক শিক্ষা প্রযুক্তি, ভিডিও লার্নিং ও স্মার্ট পড়াশোনার সেরা টিপস।',
    },
    {
      title: 'পড়াশোনার বৈজ্ঞানিক কৌশল',
      slug: 'study-tips',
      description: 'অ্যাক্টিভ রিকল, পোমোডোরো ও পরীক্ষার প্রস্তুতি নিশ্চিত করার পরীক্ষিত মেথড।',
    },
    {
      title: 'ক্লাসরুম নোটিশ ও ঘোষণা',
      slug: 'notices',
      description: 'ক্লাস শিডিউল, লাইভ সাপোর্ট, এক্সাম ও গুরুত্বপূর্ণ প্রাতিষ্ঠানিক নোটিশ।',
    },
    {
      title: 'বিজ্ঞান ও গণিত প্রস্তুতি',
      slug: 'science-math',
      description: 'পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিতের জটিল বিষয় সহজ উপায়ে শেখার কৌশল।',
    },
  ]

  const categoryMap = new Map<string, string>()

  for (const cat of categoryDefs) {
    const existing = await payload.find({
      collection: 'blog-categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      categoryMap.set(cat.slug, String(existing.docs[0].id))
      console.log(`✓ Category exists: ${cat.title}`)
    } else {
      const created = await payload.create({
        collection: 'blog-categories',
        data: cat as any,
      })
      categoryMap.set(cat.slug, String(created.id))
      console.log(`+ Created category: ${cat.title}`)
    }
  }

  // 2. Tags
  const tagDefs = [
    { title: 'এডটেক', slug: 'edtech' },
    { title: 'অনলাইন ক্লাস', slug: 'online-class' },
    { title: 'এসএসসি প্রস্তুতি', slug: 'ssc-prep' },
    { title: 'এইচএসসি প্রস্তুতি', slug: 'hsc-prep' },
    { title: 'পরীক্ষার কৌশল', slug: 'exam-tips' },
    { title: 'নোটিশ', slug: 'notice' },
  ]

  const tagMap = new Map<string, string>()

  for (const tag of tagDefs) {
    const existing = await payload.find({
      collection: 'blog-tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      tagMap.set(tag.slug, String(existing.docs[0].id))
    } else {
      const created = await payload.create({
        collection: 'blog-tags',
        data: tag as any,
      })
      tagMap.set(tag.slug, String(created.id))
      console.log(`+ Created tag: ${tag.title}`)
    }
  }

  // 3. Blog Posts & Notices
  const postsData = [
    {
      title: 'এডটেক বিপ্লব: ডিজিটাল ক্লাসরুমে কীভাবে পড়াশোনায় ১০০% মনোযোগ ধরে রাখবেন',
      slug: 'edtech-revolution-digital-classroom-study-tips',
      categorySlug: 'edtech',
      tagSlugs: ['edtech', 'online-class', 'exam-tips'],
      excerpt: 'ডিজিটাল শিক্ষায় ভিডিও লেকচার, ইন্টারঅ্যাক্টিভ নোট ও সেলফ-অ্যাসেসমেন্টের মাধ্যমে কম সময়ে বেশি তথ্য আত্মস্থ করার আধুনিক বৈজ্ঞানিক গাইডলাইন।',
      paragraphs: [
        'বর্তমানে শিক্ষাক্ষেত্রে এডটেক (EdTech) বা ডিজিটাল শিক্ষা প্রযুক্তির বিকাশ শিক্ষার্থীদের পড়ার ধারণাকে সম্পূর্ণ বদলে দিয়েছে। প্রথাগত মুখস্থবিদ্যার যুগ পেরিয়ে ভিজ্যুয়াল অ্যানিমেশন ও মানসম্মত ডিজিটাল লেকচারের মাধ্যমে জটিল বৈজ্ঞানিক তত্ত্ব এখন নিমেষেই বোঝা সম্ভব হচ্ছে।',
        'তবে অনলাইন ক্লাসে পড়াশোনার সবচেয়ে বড় চ্যালেঞ্জ হলো মনোযোগ ধরে রাখা। গবেষণায় দেখা গেছে, একটানা দীর্ঘ সময় স্ক্রিনের দিকে তাকিয়ে থাকার চেয়ে ২৫ মিনিটের পোমোডোরো (Pomodoro) সাইকেল অনুসরণ করে প্রতি সেশনের পর ৫ মিনিটের বিরতি নিলে মস্তিষ্কের ধারণক্ষমতা উল্লেখযোগ্যভাবে বৃদ্ধি পায়।',
        'লেকচার দেখার সময় কখনোই নিষ্ক্রিয়ভাবে কেবল ভিডিও দেখা উচিত নয়। প্রতিটি গুরুত্বপূর্ণ পয়েন্টের সাথে সাথে নিজস্ব ভাষায় সংক্ষিপ্ত সামারি বা মাইন্ড ম্যাপ তৈরি করুন। ইউনিক টিচিং মেথডের ক্লাসরুমে প্রতিটি ক্লাসের সাথে রয়েছে বিষয়ভিত্তিক স্লাইড ও নোট—যা লেকচার শেষ হওয়ার সাথে সাথে একবার চোখ বুলিয়ে নিলে পড়া মস্তিষ্কে স্থায়ীভাবে গেঁথে যায়।',
        'নিয়মিত সেলফ-অ্যাসেসমেন্ট বা স্ব-মূল্যায়ন নিশ্চিত করুন। প্রতিটি অধ্যায় শেষে ফ্রি প্রশ্নব্যাংক ও এমসিকিউ পরীক্ষায় অংশ নিয়ে নিজের দুর্বলতাগুলো আগেভাগেই চিহ্নিত করে ফেলুন।',
      ],
      seoKeywords: 'এডটেক, ডিজিটাল লার্নিং, অনলাইন ক্লাস, পড়াশোনার কৌশল, ইউনিক টিচিং মেথড',
    },
    {
      title: 'অনলাইন লার্নিং ও সেলফ-অ্যাসেসমেন্ট: পরীক্ষার ভীতি কাটিয়ে সেরা রেজাল্টের রহস্য',
      slug: 'online-learning-and-self-assessment-exam-success',
      categorySlug: 'study-tips',
      tagSlugs: ['exam-tips', 'ssc-prep', 'hsc-prep'],
      excerpt: 'পরীক্ষার আগের রাতে না ঘুমিয়ে পড়ার অভ্যাস বদলে দিন। জানুন অ্যাক্টিভ রিকল এবং স্পেসড রিপিটিশন মেথডের বৈজ্ঞানিক কার্যকারিতা।',
      paragraphs: [
        'অধিকাংশ শিক্ষার্থী পরীক্ষার আগের রাতে অতিরিক্ত পড়ার চাপে মানসিকভাবে ভেঙে পড়ে। অথচ বৈজ্ঞানিকভাবে প্রমাণিত হয়েছে যে, পরীক্ষার সফলতার চাবিকাঠি হলো "অ্যাক্টিভ রিকল" (Active Recall) এবং "স্পেসড রিপিটিশন" (Spaced Repetition)।',
        'অ্যাক্টিভ রিকল হলো কোনো টপিক পড়ার পর বই বন্ধ করে নিজেকে প্রশ্ন করা—আমি এই মাত্র কী শিখলাম? এটি মস্তিষ্কের স্নায়বিক সংযোগকে শক্তিশালী করে এবং দীর্ঘস্থায়ী স্মৃতি তৈরিতে সহায়তা করে।',
        'স্পেসড রিপিটিশন অনুযায়ী, যেকোনো কঠিন বিষয় প্রথম দিন পড়ার পর তৃতীয় দিন, সপ্তম দিন এবং ত্রিশতম দিনে পুনরায় হালকা রিভিশন দেওয়া উচিত। এর ফলে পড়াশোনা কখনোই বোঝা মনে হবে না এবং পরীক্ষার হলে আত্মবিশ্বাস বজায় থাকবে।',
        'আমাদের ডিজিটাল এক্সাম পোর্টালে নিয়মিত টাইমড এমসিকিউ পরীক্ষা দিয়ে টাইমিং ও অ্যাকুরেসি বাড়ানোর নিয়মিত চর্চা বজায় রাখুন।',
      ],
      seoKeywords: 'পরীক্ষার টিপস, সেলফ অ্যাসেসমেন্ট, অ্যাক্টিভ রিকল, স্পেসড রিপিটিশন, এসএসসি ও এইচএসসি প্রস্তুতি',
    },
    {
      title: 'জরুরি ক্লাসরুম নোটিশ: নতুন শিক্ষাবর্ষের সকল ব্যাচের লাইভ সাপোর্ট ও ক্লাস রুটিন ঘোষণা',
      slug: 'important-classroom-notice-batch-live-support-schedule',
      categorySlug: 'notices',
      tagSlugs: ['notice', 'online-class'],
      excerpt: 'ইউনিক টিচিং মেথডের সকল নিবন্ধিত শিক্ষার্থীর অবগতির জন্য জানানো যাচ্ছে যে আগামী সপ্তাহ থেকে নতুন অধ্যায়ের লেকচার ও বিশেষ ডাউট ক্লিয়ারিং সেশন শুরু হচ্ছে।',
      paragraphs: [
        'ইউনিক টিচিং মেথড ডিজিটাল ক্লাসরুমের সকল শিক্ষার্থীদের জানানো যাচ্ছে যে, আগামী শনিবার থেকে বিজ্ঞান ও গণিত বিষয়ের নতুন অধ্যায়ের ভিডিও লেকচার ও প্র্যাকটিস শিট উন্মুক্ত করা হবে।',
        'যেসব শিক্ষার্থী কোনো নির্দিষ্ট লেকচারে সমস্যা অনুভব করবেন, তারা লেকচার পেজের নিচে থাকা "শিক্ষার্থী প্রশ্ন / রিপোর্ট" বাটন ব্যবহার করে সরাসরি আপনার সমস্যা লিখে পাঠাতে পারবেন। আমাদের ডেডিকেটেড কো-অর্ডিনেটর ও শিক্ষক টিম ২৪ ঘণ্টার মধ্যে সমাধান প্রদান করবেন।',
        'সকল শিক্ষার্থীকে তাদের ক্লাসরুম ড্যাশবোর্ড থেকে ক্লাস স্লাইড ও লেকচার নোট ডাউনলোড করে প্রিন্ট বা সেভ করে রাখার অনুরোধ করা হচ্ছে। যেকোনো টেকনিক্যাল বা পেমেন্ট সংক্রান্ত অনুসন্ধানের জন্য ড্যাশবোর্ডের সাপোর্ট পেজে যোগাযোগ করার আহ্বান জানানো যাচ্ছে।',
      ],
      seoKeywords: 'নোটিশ, ক্লাসরুম রুটিন, ডাউট ক্লিয়ারিং, ইউনিক টিচিং মেথড নোটিশ',
    },
    {
      title: 'পদার্থবিজ্ঞান ও রসায়ন সহজে মনে রাখার আধুনিক স্মার্ট নোট মেথড',
      slug: 'smart-note-taking-methods-for-physics-and-chemistry',
      categorySlug: 'science-math',
      tagSlugs: ['ssc-prep', 'hsc-prep', 'exam-tips'],
      excerpt: 'সূত্র ও বিক্রিয়া অন্ধের মতো মুখস্থ না করে কনসেপ্ট ম্যাপিং ও ভিজ্যুয়াল ডায়াগ্রাম দিয়ে বিজ্ঞানের জটিল বিষয়গুলো আয়ত্তে আনার কৌশল।',
      paragraphs: [
        'পদার্থবিজ্ঞানের গতিবিদ্যা, কাজ-ক্ষমতা-শক্তি কিংবা রসায়নের পর্যায় সারণি ও রাসায়নিক বন্ধন অনেক শিক্ষার্থীর কাছেই ভীতিকর মনে হতে পারে। তবে সঠিক নোট নেওয়ার কৌশল জানলে এই বিষয়গুলো অত্যন্ত আনন্দদায়ক হয়ে ওঠে।',
        'বিজ্ঞানের জন্য সবচেয়ে কার্যকর হলো "রিলেশন চার্ট" ও "ফ্লো-চার্ট"। সূত্রের প্রতিটি রাশির একক, মাত্রা এবং তাৎপর্য পাশাপাশি লিখে রাখলে অংক করার সময় কনফিউশন তৈরি হয় না।',
        'ফাইনম্যান টেকনিক (Feynman Technique) অনুযায়ী, কোনো জটিল সমীকরণ বা সূত্র শেখার পর তা এমনভাবে অন্য কাউকে বোঝানোর ভঙ্গি করুন যেন সে বিষয়টি প্রথম শুনছে। যদি সহজ ভাষায় বুঝিয়ে বলতে পারেন, তবেই বুঝবেন আপনার কনসেপ্ট সম্পূর্ণ পরিষ্কার হয়েছে।',
      ],
      seoKeywords: 'পদার্থবিজ্ঞান প্রস্তুতি, রসায়ন নোট, স্মার্ট নোট মেথড, ফাইনম্যান টেকনিক',
    },
    {
      title: 'এডটেক ও কৃত্রিম বুদ্ধিমত্তা: আধুনিক শিক্ষার্থীদের জন্য সময় সাশ্রয়ী শিক্ষার নতুন দিগন্ত',
      slug: 'ai-and-edtech-new-horizons-for-modern-students',
      categorySlug: 'edtech',
      tagSlugs: ['edtech', 'online-class'],
      excerpt: 'শিক্ষা প্রযুক্তির সঠিক ব্যবহারের মাধ্যমে কীভাবে নিজের দুর্বল বিষয়গুলো চিহ্নিত করবেন এবং পড়ার গতি দ্বিগুণ করবেন।',
      paragraphs: [
        'প্রযুক্তির যুগে শিক্ষার্থীরা কেবল গতানুগতিক কোচিং বা গাইড বইয়ের ওপর নির্ভরশীল নয়। আধুনিক এডটেক প্ল্যাটফর্মগুলোর মাধ্যমে প্রতিটি শিক্ষার্থীর ব্যক্তিগত লার্নিং পেস অনুযায়ী পড়ার সুযোগ সৃষ্টি হয়েছে।',
        'যে শিক্ষার্থী গণিতে ভালো কিন্তু রসায়নে দুর্বল, সে নিজের সুবিধাজনক সময়ে রসায়নের রেকর্ডেড ক্লাস বারবার দেখে নিজের ঘাটতি পূরণ করতে পারছে। কোনো ক্লাস মিস হওয়ার ভয় নেই, যানজটে সময় নষ্ট হওয়ার আশঙ্কা নেই।',
        'ইউনিক টিচিং মেথডের ডিজিটাল প্ল্যাটফর্ম এ লক্ষ্যেই তৈরি—যাতে বাংলাদেশের যেকোনো প্রান্ত থেকে প্রতিটি শিক্ষার্থী পায় সেরা ও মানসম্মত বিজ্ঞান ও গণিত শিক্ষার পূর্ণাঙ্গ নিশ্চয়তা।',
      ],
      seoKeywords: 'এডটেক ও এআই, অনলাইন লার্নিং প্ল্যাটফর্ম, ইউনিক টিচিং মেথড, বিজ্ঞান শিক্ষা',
    },
  ]

  for (const post of postsData) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })

    const categoryId = categoryMap.get(post.categorySlug)
    const tagIds = post.tagSlugs.map((s) => tagMap.get(s)).filter(Boolean)

    const postPayload = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: categoryId,
      tags: tagIds,
      content: buildLexicalContent(post.paragraphs),
      status: 'published',
      visibility: 'public',
      publishDate: new Date().toISOString(),
      seoKeywords: post.seoKeywords,
    }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'posts',
        id: existing.docs[0].id,
        data: postPayload as any,
      })
      console.log(`✓ Updated: ${post.title}`)
    } else {
      await payload.create({
        collection: 'posts',
        data: postPayload as any,
      })
      console.log(`+ Created: ${post.title}`)
    }
  }

  console.log('✅ EdTech Posts & Notices seeding completed successfully!')
  process.exit(0)
}

seedEdTechPosts().catch((err) => {
  console.error('Failed to seed edtech posts:', err)
  process.exit(1)
})

