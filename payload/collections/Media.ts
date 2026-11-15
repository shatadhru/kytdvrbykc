import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user && (req.user as { role?: string }).role === 'admin'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'externalUrl',
      type: 'text',
      label: 'External Image URL',
      admin: {
        description: 'Direct image URL if hosted externally (e.g. utmeducation.com or CDN)',
      },
    },
  ],
  upload: true,
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (doc?.cloudinary?.secure_url) {
          doc.url = doc.cloudinary.secure_url
        } else if (doc?.externalUrl) {
          doc.url = doc.externalUrl
        } else if (doc?.url && typeof doc.url === 'string' && doc.url.startsWith('http')) {
          doc.url = doc.url
        }
        return doc
      },
    ],
  },
}
