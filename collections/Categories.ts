import { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'field_required', // Grouping your boolean flags
      type: 'group',
      fields: [
        { name: 'size', type: 'checkbox' },
        { name: 'colour', type: 'checkbox' },
      ],
    },
  ],
}