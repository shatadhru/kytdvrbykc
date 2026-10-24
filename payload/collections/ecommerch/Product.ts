import { slugField } from 'payload'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import type { FieldAccess } from 'payload'

const adminOnlyFieldAccess: FieldAccess = ({ req }) => {
  return (req?.user as { role?: string })?.role === 'admin'
}

const generatePreviewPath = ({ slug }: { slug?: string | null }) => (slug ? `/store/${slug}` : '/store')

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => {
  // Filter out all variant-related fields from default ecommerce collection
  const sanitizedEcommerceFields = (defaultCollection.fields || []).filter((field: any) => {
    const fieldName = 'name' in field ? field.name : ''
    return !['enableVariants', 'variants', 'variantTypes', 'variantOptions'].includes(fieldName)
  })

  return {
    ...defaultCollection,

    admin: {
      ...defaultCollection?.admin,
      defaultColumns: ['title', 'priceInBDT', '_status'],
      livePreview: {
        url: ({ data }) => generatePreviewPath({ slug: data?.slug }),
      },
      preview: (data) => generatePreviewPath({ slug: (data?.slug as string) || '' }),
      useAsTitle: 'title',
    },

    access: {
      ...defaultCollection?.access,
    },

    defaultPopulate: {
      ...defaultCollection?.defaultPopulate,
      title: true,
      slug: true,
      thumbnail: true,
      introductoryVideo: true,
      gallery: true,
      priceInBDT: true,
      inventory: true,
      meta: true,
      teachers: true,
      coordinators: true,
      lessons: true,
    },

    hooks: {
      ...defaultCollection?.hooks,
      beforeValidate: [
        ...(defaultCollection?.hooks?.beforeValidate || []),
        ({ data }) => {
          if (data && (data as any).modules && !(data as any).lessons) {
            ;(data as any).lessons = (data as any).modules
          }
          return data
        },
      ],
      afterRead: [
        ...(defaultCollection?.hooks?.afterRead || []),
        ({ doc }) => {
          if (doc?.lessons && !doc?.modules) {
            doc.modules = doc.lessons
          }
          return doc
        },
      ],
    },

    fields: [
      { name: 'title', type: 'text', required: true },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Content',
            fields: [
              {
                name: 'thumbnail',
                type: 'upload',
                relationTo: 'media',
                required: true,
                label: 'Course Thumbnail',
                admin: {
                  description: 'Main thumbnail image for course cards and banners',
                },
              },
              {
                name: 'introductoryVideo',
                type: 'text',
                label: 'Introductory Video URL',
                admin: {
                  description: 'Public preview / trailer video URL (YouTube, Vimeo, etc.)',
                },
              },
              {
                name: 'introductoryVideoPreview',
                type: 'ui',
                admin: {
                  components: {
                    Field: './admin/components/YouTubePreview#YouTubePreview',
                  },
                },
              },
              {
                name: 'description',
                type: 'richText',
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ],
                }),
                label: false,
                required: false,
              },
              {
                name: 'gallery',
                type: 'array',
                minRows: 1,
                fields: [
                  {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            label: 'Curriculum & Faculty',
            fields: [
              {
                type: 'row',
                fields: [
                  {
                    name: 'teachers',
                    type: 'relationship',
                    relationTo: 'teachers',
                    hasMany: true,
                    label: 'Course Teachers / Instructors',
                    admin: {
                      width: '50%',
                      description: 'Select assigned course teachers and instructors',
                    },
                  },
                  {
                    name: 'coordinators',
                    type: 'relationship',
                    relationTo: 'coordinators',
                    hasMany: true,
                    label: 'Course Coordinators',
                    admin: {
                      width: '50%',
                      description: 'Select assigned course coordinators and mentors',
                    },
                  },
                ],
              },
              {
                name: 'lessons',
                type: 'array',
                label: 'Course Modules / Lessons',
                labels: {
                  singular: 'Lesson / Class',
                  plural: 'Lessons / Classes',
                },
                admin: {
                  description: 'Organize course curriculum, classes, durations, and protected video sources.',
                  initCollapsed: false,
                },
                fields: [
                  {
                    type: 'row',
                    fields: [
                      {
                        name: 'lessonTitle',
                        type: 'text',
                        required: true,
                        label: 'Lesson Title',
                        admin: {
                          width: '50%',
                          placeholder: 'e.g. Physics Chapter 1: Laws of Motion',
                        },
                      },
                      {
                        name: 'moduleName',
                        type: 'text',
                        label: 'Module / Chapter (Optional)',
                        admin: {
                          width: '50%',
                          placeholder: 'e.g. Module 1: Mechanics',
                        },
                      },
                    ],
                  },
                  {
                    type: 'row',
                    fields: [
                      {
                        name: 'duration',
                        type: 'text',
                        label: 'Duration',
                        admin: {
                          width: '33%',
                          placeholder: 'e.g. 45m or 12:30',
                        },
                      },
                      {
                        name: 'order',
                        type: 'number',
                        label: 'Order',
                        defaultValue: 1,
                        admin: {
                          width: '33%',
                          description: 'Sequential order of the class',
                        },
                      },
                      {
                        name: 'isFreePreview',
                        type: 'checkbox',
                        label: 'Free Preview (Allow trial access)',
                        defaultValue: false,
                        admin: {
                          width: '33%',
                          description: 'Allow non-enrolled students to watch this lesson',
                        },
                      },
                    ],
                  },
                  {
                    name: 'youtubeVideoIdOrUrl',
                    type: 'text',
                    label: 'YouTube Video ID or URL (Admin Only Hidden)',
                    access: {
                      read: adminOnlyFieldAccess,
                      update: adminOnlyFieldAccess,
                    },
                    admin: {
                      description:
                        'Admin-only hidden field for piracy protection. Hidden from public and non-admin queries.',
                      placeholder: 'e.g. https://youtu.be/... or video ID',
                    },
                  },
                  {
                    name: 'lessonVideoPreview',
                    type: 'ui',
                    admin: {
                      components: {
                        Field: './admin/components/YouTubePreview#YouTubePreview',
                      },
                    },
                  },
                  {
                    type: 'row',
                    fields: [
                      {
                        name: 'classSlide',
                        type: 'upload',
                        relationTo: 'media',
                        label: 'ক্লাস স্লাইড ফাইল (Class Slide - PPTX)',
                        admin: {
                          width: '50%',
                          description: 'লেকচারের প্রেজেন্টেশন স্লাইড (.pptx) ফাইল আপলোড করুন।',
                        },
                      },
                      {
                        name: 'classNote',
                        type: 'upload',
                        relationTo: 'media',
                        label: 'ক্লাস নোট ফাইল (Class Note - PDF, DOC, PPTX)',
                        admin: {
                          width: '50%',
                          description: 'লেকচার নোট (PDF, DOCX, PPTX) ফাইল আপলোড করুন।',
                        },
                      },
                    ],
                  },
                  {
                    type: 'row',
                    fields: [
                      {
                        name: 'classSlideUrl',
                        type: 'text',
                        label: 'স্লাইড ডিরেক্ট লিঙ্ক / Drive URL (Optional)',
                        admin: {
                          width: '50%',
                          placeholder: 'https://...',
                          description: 'স্লাইডের সরাসরি ডাউনলোড বা ড্রাইভ লিংক (যদি ক্লাউড স্টোরেজে থাকে)।',
                        },
                      },
                      {
                        name: 'classNoteUrl',
                        type: 'text',
                        label: 'নোট ডিরেক্ট লিঙ্ক / Drive URL (Optional)',
                        admin: {
                          width: '50%',
                          placeholder: 'https://...',
                          description: 'নোটের সরাসরি ডাউনলোড বা ভিউ লিংক (যদি ক্লাউড স্টোরেজে থাকে)।',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            label: 'Product Details',
            fields: [
              ...sanitizedEcommerceFields,
              {
                name: 'relatedProducts',
                type: 'relationship',
                filterOptions: ({ id }) =>
                  id ? { id: { not_in: [id] } } : { id: { exists: true } },
                hasMany: true,
                relationTo: 'products',
              },
            ],
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
        name: 'categories',
        type: 'relationship',
        admin: {
          position: 'sidebar',
          sortOptions: 'title',
        },
        hasMany: true,
        relationTo: 'categories',
      },
      slugField(),
    ],
  }
}

export const productCollectionOverride = ProductsCollection
export default ProductsCollection
