const User = require('../../models/User');
const Service = require('../../models/Service');
const bcrypt = require('bcryptjs');

// @desc    Get all service providers
// @route   GET /api/manager/service-providers
// @access  Private (Manager only)
const getAllServiceProviders = async (req, res) => {
    try {
        const providers = await User.find({ role: 'service_provider' })
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single service provider by ID
// @route   GET /api/manager/service-providers/:id
// @access  Private (Manager only)
const getServiceProvider = async (req, res) => {
    try {
        const provider = await User.findOne({ _id: req.params.id, role: 'service_provider' })
            .select('-password')
            .lean();

        if (!provider) {
            return res.status(404).json({ message: 'Service Provider not found' });
        }
        res.json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new service provider manually
// @route   POST /api/manager/service-providers
// @access  Private (Manager only)
const createServiceProvider = async (req, res) => {
    try {
        const { name, email, password, phone, secondaryPhone, address, experience, bio, image } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role: 'service_provider',
            phone,
            secondaryPhone,
            address,
            experience,
            bio,
            profilePicture: image || '',
            permissions: { canManageServices: true }
        });

        // The pre-save hook in User model will hash the password
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service provider
// @route   PUT /api/manager/service-providers/:id
// @access  Private (Manager only)
const updateServiceProvider = async (req, res) => {
    try {
        const provider = await User.findOne({ _id: req.params.id, role: 'service_provider' });

        if (!provider) {
            return res.status(404).json({ message: 'Service Provider not found' });
        }

        const {
            name, email, phone, secondaryPhone, address, experience,
            bio, password, image, problemsSolved, rating, reviewsCount
        } = req.body;

        // Check email conflicts if email is changed
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

        // Allowed manual stats updates
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service provider and associated services
// @route   DELETE /api/manager/service-providers/:id
// @access  Private (Manager only)
const deleteServiceProvider = async (req, res) => {
    try {
        const provider = await User.findOne({ _id: req.params.id, role: 'service_provider' });

        if (!provider) {
            return res.status(404).json({ message: 'Service Provider not found' });
        }

        // 1. Delete all services offered by this provider
        await Service.deleteMany({ provider: req.params.id });

        // 2. Delete the service provider user document
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Service Provider and all associated services deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllServiceProviders,
    getServiceProvider,
    createServiceProvider,
    updateServiceProvider,
    deleteServiceProvider
};
