import type { CollectionConfig } from 'payload'
import adminOnly from '@/payload/access/adminOnly'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
  },
  access: {
    create: adminOnly,
    read: () => true,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'order', 'showOnHome', 'isActive', 'updatedAt'],
    group: 'Content',
    description: 'Frequently Asked Questions (FAQ) displayed on Homepage and Support.',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      label: 'Question (প্রশ্ন)',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      label: 'Answer (উত্তর)',
      required: true,
      admin: {
        rows: 4,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'order',
          type: 'number',
          label: 'Display Order',
          defaultValue: 1,
          admin: {
            width: '34%',
          },
        },
        {
          name: 'showOnHome',
          type: 'checkbox',
          label: 'Show on Homepage',
          defaultValue: true,
          admin: {
            width: '33%',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          label: 'Active / Published',
          defaultValue: true,
          admin: {
            width: '33%',
          },
        },
      ],
    },
  ],
}
