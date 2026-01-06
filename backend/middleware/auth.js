const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Manager role required.' });
  }
  next();
};

const isCandidate = (req, res, next) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Access denied. Candidate role required.' });
  }
  next();
};

// Permission-based middleware
const checkPermission = (permissionName) => {
  return (req, res, next) => {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager role required.' });
    }

    // Check if user has fullAccess
    if (req.user.permissions?.fullAccess) {
      return next();
    }

    // Check specific permission
    if (!req.user.permissions || !req.user.permissions[permissionName]) {
      return res.status(403).json({ 
        message: `Access denied. You don't have permission to ${permissionName.replace('can', '').replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.` 
      });
    }

    next();
  };
};

module.exports = { auth, isManager, isCandidate, checkPermission };
