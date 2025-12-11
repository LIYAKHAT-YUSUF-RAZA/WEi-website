require('dotenv').config();
const mongoose = require('mongoose');
const ManagerRequest = require('./models/ManagerRequest');

const deleteAllRequests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const result = await ManagerRequest.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} manager requests`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.disconnect();
  }
};

deleteAllRequests();
