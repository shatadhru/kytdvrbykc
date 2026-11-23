import type { CollectionConfig } from 'payload'
import adminOnly from '@/payload/access/adminOnly'

export const Resources: CollectionConfig = {
  slug: 'resources',
  labels: {
    singular: 'Free Resource',
    plural: 'Free Resources',
  },
  access: {
    create: adminOnly,
    read: () => true,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'type', 'isFeatured', 'isActive', 'order'],
    group: 'Content',
    description: 'Manage free resources, study materials, PDFs, and video lectures.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Resource Title',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'text',
          label: 'Batch / Category',
          defaultValue: 'এস এস সি - ২০২৭',
          admin: {
            width: '50%',
            description: 'e.g. এস এস সি - ২০২৭, এস এস সি - ২০২৮, এইচ এস সি - ২০২৭, এইচ এস সি - ২০২৮, ইত্যাদি।',
          },
        },
        {
          name: 'type',
          type: 'select',
          label: 'Resource Type',
          defaultValue: 'video',
          options: [
            { label: 'Video Class / ক্লাস ভিডিও', value: 'video' },
            { label: 'PDF Lecture Sheet / লেকচার শিট', value: 'pdf' },
            { label: 'Exam Questions / প্রশ্নব্যাংক', value: 'exam' },
            { label: 'External Resource / অন্যান্য', value: 'link' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail Image (Optional)',
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Direct Image URL (Alternative / CDN)',
    },
    {
      name: 'url',
      type: 'text',
      label: 'Resource Target URL / Link',
      defaultValue: '/video',
      required: true,
      admin: {
        description: 'Link to free class (/video), PDF drive link, or lesson link.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'badge',
          type: 'text',
          label: 'Badge Text',
          defaultValue: 'বিনামূল্যে',
          admin: {
            width: '33%',
          },
        },
        {
          name: 'order',
          type: 'number',
          label: 'Sort Order',
          defaultValue: 1,
          admin: {
            width: '33%',
          },
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          label: 'Show on Homepage',
          defaultValue: true,
          admin: {
            width: '17%',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          label: 'Active',
          defaultValue: true,
          admin: {
            width: '17%',
          },
        },
      ],
    },
  ],
}
