const CourseEnrollment = require('../../models/CourseEnrollment');
const { sendEnrollmentDecisionToCandidate } = require('../../utils/emailService');
const asyncHandler = require('../../middleware/asyncHandler');

// Get all enrollment requests
exports.getAllEnrollments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
    filter.status = status;
  }

  const enrollments = await CourseEnrollment.find(filter)
    .populate('candidate', 'name email phone')
    .populate('course', 'title description category level duration price originalPrice')
    .populate('respondedBy', 'name email')
    .sort('-appliedAt')
    .lean();

  res.json(enrollments);
});

// Accept enrollment
exports.acceptEnrollment = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { message } = req.body;

  const enrollment = await CourseEnrollment.findById(enrollmentId)
    .populate('candidate', 'name email')
    .populate('course', 'title');

  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  if (enrollment.status !== 'pending') {
    return res.status(400).json({ message: 'Enrollment has already been processed' });
  }

  if (!enrollment.paymentScreenshot || enrollment.paymentStatus !== 'completed') {
    return res.status(400).json({ message: 'Cannot accept enrollment without payment confirmation' });
  }

  enrollment.status = 'accepted';
  enrollment.courseStartDate = new Date();
  enrollment.message = message || '';
  enrollment.respondedAt = new Date();
  enrollment.respondedBy = req.user._id;

  await enrollment.save();

  // Send email asynchronously
  setImmediate(async () => {
    try {
      await sendEnrollmentDecisionToCandidate(
        enrollment.candidate.email,
        enrollment.candidate.name,
        enrollment.course.title,
        'accepted',
        message
      );
    } catch (emailError) {
      console.error('Error sending enrollment acceptance email:', emailError.message);
    }
  });

  res.json({
    message: 'Enrollment accepted successfully',
    enrollment
  });
});

// Reject enrollment
exports.rejectEnrollment = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { message } = req.body;

  const enrollment = await CourseEnrollment.findById(enrollmentId)
    .populate('candidate', 'name email')
    .populate('course', 'title');

  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  if (enrollment.status !== 'pending') {
    return res.status(400).json({ message: 'Enrollment has already been processed' });
  }

  enrollment.status = 'rejected';
  enrollment.message = message || '';
  enrollment.respondedAt = new Date();
  enrollment.respondedBy = req.user._id;

  await enrollment.save();

  // Send email asynchronously
  setImmediate(async () => {
    try {
      await sendEnrollmentDecisionToCandidate(
        enrollment.candidate.email,
        enrollment.candidate.name,
        enrollment.course.title,
        'rejected',
        message
      );
    } catch (emailError) {
      console.error('Error sending enrollment rejection email:', emailError.message);
    }
  });

  res.json({
    message: 'Enrollment rejected',
    enrollment
  });
});

// Unenroll candidate (manager action)
exports.unenrollCandidate = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { message } = req.body;

  const enrollment = await CourseEnrollment.findById(enrollmentId)
    .populate('candidate', 'name email')
    .populate('course', 'title');

  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  if (enrollment.status !== 'accepted') {
    return res.status(400).json({ message: 'Can only unenroll accepted enrollments' });
  }

  await CourseEnrollment.findByIdAndDelete(enrollmentId);

  // Send email asynchronously
  setImmediate(async () => {
    try {
      await sendEnrollmentDecisionToCandidate(
        enrollment.candidate.email,
        enrollment.candidate.name,
        enrollment.course.title,
        'unenrolled',
        message || 'You have been unenrolled from this course by the manager.'
      );
    } catch (emailError) {
      console.error('Error sending unenrollment email:', emailError.message);
    }
  });

  res.json({
    message: 'Candidate unenrolled successfully',
    enrollment
  });
});

// Get enrollment statistics
exports.getEnrollmentStats = asyncHandler(async (req, res) => {
  const stats = await CourseEnrollment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
      }
    }
  ]);

  const result = stats[0] || { total: 0, pending: 0, accepted: 0, rejected: 0 };
  res.json(result);
});
