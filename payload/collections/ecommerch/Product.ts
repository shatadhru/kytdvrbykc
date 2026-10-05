import { slugField } from 'payload'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

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
