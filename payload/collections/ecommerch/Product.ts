import { slugField } from 'payload'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { Field, FieldAccess } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { QURAN_MOTIVATIONAL_VERSES } from '@/payload/data/quranVerses'

const adminOnlyFieldAccess: FieldAccess = ({ req }) => {
  return (req?.user as { role?: string })?.role === 'admin'
}

const generatePreviewPath = ({ slug }: { slug?: string | null }) => (slug ? `/store/${slug}` : '/store')

export const lessonFields: Field[] = [
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
    type: 'row',
    fields: [
      {
        name: 'subjectName',
        type: 'text',
        label: 'বিষয় (Subject Name)',
        admin: {
          width: '50%',
          placeholder: 'যেমন: পদার্থবিজ্ঞান বা রসায়ন',
          description: 'যদি এই লেকচারটি নির্দিষ্ট বিষয়ের অধীনে থাকে।',
        },
      },
      {
        name: 'subjectSlug',
        type: 'text',
        label: 'বিষয় স্লাগ / কোড (Subject Slug)',
        admin: {
          width: '50%',
          placeholder: 'যেমন: physics বা chemistry',
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
  {
    type: 'row',
    fields: [
      {
        name: 'quranVersePreset',
        type: 'select',
        label: 'অনুপ্রেরণামূলক কুরআনের আয়াত (Motivational Quranic Verse)',
        defaultValue: 'none',
        options: [
          { label: 'কোনো আয়াত নেই (None)', value: 'none' },
          ...QURAN_MOTIVATIONAL_VERSES.map((v) => ({
            label: `${v.surah} - ${v.theme} (${v.bangla.slice(0, 35)}...)`,
            value: v.id,
          })),
          { label: '➕ কাস্টম আয়াত যোগ করুন (Add Custom Verse)', value: 'custom' },
        ],
        admin: {
          width: '100%',
          description:
            'ক্লাস শুরুর সময় শিক্ষার্থীকে অনুপ্রেরণামূলক পপআপ দেখাতে একটি কুরআনের আয়াত নির্বাচন করুন।',
        },
      },
    ],
  },
  {
    type: 'row',
    admin: {
      condition: (_data, siblingData) => siblingData?.quranVersePreset === 'custom',
    },
    fields: [
      {
        name: 'customVerseSurah',
        type: 'text',
        label: 'সূরা ও আয়াতের নাম/রেফারেন্স (Surah Reference)',
        admin: {
          width: '30%',
          placeholder: 'যেমন: সূরা আশ-শারহ (৯৪:৫)',
        },
      },
      {
        name: 'customVerseArabic',
        type: 'text',
        label: 'আরবি আয়াত (Arabic Verse)',
        admin: {
          width: '35%',
          placeholder: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
        },
      },
      {
        name: 'customVerseBangla',
        type: 'text',
        label: 'বাংলা অনুবাদ (Bangla Translation)',
        admin: {
          width: '35%',
          placeholder: 'নিশ্চয় কষ্টের সাথেই স্বস্তি আছে।',
        },
      },
    ],
  },
]

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
      subjects: true,
    },

    hooks: {
      ...defaultCollection?.hooks,
      beforeValidate: [
        ...(defaultCollection?.hooks?.beforeValidate || []),
        ({ data }) => {
          if (!data) return data

          // 1. If subjects are provided with lessons, flatten them into data.lessons
          if (Array.isArray(data.subjects) && data.subjects.length > 0) {
            const flattened: any[] = []
            for (const sub of data.subjects) {
              const subName = (sub.subjectName || '').trim() || 'General'
              const subSlug =
                (sub.subjectSlug || sub.subjectName || 'general')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '') || 'general'

              if (Array.isArray(sub.lessons)) {
                for (const l of sub.lessons) {
                  flattened.push({
                    ...l,
                    subjectName: subName,
                    subjectSlug: subSlug,
                  })
                }
              }
            }
            if (flattened.length > 0) {
              ;(data as any).lessons = flattened
            }
          } else if (
            Array.isArray(data.lessons) &&
            data.lessons.length > 0 &&
            (!data.subjects || data.subjects.length === 0)
          ) {
            // 2. If flat lessons are provided without subjects, group them into subjects
            const groups = new Map<string, any[]>()
            for (const l of data.lessons) {
              const subName = (l.subjectName || l.moduleName || 'সাধারণ বিষয় (General)').trim()
              if (!groups.has(subName)) groups.set(subName, [])
              groups.get(subName)!.push(l)
            }
            const builtSubjects = Array.from(groups.entries()).map(([subName, subLessons]) => ({
              subjectName: subName,
              subjectSlug:
                subName
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '') || 'general',
              lessons: subLessons,
            }))
            ;(data as any).subjects = builtSubjects
          }

          if (data && (data as any).modules && !(data as any).lessons) {
            ;(data as any).lessons = (data as any).modules
          }
          return data
        },
      ],
      afterRead: [
        ...(defaultCollection?.hooks?.afterRead || []),
        ({ doc }) => {
          if (!doc) return doc

          // Auto-group flat lessons into subjects if subjects is empty
          if (
            (!doc.subjects || doc.subjects.length === 0) &&
            Array.isArray(doc.lessons) &&
            doc.lessons.length > 0
          ) {
            const groups = new Map<string, any[]>()
            for (const l of doc.lessons) {
              const subName = (l.subjectName || l.moduleName || 'সাধারণ বিষয় (General)').trim()
              if (!groups.has(subName)) groups.set(subName, [])
              groups.get(subName)!.push(l)
            }
            doc.subjects = Array.from(groups.entries()).map(([subName, subLessons]) => ({
              subjectName: subName,
              subjectSlug:
                subName
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '') || 'general',
              lessons: subLessons,
            }))
          }

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
                name: 'subjects',
                type: 'array',
                label: 'কোর্সের বিষয়সমূহ ও পাঠ্যক্রম (Course Subjects & Curriculum)',
                labels: {
                  singular: 'বিষয় (Subject)',
                  plural: 'বিষয়সমূহ (Subjects)',
                },
                admin: {
                  description:
                    'এই কোর্সে একাধিক বিষয় (যেমন: পদার্থবিজ্ঞান, রসায়ন, গণিত) যুক্ত করুন এবং প্রতিটি বিষয়ের অধীনে লেকচার সাজান।',
                  initCollapsed: false,
                },
                fields: [
                  {
                    type: 'row',
                    fields: [
                      {
                        name: 'subjectName',
                        type: 'text',
                        required: true,
                        label: 'বিষয়ের নাম (Subject Name)',
                        admin: {
                          width: '50%',
                          placeholder: 'যেমন: পদার্থবিজ্ঞান (Physics)',
                        },
                      },
                      {
                        name: 'subjectSlug',
                        type: 'text',
                        label: 'বিষয় স্লাগ / কোড (Subject Slug)',
                        admin: {
                          width: '50%',
                          placeholder: 'যেমন: physics বা chemistry',
                        },
                      },
                    ],
                  },
                  {
                    name: 'description',
                    type: 'textarea',
                    label: 'বিষয়ের সংক্ষিপ্ত পরিচিতি (Optional)',
                    admin: {
                      rows: 2,
                      placeholder: 'এই বিষয়ের পাঠ্যক্রম সম্পর্কে সংক্ষিপ্ত নোট...',
                    },
                  },
                  {
                    name: 'lessons',
                    type: 'array',
                    label: 'এই বিষয়ের লেকচারসমূহ (Modules / Lessons)',
                    labels: {
                      singular: 'লেকচার / ক্লাস',
                      plural: 'লেকচারসমূহ / ক্লাসসমূহ',
                    },
                    admin: {
                      initCollapsed: true,
                    },
                    fields: lessonFields,
                  },
                ],
              },
              {
                name: 'lessons',
                type: 'array',
                label: 'কোর্সের সরাসরি লেকচার তালিকা (All Lessons / Direct)',
                labels: {
                  singular: 'Lesson / Class',
                  plural: 'Lessons / Classes',
                },
                admin: {
                  description:
                    'কোর্সের সামগ্রিক লেকচার তালিকা। বিষয়সমূহ থেকে স্বয়ংক্রিয়ভাবে সিঙ্ক হয় অথবা সরাসরি একক বিষয়ের লেকচার যোগ করতে পারেন।',
                  initCollapsed: true,
                },
                fields: lessonFields,
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
