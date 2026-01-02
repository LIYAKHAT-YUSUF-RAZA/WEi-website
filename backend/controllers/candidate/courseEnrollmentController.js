const CourseEnrollment = require('../../models/CourseEnrollment');
const Course = require('../../models/Course');
const User = require('../../models/User');
const { sendEnrollmentRequestToManager, sendEnrollmentConfirmationToCandidate } = require('../../utils/emailService');

// Create enrollment request - with auto-accept option for direct enrollment after payment
exports.createEnrollment = async (req, res) => {
  try {
    const { courseId, message, paymentMethod, paymentAmount, paymentScreenshot } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled or has pending request
    const existingEnrollment = await CourseEnrollment.findOne({
      candidate: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'pending') {
        return res.status(400).json({ message: 'You already have a pending enrollment request for this course' });
      }
      if (existingEnrollment.status === 'payment_pending') {
        return res.status(400).json({ message: 'Your enrollment has been approved. Please complete the payment.' });
      }
      if (existingEnrollment.status === 'accepted') {
        return res.status(400).json({ message: 'You are already enrolled in this course' });
      }
      if (existingEnrollment.status === 'unenrolled') {
        return res.status(400).json({ message: 'You have been unenrolled from this course. Please contact support.' });
      }
      // If rejected, allow to apply again
      if (existingEnrollment.status === 'rejected') {
        existingEnrollment.status = 'pending';
        existingEnrollment.message = message || '';
        existingEnrollment.paymentStatus = paymentScreenshot ? 'completed' : 'pending';
        existingEnrollment.paymentAmount = paymentAmount || course.price;
        existingEnrollment.paymentMethod = paymentMethod;
        existingEnrollment.transactionId = undefined;
        existingEnrollment.paymentScreenshot = paymentScreenshot;
        existingEnrollment.paidAt = paymentScreenshot ? new Date() : undefined;
        existingEnrollment.courseStartDate = undefined; // Will be set when manager approves
        existingEnrollment.appliedAt = new Date();
        existingEnrollment.respondedAt = null;
        existingEnrollment.respondedBy = null;
        
        const savedEnrollment = await existingEnrollment.save();

        // Send response immediately
        res.json({
          message: paymentScreenshot ? 'Enrollment request with payment submitted successfully. Awaiting manager approval.' : 'Enrollment request resubmitted successfully',
          enrollment: {
            _id: savedEnrollment._id,
            status: savedEnrollment.status,
            appliedAt: savedEnrollment.appliedAt,
            courseStartDate: savedEnrollment.courseStartDate,
            course: courseId,
            candidate: req.user._id
          }
        });

        // Send emails asynchronously (non-blocking)
        setImmediate(async () => {
          try {
            const managers = await User.find({ role: 'manager' }).select('email').lean();
            
            const emailPromises = [
              sendEnrollmentConfirmationToCandidate(req.user.email, req.user.name, course.title)
            ];
            
            if (managers.length > 0) {
              emailPromises.push(
                sendEnrollmentRequestToManager(
                  managers[0].email,
                  req.user.name,
                  req.user.email,
                  course.title,
                  savedEnrollment._id
                )
              );
            }
            
            await Promise.allSettled(emailPromises);
          } catch (error) {
            // Email error logged for monitoring
          }
        });

        return;
      }
    }

    // Create new enrollment with payment details if provided
    const enrollmentData = {
      candidate: req.user._id,
      course: courseId,
      message: message || '',
      status: 'pending',
      paymentStatus: paymentScreenshot ? 'completed' : 'pending',
      paymentAmount: paymentAmount || course.price,
      paymentMethod: paymentMethod,
      paymentScreenshot: paymentScreenshot,
      paidAt: paymentScreenshot ? new Date() : undefined,
      courseStartDate: undefined, // Will be set when manager approves
      respondedAt: null,
      respondedBy: null
    };
    
    const enrollment = new CourseEnrollment(enrollmentData);

    const savedEnrollment = await enrollment.save();

    // Send response immediately
    res.status(201).json({
      message: paymentScreenshot ? 'Enrollment request with payment submitted successfully. Awaiting manager approval.' : 'Enrollment request submitted successfully. You will receive an email once the manager reviews your request.',
      enrollment: {
        _id: savedEnrollment._id,
        status: savedEnrollment.status,
        appliedAt: savedEnrollment.appliedAt,
        courseStartDate: savedEnrollment.courseStartDate,
        course: courseId,
        candidate: req.user._id
      }
    });

    // Send emails asynchronously (non-blocking)
    setImmediate(async () => {
        try {
          const managers = await User.find({ role: 'manager' }).select('email').lean();
          
          const emailPromises = [
            sendEnrollmentConfirmationToCandidate(req.user.email, req.user.name, course.title)
          ];
          
          if (managers.length > 0) {
            emailPromises.push(
              sendEnrollmentRequestToManager(
                managers[0].email,
                req.user.name,
                req.user.email,
                course.title,
                savedEnrollment._id
              )
            );
          }
          
          await Promise.allSettled(emailPromises);
        } catch (error) {
          console.error('Error sending enrollment emails:', error);
        }
      });

  } catch (error) {
    res.status(500).json({ message: 'Error submitting enrollment request', error: error.message });
  }
};

// Get candidate's enrollments
exports.getMyEnrollments = async (req, res) => {
  try {
    // Use lean() for faster queries and select only needed fields
    const enrollments = await CourseEnrollment.find({ candidate: req.user._id })
      .select('course status appliedAt respondedAt courseStartDate paymentStatus paymentAmount paidAt message')
      .populate('course', 'title price originalPrice duration category level thumbnail')
      .populate('respondedBy', 'name email')
      .sort('-appliedAt')
      .lean();

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
};

// Cancel enrollment (only if pending)
exports.cancelEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await CourseEnrollment.findOne({
      _id: enrollmentId,
      candidate: req.user._id
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (enrollment.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending enrollment requests' });
    }

    await CourseEnrollment.findByIdAndDelete(enrollmentId);

    res.json({ message: 'Enrollment request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling enrollment', error: error.message });
  }
};

// Submit payment for accepted enrollment
exports.submitPayment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { paymentMethod, transactionId, paymentScreenshot } = req.body;

    // Find enrollment
    const enrollment = await CourseEnrollment.findOne({
      _id: enrollmentId,
      candidate: req.user._id
    }).populate('course', 'title price');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (enrollment.status !== 'payment_pending') {
      return res.status(400).json({ message: 'Payment is not required for this enrollment' });
    }

    if (!paymentMethod || !transactionId) {
      return res.status(400).json({ message: 'Payment information is required' });
    }

    if (!paymentScreenshot) {
      return res.status(400).json({ message: 'Payment screenshot is required' });
    }

    // Update enrollment with payment details
    enrollment.paymentStatus = 'completed';
    enrollment.paymentAmount = enrollment.course.price;
    enrollment.paymentMethod = paymentMethod;
    enrollment.transactionId = transactionId;
    enrollment.paymentScreenshot = paymentScreenshot;
    enrollment.paidAt = new Date();
    enrollment.courseStartDate = new Date(); // Course begins when payment is completed
    enrollment.status = 'accepted'; // Change from payment_pending to accepted

    await enrollment.save();

    res.json({
      message: 'Payment submitted successfully. Your course has started and you can now access all materials!',
      enrollment: {
        _id: enrollment._id,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        courseStartDate: enrollment.courseStartDate
      }
    });

    // Send confirmation email asynchronously
    setImmediate(async () => {
      try {
        const User = require('../../models/User');
        const candidate = await User.findById(req.user._id);
        const { sendPaymentConfirmationToCandidate } = require('../../utils/emailService');
        
        await sendPaymentConfirmationToCandidate(
          candidate.email,
          candidate.name,
          enrollment.course.title,
          enrollment.paymentAmount,
          transactionId
        );
      } catch (error) {
        // Email error logged for monitoring
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting payment', error: error.message });
  }
};

// Check enrollment status for a course
exports.checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await CourseEnrollment.findOne({
      candidate: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.json({ enrolled: false, status: null });
    }

    res.json({
      enrolled: true,
      status: enrollment.status,
      enrollmentId: enrollment._id,
      appliedAt: enrollment.appliedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking enrollment status', error: error.message });
  }
};
