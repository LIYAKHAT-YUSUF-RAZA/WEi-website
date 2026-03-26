const CompanyInfo = require('../models/CompanyInfo');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get company information
// @route   GET /api/company
// @access  Public
const getCompanyInfo = asyncHandler(async (req, res) => {
  let companyInfo = await CompanyInfo.findOne();

  // If no company info exists, create default
  if (!companyInfo) {
    companyInfo = await CompanyInfo.create({
      name: 'WEintegrity',
      description: 'Leading technology solutions and training provider',
      mission: 'Empowering the next generation of tech professionals',
      vision: 'To be the most trusted partner in technology education and innovation',
      foundedYear: 2020,
      services: [
        {
          title: 'Professional Training',
          description: 'Industry-relevant courses and certifications',
          icon: 'graduation-cap'
        },
        {
          title: 'Internship Programs',
          description: 'Real-world experience with expert mentorship',
          icon: 'briefcase'
        },
        {
          title: 'Technology Solutions',
          description: 'Custom software development and consulting',
          icon: 'code'
        }
      ]
    });
  }

  res.json(companyInfo);
});

// @desc    Update company information
// @route   PUT /api/company
// @access  Private (Manager)
const updateCompanyInfo = asyncHandler(async (req, res) => {
  let companyInfo = await CompanyInfo.findOne();

  if (!companyInfo) {
    companyInfo = await CompanyInfo.create(req.body);
  } else {
    companyInfo = await CompanyInfo.findByIdAndUpdate(
      companyInfo._id,
      req.body,
      { new: true, runValidators: true }
    );
  }

  res.json(companyInfo);
});

module.exports = {
  getCompanyInfo,
  updateCompanyInfo
};
