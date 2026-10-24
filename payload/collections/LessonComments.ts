import type { CollectionConfig } from 'payload'

export const LessonComments: CollectionConfig = {
  slug: 'lesson-comments',
  labels: {
    singular: 'লেকচার কমেন্ট (Lecture Comment)',
    plural: 'লেকচার কমেন্টসমূহ (Lecture Comments)',
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['author', 'course', 'lessonId', 'status', 'createdAt'],
    group: 'Ecommerce',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if ((req.user as { role?: string }).role === 'admin') return true
      return {
        author: {
          equals: req.user.id,
        },
      }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if ((req.user as { role?: string }).role === 'admin') return true
      return {
        author: {
          equals: req.user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'কোর্স (Course)',
      admin: {
        description: 'যে কোর্সের লেকচারে কমেন্ট করা হয়েছে।',
      },
    },
    {
      name: 'lessonId',
      type: 'text',
      required: true,
      label: 'লেসন আইডি (Lesson ID)',
      admin: {
        description: 'কোর্সের সংশ্লিষ্ট লেকচারের নির্দিষ্ট আইডি।',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'মন্তব্যকারী (Author)',
      admin: {
        description: 'যে শিক্ষার্থী বা শিক্ষক মন্তব্য করেছেন।',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'মন্তব্য (Comment)',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'lesson-comments' as any,
      required: false,
      label: 'রিপ্লাই প্যারেন্ট (Parent Comment)',
      admin: {
        description: 'যদি এটি কোনো কমেন্টের উত্তর বা রিপ্লাই হয়।',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'মডারেশন স্ট্যাটাস',
      defaultValue: 'approved',
      options: [
        { label: '✅ প্রকাশিত (Approved)', value: 'approved' },
        { label: '⏳ অপেক্ষমাণ (Pending)', value: 'pending' },
        { label: '🚩 ফ্ল্যাগড (Flagged)', value: 'flagged' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

