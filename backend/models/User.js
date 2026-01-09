const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['candidate', 'manager', 'service_provider'],
    required: true,
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  permissions: {
    canManageCourses: { type: Boolean, default: true },
    canManageInternships: { type: Boolean, default: true },
    canApproveApplications: { type: Boolean, default: true },
    canRejectApplications: { type: Boolean, default: true },
    canViewAllApplications: { type: Boolean, default: true },
    canManageNotifications: { type: Boolean, default: true },
    canManageServices: { type: Boolean, default: false },
    fullAccess: { type: Boolean, default: true }
  },
  profilePicture: {
    type: String,
    default: ''
  },
  // Service Provider Profile Fields
  secondaryPhone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  experience: {
    type: Number, // Years of experience
    default: 0
  },
  problemsSolved: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
