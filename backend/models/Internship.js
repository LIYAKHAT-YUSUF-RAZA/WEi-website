const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'Remote'
  },
  duration: {
    type: String,
    required: true
  },
  stipend: {
    type: String,
    default: 'Unpaid'
  },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  startDate: {
    type: Date
  },
  applicationDeadline: {
    type: Date
  },
  openings: {
    type: Number,
    default: 1
  },
  applicants: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Internship', internshipSchema);
