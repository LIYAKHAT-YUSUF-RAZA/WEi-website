const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Plumbing',
            'Electrical',
            'Cleaning',
            'Painting',
            'Carpentry',
            'Gardening',
            'Pest Control',
            'Appliance Repair',
            'Moving Services',
            'Event Management',
            'Beauty & Salon',
            'Tutoring',
            'Others',
            'Consulting',
            'Development',
            'Design',
            'Marketing',
            'Training',
            'Other'
        ]
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    price: {
        type: Number,
        min: 0
    },
    image: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Service', serviceSchema);
