import type { CollectionConfig } from 'payload'

export const LessonReports: CollectionConfig = {
  slug: 'lesson-reports',
  labels: {
    singular: 'লেকচার রিপোর্ট (Lesson Report)',
    plural: 'লেকচার রিপোর্টসমূহ (Lesson Reports)',
  },
  admin: {
    useAsTitle: 'lessonTitle',
    defaultColumns: ['lessonTitle', 'issueType', 'studentName', 'status', 'createdAt'],
    group: 'Ecommerce',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if ((req.user as { role?: string }).role === 'admin') return true
      return {
        student: {
          equals: req.user.id,
        },
      }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => (req?.user as { role?: string } | undefined)?.role === 'admin',
    delete: ({ req }) => (req?.user as { role?: string } | undefined)?.role === 'admin',
  },
  fields: [
    {
      name: 'lessonTitle',
      type: 'text',
      required: true,
      label: 'লেকচারের নাম (Lesson Title)',
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'কোর্স (Course)',
      admin: {
        description: 'যে কোর্সের লেকচারে সমস্যা হয়েছে।',
      },
    },
    {
      name: 'lessonId',
      type: 'text',
      required: true,
      label: 'লেসন আইডি (Lesson ID)',
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'শিক্ষার্থী (Student)',
    },
    {
      name: 'studentName',
      type: 'text',
      label: 'শিক্ষার্থীর নাম',
    },
    {
      name: 'studentEmail',
      type: 'text',
      label: 'শিক্ষার্থীর ইমেইল',
    },
    {
      name: 'issueType',
      type: 'select',
      required: true,
      label: 'সমস্যার ধরন (Issue Type)',
      options: [
        { label: '🎥 ভিডিও প্লেব্যাক সমস্যা (Video Not Playing/Lagging)', value: 'video_error' },
        { label: '🔊 সাউন্ড বা অডিও সমস্যা (Audio/Sound Issue)', value: 'audio_issue' },
        { label: '📄 নোট বা স্লাইড সমস্যা (Note/Slide Download Problem)', value: 'material_issue' },
        { label: '⚠️ ভুল তথ্য বা বিষয়বস্তুর অসঙ্গতি (Content Mistake)', value: 'content_mistake' },
        { label: '💬 অন্যান্য সমস্যা (Other)', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'সমস্যার বিবরণ (Report Description)',
    },
    {
      name: 'status',
      type: 'select',
      label: 'স্ট্যাটাস (Status)',
      defaultValue: 'pending',
      options: [
        { label: '⏳ অপেক্ষমাণ (Pending)', value: 'pending' },
        { label: '🔍 পর্যালোচনাধীন (In Review)', value: 'in_review' },
        { label: '✅ সমাধান হয়েছে (Resolved)', value: 'resolved' },
        { label: '❌ বাতিল (Dismissed)', value: 'dismissed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'অ্যাডমিন নোট (Admin Notes)',
      admin: {
        position: 'sidebar',
        description: 'সমস্যা সমাধানের জন্য অ্যাডমিনের অভ্যন্তরীণ মন্তব্য।',
      },
    },
  ],
  timestamps: true,
}

