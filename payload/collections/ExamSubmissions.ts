import type { CollectionConfig } from 'payload'

export const ExamSubmissions: CollectionConfig = {
  slug: 'exam-submissions',
  labels: {
    singular: 'পরীক্ষার ফলাফল (Exam Submission)',
    plural: 'পরীক্ষার ফলাফলসমূহ (Exam Submissions)',
  },
  admin: {
    useAsTitle: 'examTitle',
    defaultColumns: ['student', 'examTitle', 'score', 'percentage', 'passed', 'createdAt'],
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
    create: () => true, // Allowed for students and public visitors taking exams
    update: ({ req }) => (req?.user as { role?: string } | undefined)?.role === 'admin',
    delete: ({ req }) => (req?.user as { role?: string } | undefined)?.role === 'admin',
  },
  fields: [
    {
      name: 'examTitle',
      type: 'text',
      required: true,
      label: 'পরীক্ষার নাম (Exam Title)',
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      label: 'শিক্ষার্থী (Student)',
      admin: {
        description: 'পরীক্ষা দেওয়া শিক্ষার্থী (যদি লগইন করা থাকে)।',
      },
    },
    {
      name: 'studentName',
      type: 'text',
      required: false,
      label: 'শিক্ষার্থীর নাম',
    },
    {
      name: 'studentEmail',
      type: 'text',
      required: false,
      label: 'শিক্ষার্থীর ইমেইল',
    },
    {
      name: 'classLevel',
      type: 'text',
      required: false,
      label: 'শ্রেণি / ক্যাটাগরি (Class)',
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: 'বিষয় (Subject)',
    },
    {
      name: 'chapter',
      type: 'text',
      required: true,
      label: 'অধ্যায় (Chapter)',
    },
    {
      name: 'totalQuestions',
      type: 'number',
      required: true,
      label: 'মোট প্রশ্ন সংখ্যা',
    },
    {
      name: 'attempted',
      type: 'number',
      required: true,
      label: 'উত্তর করা হয়েছে',
    },
    {
      name: 'correctAnswers',
      type: 'number',
      required: true,
      label: 'সঠিক উত্তর',
    },
    {
      name: 'incorrectAnswers',
      type: 'number',
      required: true,
      label: 'ভুল উত্তর',
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      label: 'প্রাপ্ত নম্বর',
    },
    {
      name: 'percentage',
      type: 'number',
      required: true,
      label: 'শতকরা নম্বর (%)',
    },
    {
      name: 'timeTakenSeconds',
      type: 'number',
      required: true,
      label: 'ব্যয়িত সময় (সেকেন্ড)',
    },
    {
      name: 'passed',
      type: 'checkbox',
      label: 'উত্তীর্ণ (Passed)',
      defaultValue: false,
    },
    {
      name: 'answers',
      type: 'json',
      label: 'প্রশ্নের উত্তরসমূহ ও বিশদ (Detailed Answers)',
      admin: {
        description: 'শিক্ষার্থীর নির্বাচিত উত্তর এবং সঠিক উত্তরের বিবরণ।',
      },
    },
  ],
  timestamps: true,
}

