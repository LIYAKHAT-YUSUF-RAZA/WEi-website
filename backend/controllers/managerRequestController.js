const ManagerRequest = require('../models/ManagerRequest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');

// @desc    Create manager request
// @route   POST /api/manager-requests
// @access  Public
const createManagerRequest = async (req, res) => {
  try {
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
        console.log('❌ Pending request already exists:', email);
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
    console.log('✅ Manager request created:', managerRequest._id);

    const existingManagers = await User.find({ role: 'manager' });
    console.log(`📧 Found ${existingManagers.length} existing managers to notify`);
    
    if (existingManagers.length > 0) {
      for (const manager of existingManagers) {
        try {
          await emailService.sendNewManagerRequestNotification(manager.email, {
            name,
            email,
            phone
          });
        } catch (emailError) {
          // Don't fail the request if email fails
        }
      }
    }

    res.status(201).json({
      message: 'Your manager account request has been submitted. You will receive an email once it is approved.',
      requestId: managerRequest._id
    });

  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A manager request with this email already exists. Please use a different email or contact support.' 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all manager requests
// @route   GET /api/manager-requests
// @access  Private (Manager only)
const getManagerRequests = async (req, res) => {
  try {
    const requests = await ManagerRequest.find().sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject manager request
// @route   PUT /api/manager-requests/:id
// @access  Private (Manager only)
const updateManagerRequest = async (req, res) => {
  try {
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
      
      // Update permissions
      if (permissions) {
        managerRequest.permissions = permissions;
      }

      // Create the manager user account
      // Use insertOne to bypass password hashing middleware since password is already hashed
      const userDoc = {
        name: managerRequest.name,
        email: managerRequest.email,
        password: managerRequest.password, // Already hashed from registration
        role: 'manager',
        phone: managerRequest.phone,
        permissions: managerRequest.permissions,
        profilePicture: '',
        createdAt: new Date()
      };
      
      await User.collection.insertOne(userDoc);
      const newManager = await User.findOne({ email: managerRequest.email });
      
      console.log(`\ud83d\udc64 New manager account created: ${managerRequest.email}`);

      // Send approval email to new manager
      try {
        console.log('\ud83d\udce7 Sending approval email...');
        const emailResult = await emailService.sendManagerAccountApprovalEmail(
          managerRequest.email,
          managerRequest.name,
          permissions || managerRequest.permissions
        );
        console.log(`\u2705 Email service response:`, emailResult);
      } catch (emailError) {
        console.error('\u274c EMAIL SENDING FAILED:', emailError);
        console.error('\u274c Error stack:', emailError.stack);
        console.error('\u274c Environment check:', {
          EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'NOT SET',
          EMAIL_PASS: process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET'
        });
        // Continue even if email fails - account is already created
      }

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

      // Send rejection email to the applicant
      try {
        console.log('\ud83d\udce7 Sending rejection email...');
        await emailService.sendManagerAccountRejectionEmail(
          managerRequest.email,
          managerRequest.name
        );
        console.log(`\u2705 Successfully sent rejection email to ${managerRequest.email}`);
      } catch (emailError) {
        console.error('\u274c Failed to send manager rejection email:', emailError);
        console.error('\u274c Error stack:', emailError.stack);
        // Continue even if email fails
      }

      res.json({ message: 'Manager request rejected' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete manager request
// @route   DELETE /api/manager-requests/:id
// @access  Private (Manager only)
const deleteManagerRequest = async (req, res) => {
  try {
    const managerRequest = await ManagerRequest.findById(req.params.id);
    
    if (!managerRequest) {
      return res.status(404).json({ message: 'Manager request not found' });
    }

    await managerRequest.deleteOne();
    res.json({ message: 'Manager request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createManagerRequest,
  getManagerRequests,
  updateManagerRequest,
  deleteManagerRequest
};
