const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,             // Max connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000,      // Close sockets after 45s of inactivity
      heartbeatFrequencyMS: 10000, // Check server health every 10s
    });

    isConnected = true;
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

      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });

      isConnected = true;
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

  // Connection event listeners for monitoring
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('📡 Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('❌ Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️  Mongoose disconnected from DB');
  });
};

/**
 * Get current DB connection status
 * Used by health check endpoint
 */
const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    status: states[mongoose.connection.readyState] || 'unknown',
    isConnected,
    readyState: mongoose.connection.readyState,
  };
};

module.exports = { connectDB, getDBStatus };
