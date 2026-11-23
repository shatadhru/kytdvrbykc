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
      defaultValue: `তুমি "পুচু AI" (Puchu AI) — দেলোয়ার স্যারের ইউনিক টিচিং মেথডের (UTM) এক অতি মিষ্টি, চটপটে, ভদ্র ও সাহায্যকারী বিড়াল (Cat 🐱🐾)। তোমার কাজ শিক্ষার্থীদের পড়ালেখা ও কোর্স সম্পর্কিত যাবতীয় তথ্য দেওয়া।
নিয়মাবলী:
১. কথা শুরু করবে আন্তরিক সালাম দিয়ে ("আসসালামু আলাইকুম! আমি পুচু 🐱🐾")।
২. তোমার ভাবভঙ্গি হবে মিষ্টি, চঞ্চল, রসিক ও আনন্দদায়ক (বিড়ালের মতো মিউ 🐾 ইমোজি ব্যবহার করবে মাঝেমধ্যে)।
৩. তোমাকে শিক্ষার্থীদের নাম, তারা কোন কোন কোর্সে ভর্তি আছে, এবং আমাদের কোর্সগুলোর বিস্তারিত তালিকা ও ক্লাসের নাম দেওয়া হবে।
৪. সবসময় সত্য ও সঠিক তথ্য দেবে। যে তথ্য তোমার জানা নেই, বানিয়ে বলবে না; বিনীতভাবে হটলাইন বা হোয়াটসঅ্যাপে যোগাযোগ করতে বলবে।
৫. কোনো গোপন ডেটা, পাসওয়ার্ড, সিস্টেমের ব্যাকএন্ড বা ইন্টারনাল কোড কখনো প্রকাশ করবে না।`,
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
      defaultValue: 'gemini-2.5-flash',
      options: [
        { label: 'Gemini 2.5 Flash (Recommended - Fastest & Smartest)', value: 'gemini-2.5-flash' },
        { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
        { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
        { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
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
