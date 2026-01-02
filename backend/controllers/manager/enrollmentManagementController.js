const CourseEnrollment = require('../../models/CourseEnrollment');
const { sendEnrollmentDecisionToCandidate } = require('../../utils/emailService');

// Get all enrollment requests
exports.getAllEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      filter.status = status;
    } else {
      // By default, only show pending enrollments that need manager action
      filter.status = 'pending';
    }

    const enrollments = await CourseEnrollment.find(filter)
      .populate('candidate', 'name email phone')
      .populate('course', 'title description category level duration price originalPrice')
      .populate('respondedBy', 'name email')
      .sort('-appliedAt');

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
};

// Accept enrollment
exports.acceptEnrollment = async (req, res) => {
  try {
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

    // Check if payment has been made
    if (!enrollment.paymentScreenshot || enrollment.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'Cannot accept enrollment without payment confirmation' });
    }

    enrollment.status = 'accepted'; // Set to accepted after reviewing payment
    enrollment.courseStartDate = new Date(); // Course starts when manager approves
    enrollment.message = message || '';
    enrollment.respondedAt = new Date();
    enrollment.respondedBy = req.user._id;

    await enrollment.save();

    // Send email to candidate confirming course access
    await sendEnrollmentDecisionToCandidate(
      enrollment.candidate.email,
      enrollment.candidate.name,
      enrollment.course.title,
      'accepted',
      message
    );

    res.json({
      message: 'Enrollment accepted successfully',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting enrollment', error: error.message });
  }
};

// Reject enrollment
exports.rejectEnrollment = async (req, res) => {
  try {
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

    // Send email to candidate
    await sendEnrollmentDecisionToCandidate(
      enrollment.candidate.email,
      enrollment.candidate.name,
      enrollment.course.title,
      'rejected',
      message
    );

    res.json({
      message: 'Enrollment rejected',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting enrollment', error: error.message });
  }
};

// Unenroll candidate (manager action)
exports.unenrollCandidate = async (req, res) => {
  try {
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

    // Delete the enrollment record
    await CourseEnrollment.findByIdAndDelete(enrollmentId);

    // Send email notification to candidate
    await sendEnrollmentDecisionToCandidate(
      enrollment.candidate.email,
      enrollment.candidate.name,
      enrollment.course.title,
      'unenrolled',
      message || 'You have been unenrolled from this course by the manager.'
    );

    res.json({
      message: 'Candidate unenrolled successfully',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unenrolling candidate', error: error.message });
  }
};

// Get enrollment statistics
exports.getEnrollmentStats = async (req, res) => {
  try {
    const pending = await CourseEnrollment.countDocuments({ status: 'pending' });
    const accepted = await CourseEnrollment.countDocuments({ status: 'accepted' });
    const rejected = await CourseEnrollment.countDocuments({ status: 'rejected' });
    const total = pending + accepted + rejected;

    res.json({
      total,
      pending,
      accepted,
      rejected
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollment statistics', error: error.message });
  }
};
