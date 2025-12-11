const Course = require('../models/Course');
const Application = require('../models/Application');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'active' }).populate('instructor').sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Candidate)
const enrollCourse = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new course (Manager only)
// @route   POST /api/courses
// @access  Private (Manager)
const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  enrollCourse,
  createCourse
};
