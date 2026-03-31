const Application = require('../../models/Application');
const NotificationSettings = require('../../models/NotificationSettings');
const Course = require('../../models/Course');
const Internship = require('../../models/Internship');
const CourseEnrollment = require('../../models/CourseEnrollment');
const Service = require('../../models/Service');
const ManagerRequest = require('../../models/ManagerRequest');
const nodemailer = require('nodemailer');
const dashboardCache = require('../../utils/dashboardCache');

// Try to load optional models (may not exist)
let ServiceProviderRequest, CourseRequest;
try { ServiceProviderRequest = require('../../models/ServiceProviderRequest'); } catch (e) { }
try { CourseRequest = require('../../models/CourseRequest'); } catch (e) { }

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
      .sort({ createdAt: -1 })
      .lean();

    // Batch-fetch all internships at once instead of N+1 individual queries
    const internshipIds = [...new Set(applications.map(app => app.referenceId?.toString()).filter(Boolean))];
    const internships = await Internship.find({ _id: { $in: internshipIds } }).lean();
    const internshipMap = {};
    internships.forEach(i => { internshipMap[i._id.toString()] = i; });

    const populatedApplications = applications.map(app => ({
      ...app,
      referenceId: internshipMap[app.referenceId?.toString()] || null
    }));

    res.json(populatedApplications);
  } catch (error) {
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

    // Send email to candidate using emailService (non-blocking)
    try {
      const { sendInternshipApplicationDecisionToCandidate } = require('../../utils/emailService');
      await sendInternshipApplicationDecisionToCandidate(
        application.candidateId.email,
        application.candidateId.name,
        internship?.title || 'Internship Position',
        status,
        message
      );
    } catch (emailError) {
      // Email sending failed (non-critical)
    }

    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notification settings
// @route   GET /api/manager/notification-settings
// @access  Private (Manager)
const getNotificationSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ managerId: req.user._id }).lean();

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
    // Use aggregation pipelines instead of 13 separate countDocuments calls
    const [appStats, enrollStats, courseCount, internshipCount] = await Promise.all([
      // Single aggregation for all Application counts
      Application.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            courses: { $sum: { $cond: [{ $eq: ['$type', 'course'] }, 1, 0] } },
            internships: { $sum: { $cond: [{ $eq: ['$type', 'internship'] }, 1, 0] } }
          }
        }
      ]),
      // Single aggregation for all CourseEnrollment counts
      CourseEnrollment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            payment_pending: { $sum: { $cond: [{ $eq: ['$status', 'payment_pending'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]),
      // Course and Internship counts
      Course.countDocuments({ status: 'active' }),
      Internship.countDocuments({ status: 'open' })
    ]);

    const app = appStats[0] || { total: 0, pending: 0, accepted: 0, rejected: 0, courses: 0, internships: 0 };
    const enroll = enrollStats[0] || { total: 0, pending: 0, payment_pending: 0, accepted: 0, rejected: 0 };

    // Combined stats (Applications + Enrollments)
    const combinedTotal = app.total + enroll.total;
    const combinedPending = app.pending + enroll.pending + enroll.payment_pending;
    const combinedAccepted = app.accepted + enroll.accepted;
    const combinedRejected = app.rejected + enroll.rejected;

    res.json({
      applications: {
        total: combinedTotal,
        pending: combinedPending,
        accepted: combinedAccepted,
        rejected: combinedRejected,
        courses: app.courses,
        internships: app.internships
      },
      courses: courseCount,
      internships: internshipCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
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
    const courses = await Course.find().populate('instructor').sort({ createdAt: -1 }).lean();
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
    const internships = await Internship.find().sort({ createdAt: -1 }).lean();
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all services
// @route   GET /api/manager/services
// @access  Private (Manager)
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    res.json(services);
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

    // Handle instructor assignment properly
    if (req.body.instructor && req.body.instructor.trim()) {
      course.instructor = req.body.instructor;
      course.instructorDetails = undefined;
    } else if (req.body.instructorDetails && req.body.instructorDetails.name) {
      course.instructor = null;
      course.instructorDetails = req.body.instructorDetails;
    }

    // Update all other fields (excluding instructor-related fields)
    const { instructor, instructorDetails, instructorName, instructorBio, instructorImage, instructorExperience, instructorRating, ...otherFields } = req.body;
    Object.assign(course, otherFields);

    const updatedCourse = await course.save();

    // Populate instructor before returning
    await updatedCourse.populate('instructor');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
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
    // Single aggregation instead of 4 separate countDocuments calls
    const stats = await Application.aggregate([
      { $match: { type: 'internship' } },
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL dashboard data in a single request (consolidated endpoint)
// @route   GET /api/manager/dashboard
// @access  Private (Manager)
const getDashboardData = async (req, res) => {
  try {
    const cacheKey = `dashboard_${req.user._id}`;
    const cached = dashboardCache.get(cacheKey);
    if (cached) return res.json(cached);

    const [
      applications,
      enrollments,
      appStats,
      enrollStats,
      courseCount,
      internshipCount,
      notificationSettings,
      managerRequests,
      courseRequests,
      serviceProviderRequests
    ] = await Promise.all([
      // 1. Applications — only fields needed for the dashboard table
      Application.find({ type: 'internship' })
        .populate('candidateId', 'name email')
        .select('candidateId referenceId status type appliedAt createdAt')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      // 2. Enrollments — only fields needed for the dashboard table
      CourseEnrollment.find()
        .populate('candidate', 'name email')
        .populate('course', 'title')
        .select('candidate course status appliedAt paymentScreenshot')
        .sort({ appliedAt: -1 })
        .limit(50)
        .lean(),

      // 3. Application stats aggregation
      Application.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            courses: { $sum: { $cond: [{ $eq: ['$type', 'course'] }, 1, 0] } },
            internships: { $sum: { $cond: [{ $eq: ['$type', 'internship'] }, 1, 0] } }
          }
        }
      ]),

      // 4. Enrollment stats aggregation
      CourseEnrollment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            payment_pending: { $sum: { $cond: [{ $eq: ['$status', 'payment_pending'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]),

      // 5 & 6. Counts
      Course.countDocuments({ status: 'active' }),
      Internship.countDocuments({ status: 'open' }),

      // 7. Notification settings
      NotificationSettings.findOne({ managerId: req.user._id }).lean(),

      // 8. Pending counts for badges
      ManagerRequest ? ManagerRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0),
      CourseRequest ? CourseRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0),
      ServiceProviderRequest ? ServiceProviderRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0)
    ]);

    // Batch-fetch internship titles for applications
    const internshipIds = [...new Set(applications.map(a => a.referenceId?.toString()).filter(Boolean))];
    const internships = internshipIds.length > 0
      ? await Internship.find({ _id: { $in: internshipIds } }).select('title').lean()
      : [];
    const internshipMap = {};
    internships.forEach(i => { internshipMap[i._id.toString()] = i; });

    const populatedApps = applications.map(app => ({
      ...app,
      referenceId: internshipMap[app.referenceId?.toString()] || null
    }));

    // Build stats
    const app = appStats[0] || { total: 0, pending: 0, accepted: 0, rejected: 0, courses: 0, internships: 0 };
    const enroll = enrollStats[0] || { total: 0, pending: 0, payment_pending: 0, accepted: 0, rejected: 0 };

    const responseData = {
      applications: populatedApps,
      enrollments,
      stats: {
        applications: {
          total: app.total + enroll.total,
          pending: app.pending + enroll.pending + (enroll.payment_pending || 0),
          accepted: app.accepted + enroll.accepted,
          rejected: app.rejected + enroll.rejected,
          courses: app.courses,
          internships: app.internships
        },
        courses: courseCount,
        internships: internshipCount
      },
      notificationSettings: notificationSettings || { emailNotifications: false },
      pendingCounts: {
        enrollments: enroll.pending + (enroll.payment_pending || 0),
        applications: app.pending,
        managerRequests,
        courseRequests,
        serviceProviderRequests
      }
    };

    dashboardCache.set(cacheKey, responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Dashboard data error:', error);
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
  getDashboardData,
  createCourse,
  createInternship,
  getAllCourses,
  getAllInternships,
  getAllServices,
  updateCourse,
  updateInternship,
  deleteCourse,
  deleteInternship
};
