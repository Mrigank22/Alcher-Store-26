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
      required: true,
      // Single category selection - will show as dropdown in admin panel
      // Category defines size/color requirements, no need for hasSize/hasColor here
    },
    {
      name: 'variants', // Your variants array
      type: 'array',
      fields: [
        {
          name: 'size',
          type: 'select',
          options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
          admin: {
            description: 'For Merch products',
          },
        },
        {
          name: 'variantName',
          label: 'Variant Name',
          type: 'select',
          options: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'],
          admin: {
            description: 'For combos and accessories',
          },
        },
        {
          name: 'variantDescription',
          label: 'Variant Description',
          type: 'textarea',
          admin: {
            description: 'Describe what makes this variant unique',
          },
        },
        {
          name: 'images',
          label: 'Variant Images',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Images for this specific variant (for non-Merch categories)',
          },
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