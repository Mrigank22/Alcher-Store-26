require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📦 Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check orders collection
    const ordersCount = await db.collection('orders').countDocuments();
    console.log(`\n📊 Orders collection has ${ordersCount} documents`);
    
    if (ordersCount > 0) {
      const sampleOrder = await db.collection('orders').findOne();
      console.log('\n📄 Sample order:', JSON.stringify(sampleOrder, null, 2));
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDB();
