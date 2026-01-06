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

    const managerName = manager.name;
    const managerEmail = manager.email;

    // Delete all related data for this manager
    const NotificationSettings = require('../models/NotificationSettings');
    const deletedNotifications = await NotificationSettings.deleteMany({ userId: manager._id });

    const ManagerRequest = require('../models/ManagerRequest');
    const updatedRequests = await ManagerRequest.updateMany(
      { approvedBy: manager._id },
      { $unset: { approvedBy: 1 } }
    );

    // Delete the manager user
    await manager.deleteOne();

    res.json({ 
      message: `Manager ${managerName} and all their data have been deleted successfully`,
      deletedManager: {
        name: managerName,
        email: managerEmail
      },
      deletedData: {
        notificationSettings: deletedNotifications.deletedCount,
        clearedManagerRequests: updatedRequests.modifiedCount
      }
    });
  } catch (error) {
    console.error('❌ Delete manager error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get manager by ID
// @route   GET /api/managers/:id
// @access  Private (Manager only)
const getManagerById = async (req, res) => {
  try {
    console.log('🔍 Getting manager by ID:', req.params.id);
    console.log('👤 Requesting user:', req.user?.email, 'Role:', req.user?.role);
    
    const manager = await User.findById(req.params.id).select('-password');
    
    if (!manager) {
      console.log('❌ Manager not found');
      return res.status(404).json({ message: 'Manager not found' });
    }

    if (manager.role !== 'manager') {
      console.log('❌ User is not a manager, role:', manager.role);
      return res.status(400).json({ message: 'User is not a manager' });
    }

    console.log('✅ Manager found:', manager.email);
    res.json(manager);
  } catch (error) {
    console.error('❌ Error in getManagerById:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllManagers,
  updateManagerPermissions,
  deleteManager,
  getManagerById
};
