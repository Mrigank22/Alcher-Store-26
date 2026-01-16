import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'userName',
    defaultColumns: ['userName', 'product_id', 'rating', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'product_id',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Product ID this review belongs to',
      },
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this review',
      },
    },
    {
      name: 'userName',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the reviewer',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Review content',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Rating from 1 to 5',
      },
    },
    {
      name: 'userImage',
      type: 'text',
      admin: {
        description: 'URL of user profile image',
      },
    },
  ],
  timestamps: true,
}
