import type { GlobalConfig } from 'payload'

export const AISettings: GlobalConfig = {
  slug: 'ai-settings',
  label: 'পুচু AI Assistant Settings',
  admin: {
    group: 'AI Assistant',
    description: 'Manage Gemini API keys, Puchu AI persona, daily limits, and support links.',
  },
  access: {
    read: () => true,
    update: ({ req }) => {
      if (!req.user) return false
      return (req.user as { role?: string })?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enable Puchu AI Assistant on Homepage',
      defaultValue: true,
      admin: {
        description: 'Toggle the floating AI chat widget on or off on the homepage.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'botName',
          type: 'text',
          label: 'AI Bot Name',
          defaultValue: 'পুচু AI 🐱',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'botSubtitle',
          type: 'text',
          label: 'Bot Subtitle / Tagline',
          defaultValue: 'ইউনিক টিচিং মেথডের কিউট অ্যাসিস্ট্যান্ট 🐾',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'systemPrompt',
      type: 'textarea',
      label: 'AI System Instruction & Personality',
      defaultValue: `তুমি "পুচু AI" (Puchu AI) — দেলোয়ার স্যারের ইউনিক টিচিং মেথডের (UTM) এক অত্যন্ত মার্জিত, প্রফেশনাল, তথ্যবহুল ও সাহায্যকারী ডিজিটাল সহকারী (Cat Assistant 🐾)। তোমার কাজ শিক্ষার্থীদের পড়ালেখা ও কোর্স সম্পর্কিত সঠিক তথ্য দেওয়া।

গুরুত্বপূর্ণ নির্দেশনাবলী (কড়াকড়িভাবে প্রযোজ্য):
১. সালামের নিয়ম: প্রতি মেসেজে বারবার সালাম দেবে না। ব্যবহারকারী নিজে থেকে সালাম না দিলে অথবা আলোচনার শুরুতে একবার ছাড়া সালামের পুনরাবৃত্তি সম্পূর্ণ নিষিদ্ধ। সরাসরি টু-দ্য-পয়েন্ট ও প্রাসঙ্গিক উত্তর দেবে।
২. অ্যাকাডেমিক শালীনতা ও ফর্মালিটি: কথা হতে হবে পরিশীলিত, পরিমিত, ভদ্র ও মার্জিত। কোনো অপ্রাসঙ্গিক, অযৌক্তিক বা উল্টাপাল্টা কথা বলবে না। ফর্মালিটি ও প্রফেশনালিজম কঠোরভাবে বজায় রাখবে।
৩. কোর্স কার্ড প্রদর্শনের নিয়ম:
যখনই কোনো কোর্স সম্পর্কে তথ্য দেবে বা কোর্স রেকমেন্ড করবে, কোর্সের নামের পাশাপাশি অবশ্যই নিচে দেওয়া বিশেষ ট্যাগটি অন্তর্ভুক্ত করবে যাতে ব্যবহারকারী সরাসরি কোর্সের ছোট ছবি, নাম ও লিঙ্কে ক্লিক করে কোর্সে যেতে পারে:
[COURSE_CARD:{"title":"কোর্সের সঠিক নাম","slug":"সঠিক_slug","image":"ছবির_URL","price":"ফি"}]
(মনে রাখবে: ক্যাটালগ থেকে পাওয়া সঠিক title, slug, image ও price ব্যবহার করবে। image খালি থাকলে "" দেবে)।
৪. সবসময় সত্য ও সঠিক তথ্য দেবে। যে তথ্য জানা নেই, বিনীতভাবে হোয়াটসঅ্যাপ বা মেসেঞ্জারে যোগাযোগ করতে বলবে।
৫. কোনো গোপন ডেটা, পাসওয়ার্ড বা ইন্টারনাল কোড কখনো প্রকাশ করবে না।`,
      admin: {
        rows: 8,
        description: 'Control how Puchu AI behaves, greets students, and answers questions.',
      },
    },
    {
      name: 'geminiKeys',
      type: 'array',
      label: 'Gemini API Keys Pool (4-5 Keys)',
      labels: {
        singular: 'Gemini API Key',
        plural: 'Gemini API Keys',
      },
      admin: {
        description: 'Add 1 to 5 Google Gemini API keys. The system auto-rotates and fails over if quota is exceeded.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          label: 'API Key',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Account / Key Label (Optional)',
        },
      ],
    },
    {
      name: 'model',
      type: 'select',
      label: 'Gemini Model',
      defaultValue: 'gemini-flash-lite-latest',
      options: [
        { label: 'Gemini Flash Lite Latest (Fastest & High Availability)', value: 'gemini-flash-lite-latest' },
        { label: 'Gemini 3.5 Flash Lite (Lightweight & Rapid)', value: 'gemini-3.5-flash-lite' },
        { label: 'Gemini 3 Flash Preview', value: 'gemini-3-flash-preview' },
        { label: 'Gemini 3.5 Flash', value: 'gemini-3.5-flash' },
        { label: 'Gemini 3.8 Flash', value: 'gemini-3.8-flash' },
      ],
      admin: {
        description: 'Default LLM model for Puchu AI chat generation.',
      },
    },
    {
      type: 'collapsible',
      label: 'Daily Chat Limits',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'unpaidDailyLimit',
              type: 'number',
              label: 'Daily Limit for Unpaid / Guest Students',
              defaultValue: 3,
              min: 1,
              max: 100,
              admin: {
                width: '50%',
                description: 'Default: 3 questions per day for free visitors and non-enrolled students.',
              },
            },
            {
              name: 'enrolledDailyLimit',
              type: 'number',
              label: 'Daily Limit for Enrolled Students',
              defaultValue: 20,
              min: 1,
              max: 200,
              admin: {
                width: '50%',
                description: 'Default: 20 questions per day for students enrolled in at least one course.',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Support & Limit Exceeded Settings',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'limitReachedMessage',
          type: 'textarea',
          label: 'Friendly Limit Reached Message',
          defaultValue: 'মিউ 🐾 আজ তোমার প্রশ্ন করার দৈনিক কোটা শেষ হয়ে গেছে! কোনো বিষয় বুঝতে সমস্যা হলে বা ভর্তি সম্পর্কিত যেকোনো তথ্যের জন্য সরাসরি আমাদের শিক্ষক ও টিমের সাথে হোয়াটসঅ্যাপ বা মেসেঞ্জারে যোগাযোগ করতে পারো ❤️',
          admin: {
            rows: 3,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              label: 'Support WhatsApp Number / Link',
              defaultValue: '8801700000000',
              admin: {
                width: '50%',
                placeholder: '88017XXXXXXXX or https://wa.me/...',
              },
            },
            {
              name: 'messengerLink',
              type: 'text',
              label: 'Support Facebook Messenger Link',
              defaultValue: 'https://m.me/uniqueteachingmethod',
              admin: {
                width: '50%',
                placeholder: 'https://m.me/...',
              },
            },
          ],
        },
      ],
    },
  ],
}
