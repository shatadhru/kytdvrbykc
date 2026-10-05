import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/payload/access/adminOnly'

export const Enrollment: CollectionConfig = {
  slug: 'enrollment',

  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
 indexes: [
    {
      fields: ['user', 'courses'],
      unique: true,
    },
  ],
  admin: {
    useAsTitle: 'title',
    group: 'Courses',
  },

    trash: true,

hooks: {
  beforeValidate: [
    async ({ data, req, operation, originalDoc }) => {
      if (!data?.user || !data?.courses?.length) {
        return data
      }

      const userId =
        typeof data.user === 'object'
          ? data.user.id
          : data.user

      for (const course of data.courses) {
        const courseId =
          typeof course === 'object'
            ? course.id
            : course

        const existing = await req.payload.find({
          collection: 'enrollment' as any,
          where: {
            and: [
              {
                user: {
                  equals: userId,
                },
              },
              {
                courses: {
                  contains: courseId,
                },
              },
            ],
          },
          limit: 1,
        })

        // Update করার সময় নিজের document বাদ দিতে হবে
        const isSameDocument =
          existing.docs[0]?.id === originalDoc?.id

        if (existing.docs.length > 0 && !isSameDocument) {
          throw new Error(
            'This user is already enrolled in one of the selected courses.',
          )
        }
      }

      return data
    },
  ],

  beforeChange: [
    async ({ data, req }) => {
      if (data?.user) {
        const userId =
          typeof data.user === 'object'
            ? data.user.id
            : data.user

        const user = await req.payload.findByID({
          collection: 'users',
          id: userId,
        })

        data.title = user.name
      }

      return data
    },
  ],
},
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },

    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      hasMany: true,
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
        {
          label: 'Expired',
          value: 'expired',
        },
      ],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'enrolledAt',
      type: 'date',
      defaultValue: () => new Date(),
      required: true,
    },

    {
      name: 'expiresAt',
      type: 'date',
    },

    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'free',
      options: [
        {
          label: 'Free',
          value: 'free',
        },
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Paid',
          value: 'paid',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
        {
          label: 'Refunded',
          value: 'refunded',
        },
      ],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'transactionId',
      type: 'text',
      index: true,
    },

    slugField({
      position: undefined,
    }),
  ],
}