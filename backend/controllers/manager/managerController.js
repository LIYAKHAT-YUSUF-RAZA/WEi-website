const Application = require('../../models/Application');
const NotificationSettings = require('../../models/NotificationSettings');
const Course = require('../../models/Course');
const Internship = require('../../models/Internship');
const CourseEnrollment = require('../../models/CourseEnrollment');
const Service = require('../../models/Service');
const ManagerRequest = require('../../models/ManagerRequest');
const nodemailer = require('nodemailer');
const dashboardCache = require('../../utils/dashboardCache');
const asyncHandler = require('../../middleware/asyncHandler');

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
const getAllApplications = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  let query = { type: 'internship' };

  if (status) query.status = status;

  const applications = await Application.find(query)
    .populate('candidateId', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();

  const internshipIds = [...new Set(applications.map(app => app.referenceId?.toString()).filter(Boolean))];
  const internships = await Internship.find({ _id: { $in: internshipIds } }).lean();
  const internshipMap = {};
  internships.forEach(i => { internshipMap[i._id.toString()] = i; });

  const populatedApplications = applications.map(app => ({
    ...app,
    referenceId: internshipMap[app.referenceId?.toString()] || null
  }));

  res.json(populatedApplications);
});

// @desc    Update application status
// @route   PUT /api/manager/applications/:id
// @access  Private (Manager)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('candidateId', 'name email');

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const internship = await Internship.findById(application.referenceId);

  application.status = status;
  application.message = message || application.message;
  application.reviewedAt = Date.now();
  application.reviewedBy = req.user._id;

  await application.save();

  // Send email asynchronously
  setImmediate(async () => {
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
      console.error('Error sending application decision email:', emailError.message);
    }
  });

  res.json({ message: 'Application updated successfully', application });
});

// @desc    Get notification settings
// @route   GET /api/manager/notification-settings
// @access  Private (Manager)
const getNotificationSettings = asyncHandler(async (req, res) => {
  let settings = await NotificationSettings.findOne({ managerId: req.user._id }).lean();

  if (!settings) {
    settings = await NotificationSettings.create({ managerId: req.user._id });
  }

  res.json(settings);
});

// @desc    Update notification settings
// @route   PUT /api/manager/notification-settings
// @access  Private (Manager)
const updateNotificationSettings = asyncHandler(async (req, res) => {
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
});

// @desc    Get dashboard statistics
// @route   GET /api/manager/stats
// @access  Private (Manager)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [appStats, enrollStats, courseCount, internshipCount] = await Promise.all([
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
    Course.countDocuments({ status: 'active' }),
    Internship.countDocuments({ status: 'open' })
  ]);

  const app = appStats[0] || { total: 0, pending: 0, accepted: 0, rejected: 0, courses: 0, internships: 0 };
  const enroll = enrollStats[0] || { total: 0, pending: 0, payment_pending: 0, accepted: 0, rejected: 0 };

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
});

// @desc    Create a new course
// @route   POST /api/manager/courses
// @access  Private (Manager)
const createCourse = asyncHandler(async (req, res) => {
  const {
    title, description, category, duration, level, syllabus, prerequisites,
    learningOutcomes, instructor, instructorDetails, price, originalPrice,
    discountPercentage, startDate, endDate, maxStudents, thumbnail
  } = req.body;

  if (!title || !description || !category || !duration) {
    return res.status(400).json({
      message: 'Please provide title, description, category, and duration'
    });
  }

  const course = new Course({
    title, description, category, duration,
    level: level || 'Beginner',
    syllabus: syllabus || [],
    prerequisites: prerequisites || [],
    learningOutcomes: learningOutcomes || [],
    instructor: instructor || null,
    instructorDetails: instructorDetails || {},
    price: price || 0,
    originalPrice: originalPrice !== undefined ? originalPrice : 0,
    discountPercentage: discountPercentage || 0,
    startDate, endDate,
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
});

// @desc    Create a new internship
// @route   POST /api/manager/internships
// @access  Private (Manager)
const createInternship = asyncHandler(async (req, res) => {
  const {
    title, description, department, location, type, duration, stipend,
    requirements, responsibilities, skills, startDate, applicationDeadline,
    openings, image
  } = req.body;

  if (!title || !description || !department || !location || !duration) {
    return res.status(400).json({
      message: 'Please provide title, description, department, location, and duration'
    });
  }

  const internship = new Internship({
    title, description, department, location,
    type: type || 'Remote',
    duration,
    stipend: stipend || 'Unpaid',
    requirements: requirements || [],
    responsibilities: responsibilities || [],
    skills: skills || [],
    startDate, applicationDeadline,
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
});

// @desc    Get all courses created by manager
// @route   GET /api/manager/courses
// @access  Private (Manager)
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate('instructor').sort({ createdAt: -1 }).lean();
  res.json(courses);
});

// @desc    Get all internships created by manager
// @route   GET /api/manager/internships
// @access  Private (Manager)
const getAllInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find().sort({ createdAt: -1 }).lean();
  res.json(internships);
});

// @desc    Get all services
// @route   GET /api/manager/services
// @access  Private (Manager)
const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find()
    .populate('provider', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();
  res.json(services);
});

// @desc    Update course
// @route   PUT /api/manager/courses/:id
// @access  Private (Manager)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (req.body.instructor && req.body.instructor.trim()) {
    course.instructor = req.body.instructor;
    course.instructorDetails = undefined;
  } else if (req.body.instructorDetails && req.body.instructorDetails.name) {
    course.instructor = null;
    course.instructorDetails = req.body.instructorDetails;
  }

  const { instructor, instructorDetails, instructorName, instructorBio, instructorImage, instructorExperience, instructorRating, ...otherFields } = req.body;
  Object.assign(course, otherFields);

  const updatedCourse = await course.save();
  await updatedCourse.populate('instructor');

  res.json({
    message: 'Course updated successfully',
    course: updatedCourse
  });
});

// @desc    Update internship
// @route   PUT /api/manager/internships/:id
// @access  Private (Manager)
const updateInternship = asyncHandler(async (req, res) => {
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
});

// @desc    Delete course
// @route   DELETE /api/manager/courses/:id
// @access  Private (Manager)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  await course.deleteOne();
  res.json({ message: 'Course deleted successfully' });
});

// @desc    Delete internship
// @route   DELETE /api/manager/internships/:id
// @access  Private (Manager)
const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ message: 'Internship not found' });
  }

  await internship.deleteOne();
  res.json({ message: 'Internship deleted successfully' });
});

// @desc    Get application stats
// @route   GET /api/manager/applications/stats
// @access  Private (Manager)
const getApplicationStats = asyncHandler(async (req, res) => {
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
});

// @desc    Get ALL dashboard data in a single request (consolidated endpoint)
// @route   GET /api/manager/dashboard
// @access  Private (Manager)
const getDashboardData = asyncHandler(async (req, res) => {
  const cacheKey = `dashboard_${req.user._id}`;
  const cached = dashboardCache.get(cacheKey);
  if (cached) return res.json(cached);

  const [
    applications, enrollments, appStats, enrollStats,
    courseCount, internshipCount, notificationSettings,
    managerRequests, courseRequests, serviceProviderRequests
  ] = await Promise.all([
    Application.find({ type: 'internship' })
      .populate('candidateId', 'name email')
      .select('candidateId referenceId status type appliedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),

    CourseEnrollment.find()
      .populate('candidate', 'name email')
      .populate('course', 'title')
      .select('candidate course status appliedAt paymentScreenshot')
      .sort({ appliedAt: -1 })
      .limit(50)
      .lean(),

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

    Course.countDocuments({ status: 'active' }),
    Internship.countDocuments({ status: 'open' }),
    NotificationSettings.findOne({ managerId: req.user._id }).lean(),
    ManagerRequest ? ManagerRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0),
    CourseRequest ? CourseRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0),
    ServiceProviderRequest ? ServiceProviderRequest.countDocuments({ status: 'pending' }) : Promise.resolve(0)
  ]);

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
});

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
