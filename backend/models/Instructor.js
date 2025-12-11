const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  specialization: [{
    type: String,
    trim: true
  }],
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  totalCourses: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Instructor', instructorSchema);
