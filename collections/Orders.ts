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
      required: true,
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
        'pending', 'payment_failed', 'payment_error', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
      ],
      defaultValue: 'pending',
    },
    {
      name: 'orderStatus',
      type: 'select',
      options: [
        'pending', 'payment_failed', 'payment_error', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
      ],
      defaultValue: 'pending',
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        { name: 'productName', type: 'text', required: true },
        { name: 'productImage', type: 'text', required: true },
        { name: 'quantity', type: 'number', min: 1, required: true },
        { name: 'size', type: 'text' },
        { name: 'colour', type: 'text' },
        { name: 'price', type: 'number', required: true },
        { name: 'subtotal', type: 'number', required: true },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
    },
    {
      name: 'shippingCost',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'tax',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      defaultValue: 'pending',
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: ['sbi', 'cod'],
      defaultValue: 'sbi',
    },
    {
      name: 'paymentGateway',
      type: 'select',
      options: ['SBI', 'COD'],
    },
    {
      name: 'sbiTransactionId',
      type: 'text',
    },
    {
      name: 'paymentDetails',
      type: 'json',
    },
    {
      name: 'paidAt',
      type: 'date',
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'text' },
        { name: 'addressLine1', type: 'text', required: true },
        { name: 'addressLine2', type: 'text' },
        { name: 'district', type: 'text', required: true },
        { name: 'city', type: 'text', required: true },
        { name: 'state', type: 'text', required: true },
        { name: 'pincode', type: 'text', required: true },
      ],
    },
    {
      name: 'orderDate',
      type: 'date',
    },
    {
      name: 'deliveryDate',
      type: 'date',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'invoiceUrl',
      type: 'text',
    },
    {
      name: 'invoiceNumber',
      type: 'text',
    },
  ],
}