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
  company: {
    name: {
      type: String,
      default: 'WEintegrity'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for performance
internshipSchema.index({ title: 'text', description: 'text' });
internshipSchema.index({ type: 1 });
internshipSchema.index({ location: 1 });
internshipSchema.index({ status: 1 });
internshipSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Internship', internshipSchema);
