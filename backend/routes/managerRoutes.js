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
const { auth, isManager, checkPermission } = require('../middleware/auth');

// Application routes
router.get('/applications', auth, isManager, checkPermission('canViewAllApplications'), getAllApplications);
router.get('/applications/stats', auth, isManager, checkPermission('canViewAllApplications'), getApplicationStats);
router.put('/applications/:id', auth, isManager, checkPermission('canApproveApplications'), updateApplicationStatus);

// Notification routes
router.get('/notification-settings', auth, isManager, checkPermission('canManageNotifications'), getNotificationSettings);
router.put('/notification-settings', auth, isManager, checkPermission('canManageNotifications'), updateNotificationSettings);

// Dashboard stats
router.get('/stats', auth, isManager, getDashboardStats);

// Course management routes
router.post('/courses', auth, isManager, checkPermission('canManageCourses'), createCourse);
router.get('/courses', auth, isManager, checkPermission('canManageCourses'), getAllCourses);
router.put('/courses/:id', auth, isManager, checkPermission('canManageCourses'), updateCourse);
router.delete('/courses/:id', auth, isManager, checkPermission('canManageCourses'), deleteCourse);

// Internship management routes
router.post('/internships', auth, isManager, checkPermission('canManageInternships'), createInternship);
router.get('/internships', auth, isManager, checkPermission('canManageInternships'), getAllInternships);
router.put('/internships/:id', auth, isManager, checkPermission('canManageInternships'), updateInternship);
router.delete('/internships/:id', auth, isManager, checkPermission('canManageInternships'), deleteInternship);

// Instructor management routes
router.get('/instructors', auth, isManager, checkPermission('canManageCourses'), getAllInstructors);
router.get('/instructors/:id', auth, isManager, checkPermission('canManageCourses'), getInstructor);
router.post('/instructors', auth, isManager, checkPermission('canManageCourses'), createInstructor);
router.put('/instructors/:id', auth, isManager, checkPermission('canManageCourses'), updateInstructor);
router.delete('/instructors/:id', auth, isManager, checkPermission('canManageCourses'), deleteInstructor);

module.exports = router;
