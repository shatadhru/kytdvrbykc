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

export const Coordinators: CollectionConfig = {
  slug: 'coordinators',

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
    // Coordinator Name
    // ─────────────────────────────

    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      label: 'Coordinator Name',

      admin: {
        width: '100%',
        description: 'Enter the full name of the coordinator.',
        placeholder: 'e.g. Md. Rahim Uddin',
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
        description: 'Enter the coordinator designation or role.',
        placeholder: 'e.g. Academic Coordinator',
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
        description: 'A short introduction displayed on coordinator cards.',
        placeholder: 'Write a short introduction...',
      },
    },

    // ─────────────────────────────
    // Biography
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
          'Add the coordinator biography, experience, responsibilities, and other details.',
      },
    },

    // ─────────────────────────────
    // Contact Information
    // ─────────────────────────────

    {
      type: 'collapsible',
      label: 'Contact Information',

      admin: {
        initCollapsed: true,
        width: '100%',
      },

      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',

          admin: {
            width: '100%',
            placeholder: '+880 1XXX-XXXXXX',
          },
        },

        {
          name: 'email',
          type: 'email',
          label: 'Email Address',

          admin: {
            width: '100%',
            placeholder: 'coordinator@example.com',
          },
        },
      ],
    },

    // ─────────────────────────────
    // Social Links
    // ─────────────────────────────

    {
      type: 'collapsible',
      label: 'Social Links',

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
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn',

          admin: {
            width: '100%',
            placeholder: 'https://linkedin.com/in/...',
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
      ],
    },

    // ─────────────────────────────
    // Status
    // ─────────────────────────────

    {
      name: 'status',
      type: 'select',
      label: 'Coordinator Status',
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
        description: 'Control the current status of this coordinator.',
      },
    },

    // ─────────────────────────────
    // Slug
    // ─────────────────────────────

    slugField({
      position: 'sidebar',
    }),
  ],
}