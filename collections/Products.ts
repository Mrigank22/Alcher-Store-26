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
      name: 'deliveryFee',
      label: 'Delivery Fee',
      type: 'number',
      required: false,
      defaultValue: 0,
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'productType',
      label: 'Product Type',
      type: 'text',
      defaultValue: 'T-Shirt',
    },
    {
      // name: 'image',
      // type: 'upload',
      // relationTo: 'media', // Links to the Media collection
      // required: true,
       name: 'images',
       label: 'Product Images',
       type: 'relationship',
       relationTo: 'media',
       hasMany: true, // ⭐ THIS is the key
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
          options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
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