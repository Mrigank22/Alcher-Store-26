import { CollectionConfig } from 'payload';

export const DeliveryConfig: CollectionConfig = {
  slug: 'delivery-config',
  admin: {
    useAsTitle: 'label',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Standard Delivery Fee',
      required: true,
    },
    {
      name: 'deliveryFee',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
};

export default DeliveryConfig;
