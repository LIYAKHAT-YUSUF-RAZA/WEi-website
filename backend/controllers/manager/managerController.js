const Application = require('../../models/Application');
const NotificationSettings = require('../../models/NotificationSettings');
const Course = require('../../models/Course');
const Internship = require('../../models/Internship');
const CourseEnrollment = require('../../models/CourseEnrollment');
const nodemailer = require('nodemailer');

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// @desc    Get all applications
// @route   GET /api/manager/applications
// @access  Private (Manager)
const getAllApplications = async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = { type: 'internship' }; // Only get internship applications
    
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('candidateId', 'name email phone')
      .sort({ createdAt: -1 });

    // Manually populate referenceId with Internship details
    const populatedApplications = await Promise.all(
      applications.map(async (app) => {
        const internship = await Internship.findById(app.referenceId);
        return {
          ...app.toObject(),
          referenceId: internship
        };
      })
    );

    res.json(populatedApplications);
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/manager/applications/:id
// @access  Private (Manager)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('candidateId', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Get internship details
    const internship = await Internship.findById(application.referenceId);

    application.status = status;
    application.message = message || application.message;
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user._id;

    await application.save();

    // Send email to candidate using emailService
    const { sendInternshipApplicationDecisionToCandidate } = require('../../utils/emailService');
    await sendInternshipApplicationDecisionToCandidate(
      application.candidateId.email,
      application.candidateId.name,
      internship?.title || 'Internship Position',
      status,
      message
    );

    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notification settings
// @route   GET /api/manager/notification-settings
// @access  Private (Manager)
const getNotificationSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ managerId: req.user._id });
    
    if (!settings) {
      settings = await NotificationSettings.create({ managerId: req.user._id });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update notification settings
// @route   PUT /api/manager/notification-settings
// @access  Private (Manager)
const updateNotificationSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ managerId: req.user._id });
    
    if (!settings) {
      settings = await NotificationSettings.create({
        managerId: req.user._id,
        ...req.body
      });
    } else {
      settings = await NotificationSettings.findOneAndUpdate(
        { managerId: req.user._id },
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/manager/stats
// @access  Private (Manager)
const getDashboardStats = async (req, res) => {
  try {
    // Get Application stats
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    
    // Get Enrollment stats
    const totalEnrollments = await CourseEnrollment.countDocuments();
    const pendingEnrollments = await CourseEnrollment.countDocuments({ status: 'pending' });
    const paymentPendingEnrollments = await CourseEnrollment.countDocuments({ status: 'payment_pending' });
    const acceptedEnrollments = await CourseEnrollment.countDocuments({ status: 'accepted' });
    const rejectedEnrollments = await CourseEnrollment.countDocuments({ status: 'rejected' });
    
    // Combined stats (Applications + Enrollments)
    const combinedTotal = totalApplications + totalEnrollments;
    const combinedPending = pendingApplications + pendingEnrollments + paymentPendingEnrollments;
    const combinedAccepted = acceptedApplications + acceptedEnrollments;
    const combinedRejected = rejectedApplications + rejectedEnrollments;
    
    const courseApplications = await Application.countDocuments({ type: 'course' });
    const internshipApplications = await Application.countDocuments({ type: 'internship' });

    const totalCourses = await Course.countDocuments({ status: 'active' });
    const totalInternships = await Internship.countDocuments({ status: 'open' });

    res.json({
      applications: {
        total: combinedTotal,
        pending: combinedPending,
        accepted: combinedAccepted,
        rejected: combinedRejected,
        courses: courseApplications,
        internships: internshipApplications
      },
      courses: totalCourses,
      internships: totalInternships
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/manager/courses
// @access  Private (Manager)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      level,
      syllabus,
      prerequisites,
      learningOutcomes,
      instructor,
      instructorDetails,
      price,
      originalPrice,
      discountPercentage,
      startDate,
      endDate,
      maxStudents,
      thumbnail
    } = req.body;

    console.log('Received course data:', { price, originalPrice, discountPercentage, instructor, instructorDetails });

    // Validate required fields
    if (!title || !description || !category || !duration) {
      return res.status(400).json({ 
        message: 'Please provide title, description, category, and duration' 
      });
    }

    const course = new Course({
      title,
      description,
      category,
      duration,
      level: level || 'Beginner',
      syllabus: syllabus || [],
      prerequisites: prerequisites || [],
      learningOutcomes: learningOutcomes || [],
      instructor: instructor || null,
      instructorDetails: instructorDetails || {},
      price: price || 0,
      originalPrice: originalPrice !== undefined ? originalPrice : 0,
      discountPercentage: discountPercentage || 0,
      startDate,
      endDate,
      maxStudents: maxStudents || 30,
      thumbnail: thumbnail || '',
      status: 'active',
      enrolled: 0
    });

    const savedCourse = await course.save();
    console.log('Saved course:', { price: savedCourse.price, originalPrice: savedCourse.originalPrice });
    res.status(201).json({ 
      message: 'Course created successfully', 
      course: savedCourse 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new internship
// @route   POST /api/manager/internships
// @access  Private (Manager)
const createInternship = async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      location,
      type,
      duration,
      stipend,
      requirements,
      responsibilities,
      skills,
      startDate,
      applicationDeadline,
      openings,
      image
    } = req.body;

    // Validate required fields
    if (!title || !description || !department || !location || !duration) {
      return res.status(400).json({ 
        message: 'Please provide title, description, department, location, and duration' 
      });
    }

    const internship = new Internship({
      title,
      description,
      department,
      location,
      type: type || 'Remote',
      duration,
      stipend: stipend || 'Unpaid',
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      skills: skills || [],
      startDate,
      applicationDeadline,
      openings: openings || 1,
      applicants: 0,
      status: 'open',
      image: image || ''
    });

    const savedInternship = await internship.save();
    res.status(201).json({ 
      message: 'Internship created successfully', 
      internship: savedInternship 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses created by manager
// @route   GET /api/manager/courses
// @access  Private (Manager)
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor').sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all internships created by manager
// @route   GET /api/manager/internships
// @access  Private (Manager)
const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/manager/courses/:id
// @access  Private (Manager)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log('Update course request body:', req.body);
    console.log('Instructor value:', req.body.instructor);
    console.log('InstructorDetails value:', req.body.instructorDetails);

    // Handle instructor assignment properly
    if (req.body.instructor && req.body.instructor.trim()) {
      // If instructor ID is provided, convert to ObjectId and use it
      course.instructor = req.body.instructor;
      course.instructorDetails = undefined;
      console.log('Setting instructor reference to:', req.body.instructor);
    } else if (req.body.instructorDetails && req.body.instructorDetails.name) {
      // If manual details provided, use them and clear instructor reference
      course.instructor = null;
      course.instructorDetails = req.body.instructorDetails;
      console.log('Setting manual instructor details:', req.body.instructorDetails);
    }
    
    // Update all other fields (excluding instructor-related fields)
    const { instructor, instructorDetails, instructorName, instructorBio, instructorImage, instructorExperience, instructorRating, ...otherFields } = req.body;
    Object.assign(course, otherFields);
    
    const updatedCourse = await course.save();
    
    // Populate instructor before returning
    await updatedCourse.populate('instructor');
    
    console.log('Updated course after save - instructor:', updatedCourse.instructor);
    console.log('Updated course after save - instructorDetails:', updatedCourse.instructorDetails);
    
    res.json({ 
      message: 'Course updated successfully', 
      course: updatedCourse 
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update internship
// @route   PUT /api/manager/internships/:id
// @access  Private (Manager)
const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    Object.assign(internship, req.body);
    const updatedInternship = await internship.save();
    
    res.json({ 
      message: 'Internship updated successfully', 
      internship: updatedInternship 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/manager/courses/:id
// @access  Private (Manager)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete internship
// @route   DELETE /api/manager/internships/:id
// @access  Private (Manager)
const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    await internship.deleteOne();
    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get application stats
// @route   GET /api/manager/applications/stats
// @access  Private (Manager)
const getApplicationStats = async (req, res) => {
  try {
    const total = await Application.countDocuments({ type: 'internship' });
    const pending = await Application.countDocuments({ type: 'internship', status: 'pending' });
    const accepted = await Application.countDocuments({ type: 'internship', status: 'accepted' });
    const rejected = await Application.countDocuments({ type: 'internship', status: 'rejected' });

    res.json({ total, pending, accepted, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllApplications,
  updateApplicationStatus,
  getApplicationStats,
  getNotificationSettings,
  updateNotificationSettings,
  getDashboardStats,
  createCourse,
  createInternship,
  getAllCourses,
  getAllInternships,
  updateCourse,
  updateInternship,
  deleteCourse,
  deleteInternship
};
