const express = require('express');
const router = express.Router();
const {
  getAllEnrollments,
  acceptEnrollment,
  rejectEnrollment,
  unenrollCandidate,
  getEnrollmentStats
} = require('../controllers/manager/enrollmentManagementController');
const { auth, isManager } = require('../middleware/auth');

// All routes require authentication and manager role
router.use(auth);
router.use(isManager);

// Get all enrollments (with optional status filter)
router.get('/', getAllEnrollments);

// Get enrollment statistics
router.get('/stats', getEnrollmentStats);

// Accept enrollment
router.put('/:enrollmentId/accept', acceptEnrollment);

// Reject enrollment
router.put('/:enrollmentId/reject', rejectEnrollment);

// Unenroll candidate (manager action)
router.delete('/:enrollmentId/unenroll', unenrollCandidate);

module.exports = router;
