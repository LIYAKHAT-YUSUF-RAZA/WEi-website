const express = require('express');
const router = express.Router();
const { getMyApplications } = require('../controllers/candidate/candidateController');
const { auth, isCandidate } = require('../middleware/auth');

router.get('/my-applications', auth, isCandidate, getMyApplications);

module.exports = router;
