import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderId',
  },
  fields: [
    {
      name: 'orderId',
      type: 'text',
      unique: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        'pending', 'payment_failed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
      ],
      defaultValue: 'pending',
    },
    {
      name: 'items', // Array of order items
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        { name: 'productName', type: 'text' }, // Snapshot of name
        { name: 'quantity', type: 'number', min: 1, required: true },
        { name: 'size', type: 'text' },
        { name: 'price', type: 'number' }, // Snapshot of price
        { name: 'subtotal', type: 'number' },
      ],
    },
    {
      name: 'billing', // Grouping financial info
      type: 'group',
      fields: [
        { name: 'subtotal', type: 'number' },
        { name: 'shippingCost', type: 'number' },
        { name: 'tax', type: 'number' },
        { name: 'totalAmount', type: 'number' },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'addressLine1', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'pincode', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'paymentInfo',
      type: 'group',
      fields: [
         { name: 'razorpayOrderId', type: 'text' },
         { name: 'razorpayPaymentId', type: 'text' },
         { name: 'status', type: 'select', options: ['pending', 'completed', 'failed'] },
      ]
    }
  ],
}