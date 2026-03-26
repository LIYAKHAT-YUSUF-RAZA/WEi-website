const Internship = require('../models/Internship');
const Application = require('../models/Application');
const User = require('../models/User');
const { sendInternshipApplicationToManager, sendInternshipApplicationConfirmationToCandidate } = require('../utils/emailService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
const getInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find({ status: 'open' }).sort({ createdAt: -1 }).lean();
  res.json(internships);
});

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
const getInternshipById = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ message: 'Internship not found' });
  }

  res.json(internship);
});

// @desc    Apply for internship
// @route   POST /api/internships/:id/apply
// @access  Private (Candidate)
const applyInternship = asyncHandler(async (req, res) => {
  const { candidateDetails, documents } = req.body;
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ message: 'Internship not found' });
  }

  // Check if already applied (only pending or accepted applications count)
  const existingApplication = await Application.findOne({
    candidateId: req.user._id,
    type: 'internship',
    referenceId: req.params.id,
    status: { $in: ['pending', 'accepted'] }
  });

  if (existingApplication) {
    return res.status(400).json({ message: 'Already applied for this internship' });
  }

  const application = await Application.create({
    candidateId: req.user._id,
    type: 'internship',
    referenceId: req.params.id,
    candidateDetails: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      ...candidateDetails
    },
    documents: documents || []
  });

  // Update applicants count
  internship.applicants += 1;
  await internship.save();

  // Send emails asynchronously (non-blocking)
  setImmediate(async () => {
    try {
      const managers = await User.find({ role: 'manager' });
      for (const manager of managers) {
        await sendInternshipApplicationToManager(
          manager.email,
          req.user.name,
          req.user.email,
          internship.title,
          application._id
        );
      }
      await sendInternshipApplicationConfirmationToCandidate(
        req.user.email,
        req.user.name,
        internship.title
      );
    } catch (emailError) {
      console.error('Error sending internship emails:', emailError.message);
    }
  });

  res.status(201).json({ message: 'Successfully applied for internship', application });
});

// @desc    Create new internship (Manager only)
// @route   POST /api/internships
// @access  Private (Manager)
const createInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.create(req.body);
  res.status(201).json(internship);
});

module.exports = {
  getInternships,
  getInternshipById,
  applyInternship,
  createInternship
};
