const express = require('express');
const router = express.Router();
const {
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
  removeApplicationFromCandidate
} = require('../controllers/candidateController');
const { auth, isManager } = require('../middleware/auth');

// All routes are protected - only managers can access
router.get('/', auth, isManager, getAllCandidates);
router.get('/:id', auth, isManager, getCandidateById);
router.delete('/:id', auth, isManager, deleteCandidate);
router.delete('/:id/applications/:applicationId', auth, isManager, removeApplicationFromCandidate);

module.exports = router;
