const Application = require('../../models/Application');
const Internship = require('../../models/Internship');
const asyncHandler = require('../../middleware/asyncHandler');

// @desc    Get candidate's applications
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidateId: req.user._id })
    .select('type referenceId status appliedAt candidateDetails')
    .sort({ appliedAt: -1 })
    .lean();

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

  const populatedApplications = applications.map(app => {
    if (app.type === 'internship') {
      app.internship = internshipMap[app.referenceId.toString()];
    }
    return app;
  });

  res.json(populatedApplications);
});

module.exports = {
  getMyApplications
};
