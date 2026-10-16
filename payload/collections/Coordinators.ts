import type { CollectionConfig } from 'payload'
import adminOnly from '@/payload/access/adminOnly'
import { TOP_50_SOCIAL_PLATFORMS } from '@/payload/globals/SiteSettings'
import { unicodeSlugify } from '@/payload/utils/unicodeSlug'
import { slugField } from 'payload'

export const Coordinators: CollectionConfig = {
  slug: 'coordinators',
  labels: {
    singular: 'Coordinator',
    plural: 'Coordinators',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'designation', 'email', 'order', 'isActive', 'updatedAt'],
    group: 'Academic',
    description: 'Manage course coordinators and academic support members.',
  },
  access: {
    create: adminOnly,
    read: () => true, // Publicly accessible for student guidance & contact
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Coordinator Name',
      admin: {
        placeholder: 'e.g. Tanvir Ahmed',
      },
    },
    {
      name: 'designation',
      type: 'text',
      label: 'Designation / Role',
      admin: {
        placeholder: 'e.g. Lead Academic Coordinator / Batch Support Lead',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Photo',
      admin: {
        description: 'Upload coordinator profile image or avatar',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biography / Responsibilities',
      admin: {
        description: 'Short introduction and responsibilities of the coordinator',
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
            placeholder: 'coordinator@example.com',
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
        description: 'Link this coordinator profile to their registered user account if they have one',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers display first in coordinator lists',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active / Published',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Visible on course cards and support directory when enabled',
      },
    },
    slugField({
      useAsSlug: 'name',
      slugify: unicodeSlugify,
    }),
  ],
}

export default Coordinators

