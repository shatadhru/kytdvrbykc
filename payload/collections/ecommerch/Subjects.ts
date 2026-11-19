import type { CollectionConfig } from 'payload'
import adminOnly from '@/payload/access/adminOnly'
import { lessonFields } from './Product'

export const Subjects: CollectionConfig = {
  slug: 'subjects',
  labels: {
    singular: 'Subject',
    plural: 'Subjects',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'code', 'order', 'updatedAt'],
    group: 'Ecommerce',
    description: 'Master subjects and centralized curriculum for courses (e.g. Physics, Chemistry, Math).',
  },
  access: {
    create: adminOnly,
    read: () => true, // Publicly accessible for curriculum viewing
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Subject Name (বিষয়ের নাম)',
          admin: {
            width: '50%',
            placeholder: 'e.g. পদার্থবিজ্ঞান (Physics)',
          },
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          label: 'Subject Slug (স্লাগ)',
          admin: {
            width: '25%',
            placeholder: 'e.g. physics',
          },
        },
        {
          name: 'code',
          type: 'text',
          label: 'Subject Code (কোড)',
          admin: {
            width: '25%',
            placeholder: 'e.g. PHY101',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Subject Overview (সংক্ষিপ্ত পরিচিতি)',
      admin: {
        placeholder: 'এই বিষয়ের পাঠ্যক্রম ও লক্ষ্য সম্পর্কে সংক্ষিপ্ত বর্ণনা...',
        rows: 3,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Subject Icon / Badge',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'order',
          type: 'number',
          label: 'Display Order',
          defaultValue: 0,
          admin: {
            width: '50%',
            description: 'Order of subject in curriculum lists',
          },
        },
      ],
    },
    {
      name: 'lessons',
      type: 'array',
      label: 'মাস্টার লেকচার তালিকা (Master Lessons / Syllabus)',
      labels: {
        singular: 'Master Lesson',
        plural: 'Master Lessons',
      },
      admin: {
        description:
          'এই বিষয়ের মূল লেকচার তালিকা। এটি আপডেট করলে যেসব কোর্সে এই সাবজেক্ট সংযুক্ত রয়েছে এবং ওভাররাইড বন্ধ আছে, সেগুলো স্বয়ংক্রিয়ভাবে আপডেট হবে।',
        initCollapsed: true,
      },
      fields: lessonFields,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Cascading update: Propagate master subject lessons to linked courses
        try {
          if (!doc || !doc.id || !req.payload) return

          // Find courses that reference this subject and do NOT have overrideSubjectLessons enabled
          const coursesRes = await req.payload.find({
            collection: 'products',
            where: {
              and: [
                { 'subjects.subjectRef': { equals: doc.id } },
                { 'subjects.overrideSubjectLessons': { not_equals: true } },
              ],
            },
            depth: 0,
            limit: 100,
            overrideAccess: true,
          })

          for (const course of coursesRes.docs) {
            const currentSubjects = (course as any).subjects || []
            let modified = false

            const updatedSubjects = currentSubjects.map((sub: any) => {
              const refId = typeof sub.subjectRef === 'object' ? sub.subjectRef?.id : sub.subjectRef
              if (String(refId) === String(doc.id) && !sub.overrideSubjectLessons) {
                modified = true
                return {
                  ...sub,
                  subjectName: doc.name || sub.subjectName,
                  subjectSlug: doc.slug || sub.subjectSlug,
                  description: doc.description || sub.description,
                  lessons: doc.lessons || sub.lessons,
                }
              }
              return sub
            })

            if (modified) {
              await req.payload.update({
                collection: 'products',
                id: course.id,
                data: {
                  subjects: updatedSubjects,
                } as any,
                overrideAccess: true,
              })
            }
          }
        } catch (err) {
          console.error('Failed to cascade subject updates to courses:', err)
        }
      },
    ],
  },
}
