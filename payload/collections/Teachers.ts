import type { CollectionConfig } from 'payload'
import adminOnly from '@/payload/access/adminOnly'
import { TOP_50_SOCIAL_PLATFORMS } from '@/payload/globals/SiteSettings'
import { unicodeSlugify } from '@/payload/utils/unicodeSlug'
import { slugField } from 'payload'

export const Teachers: CollectionConfig = {
  slug: 'teachers',
  labels: {
    singular: 'Teacher',
    plural: 'Teachers',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'designation', 'email', 'order', 'isActive', 'updatedAt'],
    group: 'Academic',
    description: 'Manage course teachers, instructors, and faculty members.',
  },
  access: {
    create: adminOnly,
    read: () => true, // Publicly accessible so student & visitor can view instructors
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Teacher Name',
      admin: {
        placeholder: 'e.g. Dr. Rafiqul Islam',
      },
    },
    {
      name: 'designation',
      type: 'text',
      label: 'Designation / Subject Specialization',
      admin: {
        placeholder: 'e.g. Lead Physics Instructor / Senior Faculty',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Photo',
      admin: {
        description: 'Upload teacher profile image or avatar',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biography / Profile Summary',
      admin: {
        description: 'Short introduction, credentials, and achievements of the teacher',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          admin: {
            width: '50%',
            placeholder: 'teacher@example.com',
          },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
          admin: {
            width: '50%',
            placeholder: '+8801XXXXXXXXX',
          },
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Profiles',
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              label: 'Social Platform',
              required: true,
              defaultValue: 'facebook',
              options: TOP_50_SOCIAL_PLATFORMS,
              admin: {
                width: '40%',
              },
            },
            {
              name: 'url',
              type: 'text',
              label: 'Profile / Channel URL',
              required: true,
              defaultValue: 'https://',
              admin: {
                width: '60%',
                placeholder: 'https://...',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Linked User Account (Optional)',
      admin: {
        description: 'Link this instructor profile to their registered user account if they have one',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers display first in teacher lists',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active / Published',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Visible on course cards and instructor directory when enabled',
      },
    },
    slugField({
      useAsSlug: 'name',
      slugify: unicodeSlugify,
    }),
  ],
}

export default Teachers

