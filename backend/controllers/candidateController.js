const User = require('../models/User');
const Application = require('../models/Application');

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private (Manager only)
const getAllCandidates = async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
};

// @desc    Get single candidate with applications
// @route   GET /api/candidates/:id
// @access  Private (Manager only)
const getCandidateById = async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id)
      .select('-password');

    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Get all applications for this candidate
    const applications = await Application.find({ userId: candidate._id })
      .populate('courseId', 'title')
      .populate('internshipId', 'title')
      .sort({ appliedAt: -1 });

    res.json({
      candidate,
      applications
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ message: 'Failed to fetch candidate details' });
  }
};

// @desc    Delete candidate and all their applications
// @route   DELETE /api/candidates/:id
// @access  Private (Manager only)
const deleteCandidate = async (req, res) => {
  try {
    console.log('🗑️ Deleting candidate:', req.params.id);
    
    const candidate = await User.findById(req.params.id);

    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const candidateName = candidate.name;
    const candidateEmail = candidate.email;

    // Delete all related data for this candidate
    console.log('🗑️ Deleting applications...');
    const deletedApps = await Application.deleteMany({ userId: candidate._id });
    console.log(`   Deleted ${deletedApps.deletedCount} applications`);

    console.log('🗑️ Deleting course enrollments...');
    const CourseEnrollment = require('../models/CourseEnrollment');
    const deletedEnrollments = await CourseEnrollment.deleteMany({ userId: candidate._id });
    console.log(`   Deleted ${deletedEnrollments.deletedCount} enrollments`);

    console.log('🗑️ Deleting cart items...');
    const Cart = require('../models/Cart');
    const deletedCart = await Cart.deleteMany({ userId: candidate._id });
    console.log(`   Deleted ${deletedCart.deletedCount} cart items`);

    console.log('🗑️ Deleting notification settings...');
    const NotificationSettings = require('../models/NotificationSettings');
    const deletedNotifications = await NotificationSettings.deleteMany({ userId: candidate._id });
    console.log(`   Deleted ${deletedNotifications.deletedCount} notification settings`);

    // Delete the candidate user
    console.log('🗑️ Deleting user account...');
    await User.findByIdAndDelete(req.params.id);
    console.log('✅ Candidate and all related data deleted successfully');

    res.json({ 
      message: `Candidate ${candidateName} and all their data have been deleted successfully`,
      deletedCandidate: {
        name: candidateName,
        email: candidateEmail
      },
      deletedData: {
        applications: deletedApps.deletedCount,
        enrollments: deletedEnrollments.deletedCount,
        cartItems: deletedCart.deletedCount,
        notificationSettings: deletedNotifications.deletedCount
      }
    });
  } catch (error) {
    console.error('❌ Error deleting candidate:', error);
    res.status(500).json({ message: 'Failed to delete candidate' });
  }
};

// @desc    Remove candidate from specific course/internship
// @route   DELETE /api/candidates/:id/applications/:applicationId
// @access  Private (Manager only)
const removeApplicationFromCandidate = async (req, res) => {
  try {
    const { id, applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId.toString() !== id) {
      return res.status(400).json({ message: 'Application does not belong to this candidate' });
    }

    await Application.findByIdAndDelete(applicationId);

    res.json({ 
      message: 'Application removed successfully',
      deletedApplication: applicationId
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove application' });
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
  removeApplicationFromCandidate
};
