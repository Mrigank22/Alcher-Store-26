import type { CollectionConfig } from 'payload'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'isSubscribed', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the subscriber',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Email address (unique)',
      },
    },
    {
      name: 'isSubscribed',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the subscriber is currently subscribed',
      },
    },
  ],
  timestamps: true,
}
