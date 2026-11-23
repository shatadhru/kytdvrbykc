import type { CollectionConfig } from 'payload'
import adminOnly from '@/payload/access/adminOnly'

export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  labels: {
    singular: 'Hero Slide',
    plural: 'Hero Slides',
  },
  access: {
    create: adminOnly,
    read: () => true,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'isActive', 'link', 'updatedAt'],
    group: 'Content',
    description: 'Manage slide images for the Homepage Hero Carousel. Defaults are shown if empty.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Slide Title / Caption',
      required: true,
      admin: {
        description: 'Internal reference and image alt tag (e.g. "SSC-27 Chemistry Course").',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Upload Slide Image',
      admin: {
        description: 'Upload banner image to Media library (recommended: 16:9 ratio, 1536x864 or 960x540).',
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Direct Image URL (Alternative / CDN)',
      admin: {
        description: 'Direct Cloudinary or image CDN link if not uploading a media file.',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Destination Link',
      defaultValue: '/video',
      admin: {
        description: 'Where clicking the slide leads to (e.g. /video, /courses, or a course link).',
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
            width: '50%',
            description: 'Lower numbers display first.',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          label: 'Active / Visible',
          defaultValue: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
}
