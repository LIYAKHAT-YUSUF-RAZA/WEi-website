const User = require('../../models/User');
const Service = require('../../models/Service');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../../middleware/asyncHandler');

// @desc    Get all service providers
// @route   GET /api/manager/service-providers
// @access  Private (Manager only)
const getAllServiceProviders = asyncHandler(async (req, res) => {
    const providers = await User.find({ role: 'service_provider' })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();
    res.json(providers);
});

// @desc    Get a single service provider by ID
// @route   GET /api/manager/service-providers/:id
// @access  Private (Manager only)
const getServiceProvider = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'service_provider' })
        .select('-password')
        .lean();

    if (!provider) {
        return res.status(404).json({ message: 'Service Provider not found' });
    }
    res.json(provider);
});

// @desc    Create a new service provider manually
// @route   POST /api/manager/service-providers
// @access  Private (Manager only)
const createServiceProvider = asyncHandler(async (req, res) => {
    const { name, email, password, phone, secondaryPhone, address, experience, bio, image } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = new User({
        name, email, password,
        role: 'service_provider',
        phone, secondaryPhone, address, experience, bio,
        profilePicture: image || '',
        permissions: { canManageServices: true }
    });

    await newUser.save();

    res.status(201).json({
        message: 'Service Provider created successfully',
        provider: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }
    });
});

// @desc    Update a service provider
// @route   PUT /api/manager/service-providers/:id
// @access  Private (Manager only)
const updateServiceProvider = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'service_provider' });

    if (!provider) {
        return res.status(404).json({ message: 'Service Provider not found' });
    }

    const {
        name, email, phone, secondaryPhone, address, experience,
        bio, password, image, problemsSolved, rating, reviewsCount
    } = req.body;

    if (email && email !== provider.email) {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        provider.email = email;
    }

    if (name) provider.name = name;
    if (phone !== undefined) provider.phone = phone;
    if (secondaryPhone !== undefined) provider.secondaryPhone = secondaryPhone;
    if (address !== undefined) provider.address = address;
    if (experience !== undefined) provider.experience = experience;
    if (bio !== undefined) provider.bio = bio;
    if (image !== undefined) provider.profilePicture = image;

    if (problemsSolved !== undefined) provider.problemsSolved = problemsSolved;
    if (rating !== undefined) provider.rating = rating;
    if (reviewsCount !== undefined) provider.reviewsCount = reviewsCount;

    if (password) {
        const salt = await bcrypt.genSalt(10);
        provider.password = await bcrypt.hash(password, salt);
    }

    await provider.save();

    res.json({
        message: 'Service Provider updated successfully',
        provider: {
            _id: provider._id,
            name: provider.name,
            email: provider.email,
            phone: provider.phone
        }
    });
});

// @desc    Delete a service provider and associated services
// @route   DELETE /api/manager/service-providers/:id
// @access  Private (Manager only)
const deleteServiceProvider = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'service_provider' });

    if (!provider) {
        return res.status(404).json({ message: 'Service Provider not found' });
    }

    await Service.deleteMany({ provider: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Service Provider and all associated services deleted successfully' });
});

module.exports = {
    getAllServiceProviders,
    getServiceProvider,
    createServiceProvider,
    updateServiceProvider,
    deleteServiceProvider
};
