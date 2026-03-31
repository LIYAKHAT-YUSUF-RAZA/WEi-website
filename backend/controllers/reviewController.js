const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Candidate only)
const createReview = async (req, res) => {
    try {
        const { providerId, serviceId, rating, comment } = req.body;

        if (!providerId || !rating || !comment) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if provider exists
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'service_provider') {
            return res.status(404).json({ message: 'Service Provider not found' });
        }

        // Check if user already reviewed this provider (optional logic, kept simple for now)
        // const existingReview = await Review.findOne({ user: req.user._id, provider: providerId });
        // if (existingReview) {
        //   return res.status(400).json({ message: 'You have already reviewed this provider' });
        // }

        const review = await Review.create({
            user: req.user._id,
            provider: providerId,
            service: serviceId, // Optional
            rating,
            comment
        });

        // Update Provider Stats
        const stats = await Review.aggregate([
            { $match: { provider: mongoose.Types.ObjectId(providerId) } },
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
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/:providerId
// @access  Public
const getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
            .populate('user', 'name profilePicture')
            .populate('service', 'title')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createReview,
    getProviderReviews
};
