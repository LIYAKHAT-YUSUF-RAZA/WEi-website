const User = require('../models/User');
const Application = require('../models/Application');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private (Manager only)
const getAllCandidates = asyncHandler(async (req, res) => {
  const candidates = await User.find({ role: 'candidate' })
    .select('-password')
    .sort({ createdAt: -1 });

  res.json(candidates);
});

// @desc    Get single candidate with applications
// @route   GET /api/candidates/:id
// @access  Private (Manager only)
const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await User.findById(req.params.id)
    .select('-password');

  if (!candidate || candidate.role !== 'candidate') {
    return res.status(404).json({ message: 'Candidate not found' });
  }

  const applications = await Application.find({ userId: candidate._id })
    .populate('courseId', 'title')
    .populate('internshipId', 'title')
    .sort({ appliedAt: -1 });

  res.json({
    candidate,
    applications
  });
});

// @desc    Delete candidate and all their applications
// @route   DELETE /api/candidates/:id
// @access  Private (Manager only)
const deleteCandidate = asyncHandler(async (req, res) => {
  const candidate = await User.findById(req.params.id);

  if (!candidate || candidate.role !== 'candidate') {
    return res.status(404).json({ message: 'Candidate not found' });
  }

  const candidateName = candidate.name;
  const candidateEmail = candidate.email;

  // Delete all related data for this candidate
  const deletedApps = await Application.deleteMany({ userId: candidate._id });

  const CourseEnrollment = require('../models/CourseEnrollment');
  const deletedEnrollments = await CourseEnrollment.deleteMany({ userId: candidate._id });

  const Cart = require('../models/Cart');
  const deletedCart = await Cart.deleteMany({ userId: candidate._id });

  const NotificationSettings = require('../models/NotificationSettings');
  const deletedNotifications = await NotificationSettings.deleteMany({ userId: candidate._id });

  await User.findByIdAndDelete(req.params.id);

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
});

// @desc    Remove candidate from specific course/internship
// @route   DELETE /api/candidates/:id/applications/:applicationId
// @access  Private (Manager only)
const removeApplicationFromCandidate = asyncHandler(async (req, res) => {
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
});

module.exports = {
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
  removeApplicationFromCandidate
};
