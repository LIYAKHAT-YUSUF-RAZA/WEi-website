const express = require('express');
const router = express.Router();
const {
  getAllManagers,
  updateManagerPermissions,
  deleteManager,
  getManagerById
} = require('../controllers/managerController');
const { auth, isManager, checkPermission } = require('../middleware/auth');

// All routes require authentication and manager role
router.get('/', auth, isManager, checkPermission('fullAccess'), getAllManagers);
router.get('/:id', auth, isManager, checkPermission('fullAccess'), getManagerById);
router.put('/:id/permissions', auth, isManager, checkPermission('fullAccess'), updateManagerPermissions);
router.delete('/:id', auth, isManager, checkPermission('fullAccess'), deleteManager);

module.exports = router;
