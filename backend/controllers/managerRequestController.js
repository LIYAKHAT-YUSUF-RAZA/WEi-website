const ManagerRequest = require('../models/ManagerRequest');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Create email transporter or use development mode
const createTransporter = () => {
  // Check if we're in development mode (no valid email credentials)
  const isDevelopment = !process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
                        process.env.EMAIL_USER === 'your_email@gmail.com' ||
                        process.env.EMAIL_PASS === 'your_16_char_app_password_here';
  
  if (isDevelopment) {
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Helper function to send email or log in development
const sendEmailOrLog = async (transporter, emailData) => {
  if (!transporter) {
    // Development mode: Email not sent
    return { success: true, mode: 'development' };
  }
  
  // Production mode: Actually send the email
  try {
    await transporter.sendMail(emailData);
    return { success: true, mode: 'production' };
  } catch (error) {
    throw error;
  }
};

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

    // Notify all existing managers about the new request
    const existingManagers = await User.find({ role: 'manager' });
    
    if (existingManagers.length > 0) {
      const transporter = createTransporter();
      
      for (const manager of existingManagers) {
        try {
          const emailContent = {
            from: process.env.EMAIL_USER || 'noreply@weintegrity.com',
            to: manager.email,
            subject: 'New Manager Account Request',
            html: `
              <h2>New Manager Account Request</h2>
              <p>A new manager wants to create an account:</p>
              <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
              </ul>
              <p>Please login to your dashboard to review and approve/reject this request.</p>
              <p><a href="${process.env.CLIENT_URL}/manager/dashboard">Go to Dashboard</a></p>
            `
          };
          
          await sendEmailOrLog(transporter, emailContent);
        } catch (emailError) {
          // Email error logged for monitoring
        }
      }
    }

    res.status(201).json({
      message: 'Your manager account request has been submitted. You will receive an email once it is approved.',
      requestId: managerRequest._id
    });

  } catch (error) {
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

      // Send approval email
      const transporter = createTransporter();
      
      try {
        const approvalEmail = {
          from: process.env.EMAIL_USER || 'noreply@weintegrity.com',
          to: managerRequest.email,
          subject: 'Manager Account Approved',
          html: `
            <h2>Welcome to WEintegrity!</h2>
            <p>Dear ${managerRequest.name},</p>
            <p>Your manager account request has been approved! You can now login to the system.</p>
            <h3>Your Access Permissions:</h3>
            <ul>
              ${permissions?.fullAccess ? '<li><strong>Full Access</strong> - You have complete control</li>' : ''}
              ${permissions?.canManageCourses ? '<li>Manage Courses</li>' : ''}
              ${permissions?.canManageInternships ? '<li>Manage Internships</li>' : ''}
              ${permissions?.canApproveApplications ? '<li>Approve Applications</li>' : ''}
              ${permissions?.canRejectApplications ? '<li>Reject Applications</li>' : ''}
              ${permissions?.canViewAllApplications ? '<li>View All Applications</li>' : ''}
              ${permissions?.canManageNotifications ? '<li>Manage Notifications</li>' : ''}
            </ul>
            <p><strong>Login URL:</strong> <a href="${process.env.CLIENT_URL}/login">${process.env.CLIENT_URL}/login</a></p>
            <p><strong>Email:</strong> ${managerRequest.email}</p>
            <p>Please use the password you set during registration to login.</p>
          `
        };
        
        await sendEmailOrLog(transporter, approvalEmail);
      } catch (emailError) {
        // Email error logged for monitoring
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

      // Send rejection email
      const transporter = createTransporter();
      
      try {
        const rejectionEmail = {
          from: process.env.EMAIL_USER || 'noreply@weintegrity.com',
          to: managerRequest.email,
          subject: 'Manager Account Request Status',
          html: `
            <h2>Account Request Update</h2>
            <p>Dear ${managerRequest.name},</p>
            <p>We regret to inform you that your manager account request has been declined.</p>
            <p>If you believe this is an error, please contact the administrator.</p>
          `
        };
        
        await sendEmailOrLog(transporter, rejectionEmail);
      } catch (emailError) {
        // Email error logged for monitoring
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
