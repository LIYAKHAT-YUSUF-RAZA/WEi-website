const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    
    try {
      await db.collection('courseenrollments').dropIndex('transactionId_1');
      console.log('Index dropped successfully');
    } catch (error) {
      console.error('Error dropping index:', error.message);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
