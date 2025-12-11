const express = require('express');
const router = express.Router();
const {
  getAllManagers,
  updateManagerPermissions,
  deleteManager,
  getManagerById
} = require('../controllers/managerController');
const { auth, isManager } = require('../middleware/auth');

// All routes require authentication and manager role
router.get('/', auth, isManager, getAllManagers);
router.get('/:id', auth, isManager, getManagerById);
router.put('/:id/permissions', auth, isManager, updateManagerPermissions);
router.delete('/:id', auth, isManager, deleteManager);

module.exports = router;
