const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/candidate/cartController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get cart
router.get('/', getCart);

// Add to cart
router.post('/add', addToCart);

// Remove from cart
router.delete('/remove/:itemId', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

module.exports = router;
