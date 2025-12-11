const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  updateApplicationStatus,
  getApplicationStats,
  getNotificationSettings,
  updateNotificationSettings,
  getDashboardStats,
  createCourse,
  createInternship,
  getAllCourses,
  getAllInternships,
  updateCourse,
  updateInternship,
  deleteCourse,
  deleteInternship
} = require('../controllers/manager/managerController');
const {
  getAllInstructors,
  getInstructor,
  createInstructor,
  updateInstructor,
  deleteInstructor
} = require('../controllers/manager/instructorController');
const { auth, isManager } = require('../middleware/auth');

// Application routes
router.get('/applications', auth, isManager, getAllApplications);
router.get('/applications/stats', auth, isManager, getApplicationStats);
router.put('/applications/:id', auth, isManager, updateApplicationStatus);

// Notification routes
router.get('/notification-settings', auth, isManager, getNotificationSettings);
router.put('/notification-settings', auth, isManager, updateNotificationSettings);

// Dashboard stats
router.get('/stats', auth, isManager, getDashboardStats);

// Course management routes
router.post('/courses', auth, isManager, createCourse);
router.get('/courses', auth, isManager, getAllCourses);
router.put('/courses/:id', auth, isManager, updateCourse);
router.delete('/courses/:id', auth, isManager, deleteCourse);

// Internship management routes
router.post('/internships', auth, isManager, createInternship);
router.get('/internships', auth, isManager, getAllInternships);
router.put('/internships/:id', auth, isManager, updateInternship);
router.delete('/internships/:id', auth, isManager, deleteInternship);

// Instructor management routes
router.get('/instructors', auth, isManager, getAllInstructors);
router.get('/instructors/:id', auth, isManager, getInstructor);
router.post('/instructors', auth, isManager, createInstructor);
router.put('/instructors/:id', auth, isManager, updateInstructor);
router.delete('/instructors/:id', auth, isManager, deleteInstructor);

module.exports = router;
