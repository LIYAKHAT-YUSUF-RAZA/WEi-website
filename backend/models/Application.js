const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['course', 'internship'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  candidateDetails: {
    name: String,
    email: String,
    phone: String,
    resume: String,
    coverLetter: String,
    education: String,
    experience: String
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['resume', 'cover_letter', 'certificate', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Application', applicationSchema);
