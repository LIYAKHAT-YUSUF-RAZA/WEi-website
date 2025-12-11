const express = require('express');
const router = express.Router();
const { register, login, getProfile, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
