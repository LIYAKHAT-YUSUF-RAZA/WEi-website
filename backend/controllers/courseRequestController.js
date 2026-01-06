const CourseRequest = require('../models/CourseRequest');
const User = require('../models/User');
const Course = require('../models/Course');
const { sendCourseRequestNotification, sendCourseRequestDecision } = require('../utils/emailService');

// @desc    Create a new course request
// @route   POST /api/course-requests
// @access  Private (Candidate)
const createCourseRequest = async (req, res) => {
  try {
    const { courseId, message } = req.body;
    const candidateId = req.user._id;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if candidate already requested this course
    const existingRequest = await CourseRequest.findOne({
      candidateId,
      courseId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested enrollment for this course' });
    }

    // Create the course request
    const courseRequest = new CourseRequest({
      candidateId,
      courseId,
      candidateName: req.user.fullName || req.user.email,
      candidateEmail: req.user.email,
      courseName: course.name,
      message: message || ''
    });

    await courseRequest.save();

    // Send notification email to manager
    const managers = await User.find({ 
      'permissions.canManageCourses': true 
    });

    for (const manager of managers) {
      try {
        await sendCourseRequestNotification(
          manager.email,
          manager.fullName || manager.email,
          courseRequest.candidateName,
          courseRequest.candidateEmail,
          courseRequest.courseName
        );
      } catch (emailError) {
        console.error('Error sending notification to manager:', emailError);
      }
    }

    res.status(201).json({
      message: 'Course request created successfully',
      courseRequest
    });
  } catch (error) {
    console.error('Error creating course request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all course requests (manager view)
// @route   GET /api/course-requests
// @access  Private (Manager with fullAccess)
const getCourseRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const courseRequests = await CourseRequest.find(query)
      .populate('candidateId', 'fullName email')
      .populate('courseId', 'name')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 });

    const counts = {
      total: await CourseRequest.countDocuments(),
      pending: await CourseRequest.countDocuments({ status: 'pending' }),
      approved: await CourseRequest.countDocuments({ status: 'approved' }),
      rejected: await CourseRequest.countDocuments({ status: 'rejected' })
    };

    res.status(200).json({
      courseRequests,
      counts
    });
  } catch (error) {
    console.error('Error fetching course requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific course request
// @route   GET /api/course-requests/:id
// @access  Private (Manager with fullAccess)
const getCourseRequestById = async (req, res) => {
  try {
    const courseRequest = await CourseRequest.findById(req.params.id)
      .populate('candidateId', 'fullName email')
      .populate('courseId', 'name')
      .populate('approvedBy', 'fullName email');

    if (!courseRequest) {
      return res.status(404).json({ message: 'Course request not found' });
    }

    res.status(200).json(courseRequest);
  } catch (error) {
    console.error('Error fetching course request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a course request
// @route   PUT /api/course-requests/:id/approve
// @access  Private (Manager with fullAccess)
const approveCourseRequest = async (req, res) => {
  try {
    const courseRequest = await CourseRequest.findById(req.params.id);

    if (!courseRequest) {
      return res.status(404).json({ message: 'Course request not found' });
    }

    if (courseRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update the course request
    courseRequest.status = 'approved';
    courseRequest.approvedBy = req.user._id;
    courseRequest.updatedAt = Date.now();

    await courseRequest.save();

    // Enroll the candidate in the course if not already enrolled
    const CourseEnrollment = require('../models/CourseEnrollment');
    const existingEnrollment = await CourseEnrollment.findOne({
      candidateId: courseRequest.candidateId,
      courseId: courseRequest.courseId
    });

    if (!existingEnrollment) {
      const enrollment = new CourseEnrollment({
        candidateId: courseRequest.candidateId,
        courseId: courseRequest.courseId,
        status: 'approved'
      });
      await enrollment.save();
    }

    // Send approval email to candidate
    try {
      await sendCourseRequestDecision(
        courseRequest.candidateEmail,
        courseRequest.candidateName,
        courseRequest.courseName,
        'approved',
        ''
      );
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    res.status(200).json({
      message: 'Course request approved successfully',
      courseRequest
    });
  } catch (error) {
    console.error('Error approving course request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a course request
// @route   PUT /api/course-requests/:id/reject
// @access  Private (Manager with fullAccess)
const rejectCourseRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const courseRequest = await CourseRequest.findById(req.params.id);

    if (!courseRequest) {
      return res.status(404).json({ message: 'Course request not found' });
    }

    if (courseRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update the course request
    courseRequest.status = 'rejected';
    courseRequest.rejectionReason = rejectionReason || '';
    courseRequest.updatedAt = Date.now();

    await courseRequest.save();

    // Send rejection email to candidate
    try {
      await sendCourseRequestDecision(
        courseRequest.candidateEmail,
        courseRequest.candidateName,
        courseRequest.courseName,
        'rejected',
        rejectionReason || ''
      );
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    res.status(200).json({
      message: 'Course request rejected successfully',
      courseRequest
    });
  } catch (error) {
    console.error('Error rejecting course request:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourseRequest,
  getCourseRequests,
  getCourseRequestById,
  approveCourseRequest,
  rejectCourseRequest
};
