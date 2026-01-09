const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, enrollCourse, createCourse } = require('../controllers/courseController');
const { auth, isCandidate, isManager, checkPermission } = require('../middleware/auth');

const { cacheMiddleware } = require('../middleware/cache');

// Cache courses for 5 minutes
router.get('/', cacheMiddleware(300), getCourses);
router.get('/:id', getCourseById);
router.post('/:id/enroll', auth, isCandidate, enrollCourse);
router.post('/', auth, isManager, checkPermission('canManageCourses'), createCourse);

module.exports = router;
