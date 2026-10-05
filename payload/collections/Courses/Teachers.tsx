import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/payload/access/adminOnly'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Teachers: CollectionConfig = {
  slug: 'teachers',

  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },

  admin: {
    useAsTitle: 'name',
    group: 'Courses',

    defaultColumns: [
      'name',
      'designation',
      'status',
      'createdAt',
      'updatedAt',
    ],
  },

  fields: [
    // ─────────────────────────────
    // Teacher Name
    // ─────────────────────────────

    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      label: 'Teacher Name',

      admin: {
        width: '100%',
        description: 'Enter the full name of the teacher.',
        placeholder: 'e.g. Delwar Hossain',
      },
    },

    // ─────────────────────────────
    // Profile Image
    // ─────────────────────────────

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Profile Image',

      admin: {
        position: 'sidebar',
        description: 'Upload a professional profile photo.',
      },
    },

    // ─────────────────────────────
    // Designation
    // ─────────────────────────────

    {
      name: 'designation',
      type: 'text',
      required: false,
      label: 'Designation',

      admin: {
        width: '100%',
        description: 'Enter the teacher designation or role.',
        placeholder: 'e.g. Senior Physics Instructor',
      },
    },

    // ─────────────────────────────
    // Short Bio
    // ─────────────────────────────

    {
      name: 'shortBio',
      type: 'textarea',
      label: 'Short Bio',

      admin: {
        width: '100%',
        description: 'A short introduction displayed on teacher cards.',
        placeholder: 'Write a short introduction about the teacher...',
      },
    },

    // ─────────────────────────────
    // Full Biography
    // ─────────────────────────────

    {
      name: 'bio',
      type: 'richText',
      label: 'Biography',

      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,

          HeadingFeature({
            enabledHeadingSizes: ['h2', 'h3', 'h4'],
          }),

          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HorizontalRuleFeature(),
        ],
      }),

      admin: {
        width: '100%',
        description:
          'Add the teacher biography, experience, education, achievements, and other details.',
      },
    },

    // ─────────────────────────────
    // Subjects
    // ─────────────────────────────

    {
      name: 'subjects',
      type: 'relationship',
      relationTo: 'subjects' as any,
      hasMany: true,
      label: 'Subjects',

      admin: {
        width: '100%',
        description: 'Select the subjects taught by this teacher.',
      },
    },

    // ─────────────────────────────
    // Status
    // ─────────────────────────────

    {
      name: 'status',
      type: 'select',
      label: 'Teacher Status',
      defaultValue: 'active',

      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Draft',
          value: 'draft',
        },
      ],

      admin: {
        position: 'sidebar',
        description: 'Control whether this teacher is currently active.',
      },
    },

    // ─────────────────────────────
    // Social & Contact
    // ─────────────────────────────

    {
      type: 'collapsible',
      label: 'Social & Contact',
      admin: {
        initCollapsed: true,
        width: '100%',
      },

      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook',

          admin: {
            width: '100%',
            placeholder: 'https://facebook.com/...',
          },
        },

        {
          name: 'youtube',
          type: 'text',
          label: 'YouTube',

          admin: {
            width: '100%',
            placeholder: 'https://youtube.com/...',
          },
        },

        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn',

          admin: {
            width: '100%',
            placeholder: 'https://linkedin.com/in/...',
          },
        },
      ],
    },

    // ─────────────────────────────
    // Slug
    // ─────────────────────────────

    slugField({
      position: 'sidebar',
    }),
  ],
}