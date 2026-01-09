const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed the database if empty
    const seedDatabase = require('../utils/seeder');
    await seedDatabase();
  } catch (error) {
    console.log('⚠️  Standard MongoDB Connection Failed:', error.message);
    console.log('🔄 Attempting to start In-Memory MongoDB...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();

      console.log('📦 In-Memory MongoDB started at:', uri);

      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);

      // Update process.env so other parts of the app know the URI if needed (optional)
      process.env.MONGODB_URI = uri;

      // Seed the database
      const seedDatabase = require('../utils/seeder');
      await seedDatabase();

    } catch (memoryError) {
      console.error('❌ In-Memory MongoDB Error:', memoryError.message);
      console.error('❌ Original MongoDB Connection Error:', error.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
