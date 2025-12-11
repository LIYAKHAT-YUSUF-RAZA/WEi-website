const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  notifyOnNewApplication: {
    type: Boolean,
    default: true
  },
  notifyOnStatusChange: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
