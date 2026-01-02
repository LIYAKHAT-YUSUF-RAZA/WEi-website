const Application = require('../../models/Application');
const Internship = require('../../models/Internship');

// @desc    Get candidate's applications
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
const getMyApplications = async (req, res) => {
  try {
    // Optimized query with lean() and selective population
    const applications = await Application.find({ candidateId: req.user._id })
      .select('type referenceId status appliedAt candidateDetails')
      .sort({ appliedAt: -1 })
      .lean();

    // Only populate internship details for internship applications (optimized)
    const internshipIds = applications
      .filter(app => app.type === 'internship')
      .map(app => app.referenceId);
      
    const internships = await Internship.find({ _id: { $in: internshipIds } })
      .select('title description department location type duration stipend')
      .lean();
      
    const internshipMap = internships.reduce((map, internship) => {
      map[internship._id.toString()] = internship;
      return map;
    }, {});

    // Attach internship details to applications
    const populatedApplications = applications.map(app => {
      if (app.type === 'internship') {
        app.internship = internshipMap[app.referenceId.toString()];
      }
      return app;
    });

    res.json(populatedApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyApplications
};
