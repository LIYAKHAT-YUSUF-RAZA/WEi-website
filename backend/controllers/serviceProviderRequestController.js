const ServiceProviderRequest = require('../models/ServiceProviderRequest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');

// @desc    Create service provider request
// @route   POST /api/service-provider-requests
// @access  Public
const createRequest = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if there's already a pending request
        const requestExists = await ServiceProviderRequest.findOne({ email });
        if (requestExists) {
            if (requestExists.status === 'pending') {
                return res.status(400).json({ message: 'Your request is already pending approval' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create request
        const request = await ServiceProviderRequest.create({
            name,
            email,
            password: hashedPassword,
            phone,
            status: 'pending'
        });

        // Notify existing managers (Optional but good for UX)
        // const existingManagers = await User.find({ role: 'manager' });
        // if (existingManagers.length > 0) {
        //     for (const manager of existingManagers) {
        //         try {
        //             // Maybe reuse manager notification or create a new one
        //         } catch (e) {}
        //     }
        // }

        res.status(201).json({
            message: 'Your service provider account request has been submitted. You will receive an email once it is approved.',
            requestId: request._id
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A request with this email already exists.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all requests
// @route   GET /api/service-provider-requests
// @access  Private (Manager only)
const getRequests = async (req, res) => {
    try {
        const requests = await ServiceProviderRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject request
// @route   PUT /api/service-provider-requests/:id
// @access  Private (Manager only)
const updateRequest = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await ServiceProviderRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        request.status = status;
        request.approvedBy = req.user._id;

        if (status === 'approved') {
            request.approvedAt = Date.now();

            // Create User
            const userDoc = {
                name: request.name,
                email: request.email,
                password: request.password, // Already hashed
                role: 'service_provider',
                phone: request.phone,
                permissions: { canManageServices: true },
                createdAt: new Date()
            };

            await User.collection.insertOne(userDoc);

            // Send approval email
            try {
                await emailService.sendServiceProviderApprovalEmail(request.email, request.name);
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
            }

        } else if (status === 'rejected') {
            // Send rejection email
            try {
                await emailService.sendServiceProviderRejectionEmail(request.email, request.name);
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError);
            }
        }

        await request.save();
        res.json({ message: `Request ${status}` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequest,
    getRequests,
    updateRequest
};
