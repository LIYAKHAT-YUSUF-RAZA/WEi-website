const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, enrollCourse, createCourse } = require('../controllers/courseController');
const { auth, isCandidate, isManager, checkPermission } = require('../middleware/auth');

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/:id/enroll', auth, isCandidate, enrollCourse);
router.post('/', auth, isManager, checkPermission('canManageCourses'), createCourse);

module.exports = router;
