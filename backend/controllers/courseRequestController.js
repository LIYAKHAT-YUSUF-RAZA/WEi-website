const CourseRequest = require('../models/CourseRequest');
const User = require('../models/User');
const Course = require('../models/Course');
const { sendCourseRequestNotification, sendCourseRequestDecision } = require('../utils/emailService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new course request
// @route   POST /api/course-requests
// @access  Private (Candidate)
const createCourseRequest = asyncHandler(async (req, res) => {
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

  // Send notification emails asynchronously
  setImmediate(async () => {
    try {
      const managers = await User.find({ 'permissions.canManageCourses': true });
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
          console.error('Error sending notification to manager:', emailError.message);
        }
      }
    } catch (err) {
      console.error('Error sending course request notifications:', err.message);
    }
  });

  res.status(201).json({
    message: 'Course request created successfully',
    courseRequest
  });
});

// @desc    Get all course requests (manager view)
// @route   GET /api/course-requests
// @access  Private (Manager with fullAccess)
const getCourseRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  const [courseRequests, countResult] = await Promise.all([
    CourseRequest.find(query)
      .populate('candidateId', 'fullName email')
      .populate('courseId', 'name')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean(),
    CourseRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ])
  ]);

  const counts = countResult[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

  res.status(200).json({
    courseRequests,
    counts
  });
});

// @desc    Get a specific course request
// @route   GET /api/course-requests/:id
// @access  Private (Manager with fullAccess)
const getCourseRequestById = asyncHandler(async (req, res) => {
  const courseRequest = await CourseRequest.findById(req.params.id)
    .populate('candidateId', 'fullName email')
    .populate('courseId', 'name')
    .populate('approvedBy', 'fullName email');

  if (!courseRequest) {
    return res.status(404).json({ message: 'Course request not found' });
  }

  res.status(200).json(courseRequest);
});

// @desc    Approve a course request
// @route   PUT /api/course-requests/:id/approve
// @access  Private (Manager with fullAccess)
const approveCourseRequest = asyncHandler(async (req, res) => {
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

  // Send approval email asynchronously
  setImmediate(async () => {
    try {
      await sendCourseRequestDecision(
        courseRequest.candidateEmail,
        courseRequest.candidateName,
        courseRequest.courseName,
        'approved',
        ''
      );
    } catch (emailError) {
      console.error('Error sending approval email:', emailError.message);
    }
  });

  res.status(200).json({
    message: 'Course request approved successfully',
    courseRequest
  });
});

// @desc    Reject a course request
// @route   PUT /api/course-requests/:id/reject
// @access  Private (Manager with fullAccess)
const rejectCourseRequest = asyncHandler(async (req, res) => {
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

  // Send rejection email asynchronously
  setImmediate(async () => {
    try {
      await sendCourseRequestDecision(
        courseRequest.candidateEmail,
        courseRequest.candidateName,
        courseRequest.courseName,
        'rejected',
        rejectionReason || ''
      );
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError.message);
    }
  });

  res.status(200).json({
    message: 'Course request rejected successfully',
    courseRequest
  });
});

module.exports = {
  createCourseRequest,
  getCourseRequests,
  getCourseRequestById,
  approveCourseRequest,
  rejectCourseRequest
};
