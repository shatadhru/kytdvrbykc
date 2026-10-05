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

export const Subjects: CollectionConfig = {
  slug: 'subjects',

  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },

  admin: {
    useAsTitle: 'title',
    group: 'Courses',

    defaultColumns: [
      'title',
      'createdAt',
      'updatedAt',
    ],
  },

  fields: [
    // ─────────────────────────────
    // Subject Title
    // ─────────────────────────────

    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      label: 'Subject Title',
      admin: {
        width: '100%',
        description: 'Enter the name of the subject.',
      },
    },

    // ─────────────────────────────
    // Subject Image
    // ─────────────────────────────

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Subject Image',
      admin: {
        position: 'sidebar',
        description: 'Add a cover image for this subject.',
      },
    },

    // ─────────────────────────────
    // Subject Status
    // ─────────────────────────────

    {
      name: 'status',
      type: 'select',
      label: 'Subject Status',
      defaultValue: 'active',

      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],

      admin: {
        position: 'sidebar',
        description: 'Control the current status of this subject.',
      },
    },

    // ─────────────────────────────
    // Classes
    // ─────────────────────────────

    {
      type: 'collapsible',
      label: 'Class Content',

      admin: {
        initCollapsed: false,
        width: '100%',
      },

      fields: [
        {
          name: 'classes',
          type: 'array',
          label: 'Classes',

          admin: {
            width: '100%',
            description:
              'Add classes with descriptions, slides, YouTube videos, and resources.',
          },

          fields: [
            // ─────────────────────
            // Class Title
            // ─────────────────────

            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Class Title',

              admin: {
                width: '100%',
                description: 'Enter the title of this class.',
                placeholder: 'e.g. Introduction to Motion',
              },
            },

            // ─────────────────────
            // Class Description
            // ─────────────────────

            {
              name: 'description',
              type: 'richText',
              label: 'Class Description',

              admin: {
                width: '100%',
                description:
                  'Write the description, learning objectives, or notes for this class.',
              },

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
            },

            // ─────────────────────
            // Class Slides
            // ─────────────────────

            {
              name: 'slideLink',
              type: 'text',
              label: 'Class Slides',

              admin: {
                width: '100%',
                description:
                  'Add the Google Slides, Google Drive, or presentation link.',
                placeholder: 'https://docs.google.com/...',
              },
            },

            // ─────────────────────
            // YouTube Video
            // ─────────────────────

            {
              name: 'youtubeLink',
              type: 'text',
              label: 'YouTube Video',

              admin: {
                width: '100%',
                description: 'Add the YouTube video URL for this class.',
                placeholder: 'https://www.youtube.com/watch?v=...',
              },
            },

            // ─────────────────────
            // Class Resource
            // ─────────────────────

            {
              name: 'upload',
              type: 'upload',
              relationTo: 'media',
              label: 'Class Resource',

              admin: {
                width: '100%',
                description:
                  'Upload a PDF, document, or other downloadable class resource.',
              },
            },
          ],
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