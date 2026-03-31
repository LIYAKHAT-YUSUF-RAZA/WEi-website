/**
 * middleware/auth.js
 * Authentication & authorization middleware.
 *
 * Reliability improvement: authenticated users are cached in-memory for 30s
 * so every API request doesn't hit MongoDB. Under load this saves hundreds
 * of DB round-trips per second.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NodeCache = require('node-cache');

// Cache resolved users for 30 seconds, keyed by token
const userCache = new NodeCache({ stdTTL: 30, checkperiod: 60 });

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Try cache first — avoids DB hit on every request
    const cached = userCache.get(token);
    if (cached) {
      req.user = cached;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Cache for subsequent requests in the next 30s
    userCache.set(token, user);

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Invalidate the user cache entry when a user logs out or their data changes.
 * Call this after any operation that modifies the user record.
 */
const invalidateUserCache = (token) => {
  if (token) userCache.del(token);
  else userCache.flushAll();
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

const checkPermission = (permissionName) => {
  return (req, res, next) => {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager role required.' });
    }

    if (req.user.permissions?.fullAccess) {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions[permissionName]) {
      return res.status(403).json({
        message: `Access denied. You don't have permission to ${permissionName.replace('can', '').replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.`
      });
    }

    next();
  };
};

const isServiceProvider = (req, res, next) => {
  if (req.user.role !== 'service_provider') {
    return res.status(403).json({ message: 'Access denied. Service Provider role required.' });
  }
  next();
};

module.exports = { auth, isManager, isCandidate, isServiceProvider, checkPermission, invalidateUserCache };
