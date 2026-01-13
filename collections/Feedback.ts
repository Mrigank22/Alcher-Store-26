import { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',

  admin: {
    defaultColumns: ['order', 'rating'],
  },

  access: {
    read: () => true,
    create: () => true,
  },

  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const existing = await req.payload.find({
          collection: 'feedback',
          where: {
            order: { equals: data.order },
          },
        })

        if (existing.totalDocs > 0) {
          throw new Error('Feedback already submitted for this order')
        }

        return data
      },
    ],
  },
}
