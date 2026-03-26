const ServiceProviderRequest = require('../models/ServiceProviderRequest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create service provider request
// @route   POST /api/service-provider-requests
// @access  Public
const createRequest = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const requestExists = await ServiceProviderRequest.findOne({ email });
    if (requestExists) {
        if (requestExists.status === 'pending') {
            return res.status(400).json({ message: 'Your request is already pending approval' });
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const request = await ServiceProviderRequest.create({
        name,
        email,
        password: hashedPassword,
        phone,
        status: 'pending'
    });

    // Notify asynchronously
    setImmediate(async () => {
        try {
            const existingManagers = await User.find({ role: 'manager' });
            for (const manager of existingManagers) {
                try {
                    await emailService.sendNewServiceProviderRequestNotification(manager.email, { name, email, phone });
                } catch (e) {
                    console.error('Failed to notify manager:', manager.email);
                }
            }
            await emailService.sendServiceProviderRequestConfirmationToProvider(email, name);
        } catch (e) {
            console.error('Failed to send provider confirmation:', email);
        }
    });

    res.status(201).json({
        message: 'Your service provider account request has been submitted. You will receive an email once it is approved.',
        requestId: request._id
    });
});

// @desc    Get all requests
// @route   GET /api/service-provider-requests
// @access  Private (Manager only)
const getRequests = asyncHandler(async (req, res) => {
    const requests = await ServiceProviderRequest.find().sort({ createdAt: -1 }).lean();
    res.json(requests);
});

// @desc    Approve/Reject request
// @route   PUT /api/service-provider-requests/:id
// @access  Private (Manager only)
const updateRequest = asyncHandler(async (req, res) => {
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

        const userDoc = {
            name: request.name,
            email: request.email,
            password: request.password,
            role: 'service_provider',
            phone: request.phone,
            permissions: { canManageServices: true },
            createdAt: new Date()
        };

        await User.collection.insertOne(userDoc);

        setImmediate(async () => {
            try {
                await emailService.sendServiceProviderApprovalEmail(request.email, request.name);
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError.message);
            }
        });

    } else if (status === 'rejected') {
        setImmediate(async () => {
            try {
                await emailService.sendServiceProviderRejectionEmail(request.email, request.name);
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError.message);
            }
        });
    }

    await request.save();
    res.json({ message: `Request ${status}` });
});

module.exports = {
    createRequest,
    getRequests,
    updateRequest
};
