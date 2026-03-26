const ManagerRequest = require('../models/ManagerRequest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create manager request
// @route   POST /api/manager-requests
// @access  Public
const createManagerRequest = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Check if there's already a pending request
  const requestExists = await ManagerRequest.findOne({ email });
  if (requestExists) {
    if (requestExists.status === 'pending') {
      return res.status(400).json({ message: 'Your request is already pending approval' });
    }
    if (requestExists.status === 'rejected') {
      return res.status(400).json({ message: 'Your previous request was rejected. Please contact the administrator.' });
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create manager request
  const managerRequest = await ManagerRequest.create({
    name,
    email,
    password: hashedPassword,
    phone,
    status: 'pending'
  });

  // Notify managers asynchronously
  setImmediate(async () => {
    try {
      const existingManagers = await User.find({ role: 'manager' }).select('email').lean();
      for (const manager of existingManagers) {
        try {
          await emailService.sendNewManagerRequestNotification(manager.email, { name, email, phone });
        } catch (emailError) {
          // Don't fail the request if email fails
        }
      }
    } catch (err) {
      console.error('Error sending manager request notifications:', err.message);
    }
  });

  res.status(201).json({
    message: 'Your manager account request has been submitted. You will receive an email once it is approved.',
    requestId: managerRequest._id
  });
});

// @desc    Get all manager requests
// @route   GET /api/manager-requests
// @access  Private (Manager only)
const getManagerRequests = asyncHandler(async (req, res) => {
  const requests = await ManagerRequest.find().sort({ createdAt: -1 }).lean();
  res.json(requests);
});

// @desc    Approve/Reject manager request
// @route   PUT /api/manager-requests/:id
// @access  Private (Manager only)
const updateManagerRequest = asyncHandler(async (req, res) => {
  const { status, permissions } = req.body;
  const requestId = req.params.id;

  const managerRequest = await ManagerRequest.findById(requestId);

  if (!managerRequest) {
    return res.status(404).json({ message: 'Manager request not found' });
  }

  if (managerRequest.status !== 'pending') {
    return res.status(400).json({ message: 'This request has already been processed' });
  }

  managerRequest.status = status;
  managerRequest.approvedBy = req.user._id;

  if (status === 'approved') {
    managerRequest.approvedAt = Date.now();

    if (permissions) {
      managerRequest.permissions = permissions;
    }

    const userDoc = {
      name: managerRequest.name,
      email: managerRequest.email,
      password: managerRequest.password,
      role: 'manager',
      phone: managerRequest.phone,
      permissions: managerRequest.permissions,
      profilePicture: '',
      createdAt: new Date()
    };

    await User.collection.insertOne(userDoc);
    const newManager = await User.findOne({ email: managerRequest.email });

    // Send approval email asynchronously
    setImmediate(async () => {
      try {
        await emailService.sendManagerAccountApprovalEmail(
          managerRequest.email,
          managerRequest.name,
          permissions || managerRequest.permissions
        );
      } catch (emailError) {
        // Continue even if email fails
      }
    });

    await managerRequest.save();

    res.json({
      message: 'Manager request approved and account created',
      manager: {
        _id: newManager._id,
        name: newManager.name,
        email: newManager.email,
        permissions: newManager.permissions
      }
    });
  } else if (status === 'rejected') {
    await managerRequest.save();

    // Send rejection email asynchronously
    setImmediate(async () => {
      try {
        await emailService.sendManagerAccountRejectionEmail(
          managerRequest.email,
          managerRequest.name
        );
      } catch (emailError) {
        // Continue even if email fails
      }
    });

    res.json({ message: 'Manager request rejected' });
  }
});

// @desc    Delete manager request
// @route   DELETE /api/manager-requests/:id
// @access  Private (Manager only)
const deleteManagerRequest = asyncHandler(async (req, res) => {
  const managerRequest = await ManagerRequest.findById(req.params.id);

  if (!managerRequest) {
    return res.status(404).json({ message: 'Manager request not found' });
  }

  await managerRequest.deleteOne();
  res.json({ message: 'Manager request deleted' });
});

module.exports = {
  createManagerRequest,
  getManagerRequests,
  updateManagerRequest,
  deleteManagerRequest
};
