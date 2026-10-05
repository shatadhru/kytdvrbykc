import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/payload/access/adminOnly'

export const Classes: CollectionConfig = {
  slug: 'classes',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Courses',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
