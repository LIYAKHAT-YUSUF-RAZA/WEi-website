const express = require('express');
const router = express.Router();
const {
  createCourseRequest,
  getCourseRequests,
  getCourseRequestById,
  approveCourseRequest,
  rejectCourseRequest
} = require('../controllers/courseRequestController');
const { auth, isManager, checkPermission } = require('../middleware/auth');

// Candidate routes
router.post('/', auth, createCourseRequest);

// Manager routes - require fullAccess
router.get('/', auth, isManager, checkPermission('fullAccess'), getCourseRequests);
router.get('/:id', auth, isManager, checkPermission('fullAccess'), getCourseRequestById);
router.put('/:id/approve', auth, isManager, checkPermission('fullAccess'), approveCourseRequest);
router.put('/:id/reject', auth, isManager, checkPermission('fullAccess'), rejectCourseRequest);

module.exports = router;
