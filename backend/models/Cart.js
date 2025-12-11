const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship'
    },
    type: {
      type: String,
      enum: ['course', 'internship'],
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure only one cart per user
cartSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
