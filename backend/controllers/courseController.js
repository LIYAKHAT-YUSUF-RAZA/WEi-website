const Course = require('../models/Course');
const Application = require('../models/Application');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({
    $or: [
      { status: 'active' },
      { status: { $exists: false } }
    ]
  })
    .select('title description price originalPrice discountPercentage category level duration instructor instructorDetails thumbnail image createdAt updatedAt')
    .populate('instructor', 'name bio expertise')
    .sort({ createdAt: -1 })
    .lean();

  res.json(courses);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor');

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  res.json(course);
});

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Candidate)
const enrollCourse = asyncHandler(async (req, res) => {
  const { candidateDetails } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check if already enrolled
  const existingApplication = await Application.findOne({
    candidateId: req.user._id,
    type: 'course',
    referenceId: req.params.id
  });

  if (existingApplication) {
    return res.status(400).json({ message: 'Already enrolled in this course' });
  }

  const application = await Application.create({
    candidateId: req.user._id,
    type: 'course',
    referenceId: req.params.id,
    candidateDetails: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      ...candidateDetails
    }
  });

  // Update enrolled count
  course.enrolled += 1;
  await course.save();

  res.status(201).json({ message: 'Successfully enrolled in course', application });
});

// @desc    Create new course (Manager only)
// @route   POST /api/courses
// @access  Private (Manager)
const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
});

module.exports = {
  getCourses,
  getCourseById,
  enrollCourse,
  createCourse
};
