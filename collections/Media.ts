import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media', // Stores files in a 'media' folder
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true, // Publicly readable
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}