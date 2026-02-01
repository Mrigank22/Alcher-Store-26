require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function deleteTestOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await mongoose.connection.db.collection('orders').deleteMany({ notes: /Test order/ });
    console.log(`✅ Deleted ${result.deletedCount} test orders`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

deleteTestOrders();
