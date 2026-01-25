import { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  dbName: 'productcategories', // Match Mongoose collection name
  fields: [
    {
      name: 'name',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Merch', value: 'Merch' },
        { label: 'Combo', value: 'Combo' },
        { label: 'Cards', value: 'Cards' },
        { label: 'Vinyl Stickers', value: 'Vinyl Stickers' },
        { label: 'PVC Stickers', value: 'PVC Stickers' },
        { label: 'Badges', value: 'Badges' },
        { label: 'Wrist Bands', value: 'Wrist Bands' },
        { label: 'Keychain', value: 'Keychain' },
        { label: 'Poster A3', value: 'Poster A3' },
        { label: 'Poster A4', value: 'Poster A4' },
        { label: 'Tote Bag', value: 'Tote Bag' },
      ],
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