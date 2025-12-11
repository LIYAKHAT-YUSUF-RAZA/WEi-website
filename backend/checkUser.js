require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email: 'liyakhatyusufraza274@gmail.com' });
    
    if (user) {
      console.log('✅ User found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Permissions:', user.permissions);
    } else {
      console.log('❌ User not found in database');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.disconnect();
  }
};

checkUser();
