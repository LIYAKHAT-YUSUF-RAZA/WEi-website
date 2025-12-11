const express = require('express');
const router = express.Router();
const {
  createManagerRequest,
  getManagerRequests,
  updateManagerRequest,
  deleteManagerRequest
} = require('../controllers/managerRequestController');
const { auth, isManager } = require('../middleware/auth');

// Public route - anyone can request to be a manager
router.post('/', createManagerRequest);

// Protected routes - only managers can view and manage requests
router.get('/', auth, isManager, getManagerRequests);
router.put('/:id', auth, isManager, updateManagerRequest);
router.delete('/:id', auth, isManager, deleteManagerRequest);

module.exports = router;
