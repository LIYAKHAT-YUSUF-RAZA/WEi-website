require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createTestManager = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if manager already exists
    const existing = await User.findOne({ email: 'admin@weintegrity.com' });
    if (existing) {
      console.log('Test manager already exists!');
      console.log('Email: admin@weintegrity.com');
      console.log('Password: admin123');
      mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create manager
    const manager = await User.create({
      name: 'Admin Manager',
      email: 'admin@weintegrity.com',
      password: hashedPassword,
      role: 'manager',
      phone: '1234567890',
      permissions: {
        fullAccess: true,
        canManageCourses: true,
        canManageInternships: true,
        canApproveApplications: true,
        canRejectApplications: true,
        canViewAllApplications: true,
        canManageNotifications: true
      }
    });

    console.log('✅ Test manager created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: admin@weintegrity.com');
    console.log('Password: admin123');
    console.log('');
    console.log('Go to: http://localhost:5173/login');

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.disconnect();
  }
};

createTestManager();
