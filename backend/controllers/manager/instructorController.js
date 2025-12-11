const Instructor = require('../../models/Instructor');
const Course = require('../../models/Course');

// @desc    Get all instructors
// @route   GET /api/manager/instructors
// @access  Private (Manager)
const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().sort({ createdAt: -1 });
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single instructor
// @route   GET /api/manager/instructors/:id
// @access  Private (Manager)
const getInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new instructor
// @route   POST /api/manager/instructors
// @access  Private (Manager)
const createInstructor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      bio,
      image,
      experience,
      rating,
      specialization,
      socialLinks
    } = req.body;

    // Validate required fields
    if (!name || !email || !bio || !experience) {
      return res.status(400).json({ 
        message: 'Please provide name, email, bio, and experience' 
      });
    }

    // Check if email already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({ message: 'Instructor with this email already exists' });
    }

    const instructor = new Instructor({
      name,
      email,
      phone,
      bio,
      image: image || '',
      experience,
      rating: rating || 0,
      specialization: specialization || [],
      socialLinks: socialLinks || {}
    });

    const savedInstructor = await instructor.save();
    res.status(201).json({ 
      message: 'Instructor created successfully', 
      instructor: savedInstructor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update instructor
// @route   PUT /api/manager/instructors/:id
// @access  Private (Manager)
const updateInstructor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      bio,
      image,
      experience,
      rating,
      specialization,
      socialLinks,
      status
    } = req.body;

    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== instructor.email) {
      const existingInstructor = await Instructor.findOne({ email });
      if (existingInstructor) {
        return res.status(400).json({ message: 'Instructor with this email already exists' });
      }
    }

    // Update fields
    if (name) instructor.name = name;
    if (email) instructor.email = email;
    if (phone !== undefined) instructor.phone = phone;
    if (bio) instructor.bio = bio;
    if (image !== undefined) instructor.image = image;
    if (experience) instructor.experience = experience;
    if (rating !== undefined) instructor.rating = rating;
    if (specialization) instructor.specialization = specialization;
    if (socialLinks) instructor.socialLinks = socialLinks;
    if (status) instructor.status = status;

    const updatedInstructor = await instructor.save();
    res.json({ 
      message: 'Instructor updated successfully', 
      instructor: updatedInstructor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete instructor
// @route   DELETE /api/manager/instructors/:id
// @access  Private (Manager)
const deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Check if instructor is assigned to any courses
    const coursesCount = await Course.countDocuments({ instructor: req.params.id });
    if (coursesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete instructor. They are assigned to ${coursesCount} course(s). Please reassign those courses first.` 
      });
    }

    await Instructor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllInstructors,
  getInstructor,
  createInstructor,
  updateInstructor,
  deleteInstructor
};
