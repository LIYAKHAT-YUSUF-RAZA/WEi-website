const User = require('../models/User');

// @desc    Get all managers
// @route   GET /api/managers
// @access  Private (Manager only)
const getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update manager permissions
// @route   PUT /api/managers/:id/permissions
// @access  Private (Manager only)
const updateManagerPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const managerId = req.params.id;

    // Prevent managers from modifying their own permissions
    if (managerId === req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You cannot modify your own permissions' 
      });
    }

    const manager = await User.findById(managerId);
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (manager.role !== 'manager') {
      return res.status(400).json({ message: 'User is not a manager' });
    }

    // Update permissions
    manager.permissions = permissions;
    await manager.save();

    res.json({
      message: 'Permissions updated successfully',
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        permissions: manager.permissions
      }
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete manager account
// @route   DELETE /api/managers/:id
// @access  Private (Manager only)
const deleteManager = async (req, res) => {
  try {
    const managerId = req.params.id;

    // Prevent managers from deleting their own account
    if (managerId === req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You cannot delete your own account' 
      });
    }

    const manager = await User.findById(managerId);
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (manager.role !== 'manager') {
      return res.status(400).json({ message: 'User is not a manager' });
    }

    await manager.deleteOne();

    res.json({ 
      message: `Manager account for ${manager.name} has been deleted successfully` 
    });
  } catch (error) {
    console.error('Delete manager error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get manager by ID
// @route   GET /api/managers/:id
// @access  Private (Manager only)
const getManagerById = async (req, res) => {
  try {
    const manager = await User.findById(req.params.id).select('-password');
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (manager.role !== 'manager') {
      return res.status(400).json({ message: 'User is not a manager' });
    }

    res.json(manager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllManagers,
  updateManagerPermissions,
  deleteManager,
  getManagerById
};
