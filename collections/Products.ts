import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'product_id', // Keeping your custom ID
      type: 'text',
      unique: true,
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media', // Links to the Media collection
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'hasSize',
      type: 'checkbox',
    },
    {
      name: 'hasColor',
      type: 'checkbox',
    },
    {
      name: 'variants', // Your variants array
      type: 'array',
      fields: [
        {
          name: 'size',
          type: 'select',
          options: ['S', 'M', 'L', 'XL'],
        },
        {
          name: 'color',
          type: 'text',
        },
        {
          name: 'stock',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
  ],
}