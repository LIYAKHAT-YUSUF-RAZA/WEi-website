const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoOptions = {
    // Connection pool — up to 10 simultaneous DB connections
    maxPoolSize: 10,
    minPoolSize: 2,

    // How long to wait when picking a connection from the pool
    waitQueueTimeoutMS: 5000,

    // Server selection: give up after 5s if MongoDB is unreachable
    serverSelectionTimeoutMS: 5000,

    // Kill sockets that haven't responded within 45s
    socketTimeoutMS: 45000,

    // Send a ping every 10s to detect broken connections early
    heartbeatFrequencyMS: 10000,
  };

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Mongoose will auto-reconnect.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

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

      const conn = await mongoose.connect(uri, mongoOptions);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);

      process.env.MONGODB_URI = uri;

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
