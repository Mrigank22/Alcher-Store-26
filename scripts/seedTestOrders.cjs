require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const orderSchema = new mongoose.Schema({
  orderId: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    productImage: String,
    productType: String,
    quantity: Number,
    size: String,
    variantName: String,
    category: String,
    colour: String,
    price: Number,
    subtotal: Number,
  }],
  subtotal: Number,
  shippingCost: Number,
  tax: Number,
  totalAmount: Number,
  shippingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    district: String,
    city: String,
    state: String,
    pincode: String,
  },
  paymentMethod: String,
  paymentStatus: String,
  status: String,
  orderStatus: String,
  notes: String,
  orderDate: Date,
}, { timestamps: true });

async function seedOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Get the first user from the database
    const firstUser = await User.findOne();
    if (!firstUser) {
      console.error('❌ No users found in database. Please create a user first.');
      await mongoose.disconnect();
      process.exit(1);
    }
    
    console.log(`Using user: ${firstUser._id}`);
    
    // First, let's check if any test orders already exist
    const existingTestOrders = await Order.find({ notes: /Test order/ });
    console.log(`Found ${existingTestOrders.length} existing test orders`);
    
    const testOrders = [
      // Order 1: Merch only
      {
        orderId: `ORD-${Date.now()}-TEST1`,
        user: firstUser._id,
        items: [
          {
            productName: 'Alcheringa T-Shirt',
            productImage: '/placeholder.png',
            productType: 'T-Shirt',
            quantity: 2,
            size: 'M',
            variantName: null,
            category: 'Merch',
            colour: null,
            price: 500,
            subtotal: 1000,
          }
        ],
        subtotal: 1000,
        shippingCost: 100,
        tax: 0,
        totalAmount: 1100,
        shippingAddress: {
          name: 'Test User 1',
          phone: '9876543210',
          addressLine1: 'Test Address 1',
          addressLine2: '',
          district: 'Kamrup',
          city: 'Guwahati',
          state: 'Assam',
          pincode: '781001',
        },
        paymentMethod: 'cod',
        paymentStatus: 'confirmed',
        status: 'confirmed',
        orderStatus: 'confirmed',
        notes: 'Test order - Merch only',
        orderDate: new Date(),
      },
      
      // Order 2: Mixed (Merch + Accessories)
      {
        orderId: `ORD-${Date.now()}-TEST2`,
        user: firstUser._id,
        items: [
          {
            productName: 'Alcheringa T-Shirt',
            productImage: '/placeholder.png',
            productType: 'T-Shirt',
            quantity: 1,
            size: 'L',
            variantName: null,
            category: 'Merch',
            colour: null,
            price: 500,
            subtotal: 500,
          },
          {
            productName: 'Keychain Set',
            productImage: '/placeholder.png',
            productType: 'Keychain',
            quantity: 2,
            size: null,
            variantName: 'set 1',
            category: 'Keychain',
            colour: null,
            price: 100,
            subtotal: 200,
          },
          {
            productName: 'Badges Pack',
            productImage: '/placeholder.png',
            productType: 'Badge',
            quantity: 1,
            size: null,
            variantName: 'set 2',
            category: 'Badges',
            colour: null,
            price: 150,
            subtotal: 150,
          }
        ],
        subtotal: 850,
        shippingCost: 100,
        tax: 0,
        totalAmount: 950,
        shippingAddress: {
          name: 'Test User 2',
          phone: '9876543211',
          addressLine1: 'Test Address 2',
          addressLine2: 'Near IIT',
          district: 'Kamrup',
          city: 'Guwahati',
          state: 'Assam',
          pincode: '781039',
        },
        paymentMethod: 'sbi',
        paymentStatus: 'confirmed',
        status: 'confirmed',
        orderStatus: 'confirmed',
        notes: 'Test order - Mixed items',
        orderDate: new Date(),
      },
      
      // Order 3: Accessories only
      {
        orderId: `ORD-${Date.now()}-TEST3`,
        user: firstUser._id,
        items: [
          {
            productName: 'Keychain Set',
            productImage: '/placeholder.png',
            productType: 'Keychain',
            quantity: 1,
            size: null,
            variantName: 'set 2',
            category: 'Keychain',
            colour: null,
            price: 100,
            subtotal: 100,
          },
          {
            productName: 'Poster A4',
            productImage: '/placeholder.png',
            productType: 'Poster',
            quantity: 3,
            size: null,
            variantName: 'Design 1',
            category: 'Poster A4',
            colour: null,
            price: 80,
            subtotal: 240,
          }
        ],
        subtotal: 340,
        shippingCost: 100,
        tax: 0,
        totalAmount: 440,
        shippingAddress: {
          name: 'Test User 3',
          phone: '9876543212',
          addressLine1: 'Test Address 3',
          addressLine2: '',
          district: 'Kamrup',
          city: 'Guwahati',
          state: 'Assam',
          pincode: '781001',
        },
        paymentMethod: 'cod',
        paymentStatus: 'confirmed',
        status: 'confirmed',
        orderStatus: 'confirmed',
        notes: 'Test order - Accessories only',
        orderDate: new Date(),
      },
    ];

    const inserted = await Order.insertMany(testOrders);
    console.log(`✅ Successfully inserted ${inserted.length} test orders:`);
    console.log('  1. Merch only');
    console.log('  2. Merch + Accessories (mixed)');
    console.log('  3. Accessories only');
    
    // Verify they were inserted
    const count = await Order.countDocuments();
    console.log(`\n📊 Total orders in database: ${count}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
}

seedOrders();
