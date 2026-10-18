import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  labels: {
    singular: 'এনরোলমেন্ট (Enrollment)',
    plural: 'এনরোলমেন্টসমূহ (Enrollments)',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['student', 'course', 'order', 'status', 'enrolledAt'],
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
    create: ({ req }) => (req?.user as { role?: string } | undefined)?.role === 'admin',
    update: ({ req }) => (req?.user as { role?: string } | undefined)?.role === 'admin',
    delete: ({ req }) => (req?.user as { role?: string } | undefined)?.role === 'admin',
  },
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'শিক্ষার্থী (Student)',
      admin: {
        description: 'এনরোলকৃত শিক্ষার্থী।',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'কোর্স (Course)',
      admin: {
        description: 'এনরোল করা কোর্স।',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: false,
      label: 'অর্ডার রেফারেন্স (Order)',
      admin: {
        description: 'যে অর্ডারের মাধ্যমে এনরোলমেন্ট তৈরি হয়েছে।',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'স্ট্যাটাস',
      defaultValue: 'active',
      options: [
        { label: '✅ সক্রিয় (Active)', value: 'active' },
        { label: '⏸️ স্থগিত (Suspended)', value: 'suspended' },
        { label: '❌ বাতিল (Revoked)', value: 'revoked' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'enrolledAt',
      type: 'date',
      label: 'এনরোলমেন্টের তারিখ',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

