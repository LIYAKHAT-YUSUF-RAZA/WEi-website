const Internship = require('../models/Internship');
const Application = require('../models/Application');
const User = require('../models/User');
const { sendInternshipApplicationToManager, sendInternshipApplicationConfirmationToCandidate } = require('../utils/emailService');

// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
const getInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ status: 'open' }).sort({ createdAt: -1 });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for internship
// @route   POST /api/internships/:id/apply
// @access  Private (Candidate)
const applyInternship = async (req, res) => {
  try {
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

    // Send email to manager
    const managers = await User.find({ role: 'manager' });
    if (managers.length > 0) {
      for (const manager of managers) {
        await sendInternshipApplicationToManager(
          manager.email,
          req.user.name,
          req.user.email,
          internship.title,
          application._id
        );
      }
    }

    // Send confirmation email to candidate
    await sendInternshipApplicationConfirmationToCandidate(
      req.user.email,
      req.user.name,
      internship.title
    );

    res.status(201).json({ message: 'Successfully applied for internship', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new internship (Manager only)
// @route   POST /api/internships
// @access  Private (Manager)
const createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInternships,
  getInternshipById,
  applyInternship,
  createInternship
};
