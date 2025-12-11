const Cart = require('../../models/Cart');
const Course = require('../../models/Course');
const Internship = require('../../models/Internship');

// Get cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.course')
      .populate('items.internship');
    
    if (!cart) {
      return res.json({ items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { itemId, type } = req.body;
    
    if (!itemId || !type) {
      return res.status(400).json({ message: 'Item ID and type are required' });
    }
    
    if (type !== 'course' && type !== 'internship') {
      return res.status(400).json({ message: 'Invalid type. Must be course or internship' });
    }
    
    // Verify item exists
    if (type === 'course') {
      const course = await Course.findById(itemId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    } else {
      const internship = await Internship.findById(itemId);
      if (!internship) {
        return res.status(404).json({ message: 'Internship not found' });
      }
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    
    // Check if item already in cart
    const existingItem = cart.items.find(item => 
      (type === 'course' && item.course && item.course.toString() === itemId) ||
      (type === 'internship' && item.internship && item.internship.toString() === itemId)
    );
    
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in cart' });
    }
    
    // Add item to cart
    const newItem = {
      type,
      [type]: itemId
    };
    
    cart.items.push(newItem);
    await cart.save();
    
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.course')
      .populate('items.internship');
    
    res.json({ message: 'Item added to cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.course')
      .populate('items.internship');
    
    res.json({ message: 'Item removed from cart', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};
