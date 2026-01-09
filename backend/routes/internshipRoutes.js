const express = require('express');
const router = express.Router();
const { getInternships, getInternshipById, applyInternship, createInternship } = require('../controllers/internshipController');
const { auth, isCandidate, isManager, checkPermission } = require('../middleware/auth');

const { cacheMiddleware } = require('../middleware/cache');

// Cache internships for 5 minutes
router.get('/', cacheMiddleware(300), getInternships);
router.get('/:id', getInternshipById);
router.post('/:id/apply', auth, isCandidate, applyInternship);
router.post('/', auth, isManager, checkPermission('canManageInternships'), createInternship);

module.exports = router;
