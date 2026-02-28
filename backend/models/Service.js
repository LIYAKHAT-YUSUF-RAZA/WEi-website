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
            'Electrician',
            'AC Mechanic',
            'Bike Mechanic',
            'Painter',
            'Carpenter',
            'Cupboard Worker',
            'Cealing Worker',
            'Bike Rentals',
            'Car Rentals',
            'Bus Rentals',
            'Truck Rentals',
            'Embroidery Worker',
            'Stickering Worker',
            'Automobiles',
            'Wedding Planners'
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
    country: {
        type: String,
        trim: true,
        default: 'India'
    },
    state: {
        type: String,
        trim: true,
        index: true
    },
    district: {
        type: String,
        trim: true,
        index: true
    },
    city: {
        type: String,
        trim: true,
        index: true
    },
    pincode: {
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
