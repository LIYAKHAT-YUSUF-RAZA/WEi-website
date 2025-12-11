const mongoose = require('mongoose');

const managerRequestSchema = new mongoose.Schema({
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
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  permissions: {
    canManageCourses: { type: Boolean, default: false },
    canManageInternships: { type: Boolean, default: false },
    canApproveApplications: { type: Boolean, default: false },
    canRejectApplications: { type: Boolean, default: false },
    canViewAllApplications: { type: Boolean, default: false },
    canManageNotifications: { type: Boolean, default: false },
    fullAccess: { type: Boolean, default: false }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ManagerRequest', managerRequestSchema);
