const Service = require('../models/Service');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
    const { search, category, location, country, state, district, city, pincode } = req.query;
    let query = { status: 'active' };

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { location: searchRegex }
        ];
    }

    if (category && category !== 'All') {
        query.category = category;
    }

    if (country) query.country = country;
    if (state) query.state = state;
    if (district) query.district = district;
    if (city) query.city = city;
    if (pincode) query.pincode = pincode;

    if (location) {
        query.location = new RegExp(location, 'i');
    }

    const services = await Service.find(query)
        .populate('provider', 'name rating reviewsCount profilePicture')
        .sort({ createdAt: -1 })
        .lean();
    res.json(services);
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id)
        .populate('provider', 'name email phone secondaryPhone address experience problemsSolved rating reviewsCount profilePicture bio')
        .lean();
    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
});

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Service Provider only)
const createService = asyncHandler(async (req, res) => {
    const { title, description, category, price, image, location, country, state, district, city, pincode } = req.body;

    const service = await Service.create({
        title,
        description,
        category,
        provider: req.user._id,
        price,
        image,
        location,
        country,
        state,
        district,
        city,
        pincode
    });

    res.status(201).json(service);
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Service Provider only)
const updateService = asyncHandler(async (req, res) => {
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
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Service Provider only)
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'manager') {
        return res.status(401).json({ message: 'Not authorized' });
    }

    await service.deleteOne();
    res.json({ message: 'Service removed' });
});

// @desc    Get my services
// @route   GET /api/services/my
// @access  Private (Service Provider)
const getMyServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ provider: req.user._id })
        .sort({ createdAt: -1 })
        .lean();
    res.json(services);
});

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getMyServices
};
