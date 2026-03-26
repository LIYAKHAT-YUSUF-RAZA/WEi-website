const Review = require('../models/Review');
const User = require('../models/User');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Candidate only)
const createReview = asyncHandler(async (req, res) => {
    const { providerId, serviceId, rating, comment } = req.body;

    if (!providerId || !rating || !comment) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'service_provider') {
        return res.status(404).json({ message: 'Service Provider not found' });
    }

    const review = await Review.create({
        user: req.user._id,
        provider: providerId,
        service: serviceId,
        rating,
        comment
    });

    // Update Provider Stats
    const stats = await Review.aggregate([
        { $match: { provider: new mongoose.Types.ObjectId(providerId) } },
        {
            $group: {
                _id: '$provider',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        provider.rating = stats[0].averageRating.toFixed(1);
        provider.reviewsCount = stats[0].count;
        await provider.save();
    }

    res.status(201).json(review);
});

// @desc    Get reviews for a provider
// @route   GET /api/reviews/:providerId
// @access  Public
const getProviderReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ provider: req.params.providerId })
        .populate('user', 'name profilePicture')
        .populate('service', 'title')
        .sort({ createdAt: -1 });

    res.json(reviews);
});

module.exports = {
    createReview,
    getProviderReviews
};
