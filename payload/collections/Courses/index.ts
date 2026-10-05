import { slugField } from 'payload'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export { Classes } from './Classes'
export { Coordinators } from './Coordinators'
export { Enrollment } from './Enrollment'
export { Subjects } from './Subjects'
export { Teachers } from './Teachers'

const generatePreviewPath = ({ slug }: { slug?: string | null }) =>
  slug ? `/courses/${slug}` : '/courses'

export const ProductsCollection: CollectionOverride = ({
  defaultCollection,
}) => ({
  ...defaultCollection,

  labels: {
    singular: 'Course',
    plural: 'Courses',
  },

  admin: {
    ...defaultCollection?.admin,

    defaultColumns: [
      'title',
      'isfree',
      'enableVariants',
      '_status',
      'variants.variants',
    ],

    livePreview: {
      url: ({ data }) => generatePreviewPath({ slug: data?.slug }),
    },

    group: 'Courses',

    preview: (data) => generatePreviewPath({ slug: data?.slug as string }),

    useAsTitle: 'title',
  },

  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,

    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    inventory: true,
    meta: true,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Course Title',
    },

    {
      type: 'tabs',

      tabs: [
        {
          fields: [
            {
              name: 'description',

              type: 'richText',

              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,

                    HeadingFeature({
                      enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'],
                    }),

                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),

              label: false,
              required: false,
            },
          ],

          label: 'Descriptions',
        },

        {
          fields: [
            ...defaultCollection.fields,

            {
              name: 'relatedProducts',

              type: 'relationship',

              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                return {
                  id: {
                    exists: true,
                  },
                }
              },

              hasMany: true,
              relationTo: 'products',
            },
          ],

          label: 'Course Details',
        },

        {
          name: 'meta',

          label: 'SEO',

          fields: [
            { name: 'title', type: 'text', label: 'Meta Title' },
            { name: 'description', type: 'textarea', label: 'Meta Description' },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Meta Image' },
          ],
        },
      ],
    },
    {
      name: 'backgroundVideo',
      type: 'text',
      label: 'Background Video (YouTube)',
      required: false,
      admin: {
        position: 'sidebar',
        description:
          'Optional YouTube video URL. Example: https://www.youtube.com/watch?v=VIDEO_ID',
      },
    },

    {
      name: 'backgroundImage',

      type: 'upload',

      relationTo: 'media',

      required: true,

      admin: {
        position: 'sidebar',
      },
    },

    slugField(),

    // -----------------------------------------
    // COURSE TYPE
    // -----------------------------------------

    {
      name: 'isfree',

      type: 'select',

      label: 'Course Type',

      required: true,

      defaultValue: 'paid',

      options: [
        {
          label: 'Free',
          value: 'free',
        },
        {
          label: 'Paid',
          value: 'paid',
        },
      ],

      admin: {
        position: 'sidebar',

        description:
          'Free courses automatically use 0 price.',
      },

      hooks: {
        beforeChange: [
          ({ value, data }) => {
            if (value === 'free' && data) {
              if ('price' in data) {
                data.price = 0
              }

              if (
                data.variants &&
                typeof data.variants === 'object' &&
                Array.isArray(data.variants)
              ) {
                data.variants = data.variants.map((variant: any) => ({
                  ...variant,
                  price: 0,
                }))
              }
            }

            return value
          },
        ],
      },
    },

    // -----------------------------------------
    // CATEGORIES
    // -----------------------------------------

    {
      name: 'categories',

      type: 'relationship',

      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },

      hasMany: true,

      relationTo: 'categories',
    },

    // -----------------------------------------
    // SUBJECTS
    // -----------------------------------------

    {
      name: 'subjects',

      type: 'relationship',

      relationTo: 'subjects' as any,

      required: true,

      hasMany: true,

      admin: {
        position: 'sidebar',
      },
    },

    // -----------------------------------------
    // TEACHERS
    // -----------------------------------------

    {
      name: 'teachers',

      type: 'relationship',

      relationTo: 'teachers' as any,

      required: true,

      hasMany: true,

      admin: {
        position: 'sidebar',
      },
    },

    // -----------------------------------------
    // COORDINATORS
    // -----------------------------------------

    {
      name: 'coordinators',

      type: 'relationship',

      relationTo: 'coordinators' as any,

      required: true,

      hasMany: true,

      admin: {
        position: 'sidebar',
      },
    },
  ],
})