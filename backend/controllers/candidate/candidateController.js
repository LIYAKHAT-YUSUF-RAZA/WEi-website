const Application = require('../../models/Application');
const Internship = require('../../models/Internship');

// @desc    Get candidate's applications
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .sort({ appliedAt: -1 });

    // Populate internship details for internship applications
    const populatedApplications = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (appObj.type === 'internship') {
          const internship = await Internship.findById(appObj.referenceId);
          appObj.internship = internship;
        }
        return appObj;
      })
    );

    res.json(populatedApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyApplications
};
