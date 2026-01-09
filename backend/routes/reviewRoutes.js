const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews } = require('../controllers/reviewController');
const { auth, isCandidate } = require('../middleware/auth');

router.post('/', auth, isCandidate, createReview);
router.get('/:providerId', getProviderReviews);

module.exports = router;
