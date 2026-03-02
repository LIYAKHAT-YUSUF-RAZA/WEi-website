const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    let manager = await User.findOne({ role: 'manager' });
    if (!manager) {
      console.log('No manager found, creating one...');
      manager = new User({
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'password123',
        role: 'manager'
      });
      await manager.save();
    }
    const token = jwt.sign({ id: manager._id, role: manager.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('__MANAGER_TOKEN__=' + token);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
