const express = require('express');
const router = express.Router();
const {
  createEnrollment,
  getMyEnrollments,
  cancelEnrollment,
  checkEnrollmentStatus,
  submitPayment
} = require('../controllers/candidate/courseEnrollmentController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create enrollment request
router.post('/', createEnrollment);

// Get my enrollments
router.get('/my-enrollments', getMyEnrollments);

// Check enrollment status for a course
router.get('/status/:courseId', checkEnrollmentStatus);

// Submit payment for accepted enrollment
router.post('/:enrollmentId/payment', submitPayment);

// Cancel enrollment (only if pending)
router.delete('/:enrollmentId', cancelEnrollment);

module.exports = router;
