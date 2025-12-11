const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  syllabus: [{
    week: Number,
    topics: [String],
    description: String
  }],
  prerequisites: [String],
  learningOutcomes: [String],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    default: null
  },
  instructorDetails: {
    name: String,
    bio: String,
    image: String,
    experience: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  price: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  enrolled: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
