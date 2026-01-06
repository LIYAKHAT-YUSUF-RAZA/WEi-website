const express = require('express');
const router = express.Router();
const {
  getAllEnrollments,
  acceptEnrollment,
  rejectEnrollment,
  unenrollCandidate,
  getEnrollmentStats
} = require('../controllers/manager/enrollmentManagementController');
const { auth, isManager, checkPermission } = require('../middleware/auth');

// All routes require authentication and manager role
router.use(auth);
router.use(isManager);

// Get all enrollments (with optional status filter)
router.get('/', checkPermission('canManageCourses'), getAllEnrollments);

// Get enrollment statistics
router.get('/stats', checkPermission('canManageCourses'), getEnrollmentStats);

// Accept enrollment
router.put('/:enrollmentId/accept', checkPermission('canManageCourses'), acceptEnrollment);

// Reject enrollment
router.put('/:enrollmentId/reject', checkPermission('canManageCourses'), rejectEnrollment);

// Unenroll candidate (manager action)
router.delete('/:enrollmentId/unenroll', checkPermission('canManageCourses'), unenrollCandidate);

module.exports = router;
