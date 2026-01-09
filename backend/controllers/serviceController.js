const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const services = await Service.find({ status: 'active' })
            .populate('provider', 'name rating reviewsCount profilePicture')
            .sort({ createdAt: -1 })
            .lean();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('provider', 'name email phone secondaryPhone address experience problemsSolved rating reviewsCount profilePicture bio')
            .lean();
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Service Provider only)
const createService = async (req, res) => {
    try {
        const { title, description, category, price, image, location } = req.body;

        const service = await Service.create({
            title,
            description,
            category,
            provider: req.user._id,
            price,
            image,
            location
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Service Provider only)
const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'manager') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Service Provider only)
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'manager') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await service.deleteOne();
        res.json({ message: 'Service removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my services
// @route   GET /api/services/my
// @access  Private (Service Provider)
const getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getMyServices
};
