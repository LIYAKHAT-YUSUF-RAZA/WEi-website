const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'payment_pending', 'unenrolled'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
    required: false
  },
  transactionId: {
    type: String,
    required: false,
    sparse: true
  },
  paymentScreenshot: {
    type: String,
    required: false
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['payment_receipt', 'screenshot', 'certificate', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  paidAt: {
    type: Date
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Prevent duplicate enrollment requests
courseEnrollmentSchema.index({ candidate: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
