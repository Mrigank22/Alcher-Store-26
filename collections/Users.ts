import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Handles email, password, and login automatically
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'array', // Allows multiple address strings
      fields: [
        {
          name: 'line',
          type: 'text',
        },
      ],
    },
    // We don't manually link 'cart' or 'orders' here usually; 
    // we let those collections point TO the user to prevent circular dependency errors.
  ],
}