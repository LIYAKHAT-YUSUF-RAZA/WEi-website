/**
 * Seed script: Creates one service provider account + one service per category
 * for EVERY city/town in the West Godavari district.
 *
 * Run with: node utils/seedWestGodavari.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const locationsData = require('../data/locations.json');

// Get all West Godavari locations (assuming the key is 'west godavari' or similar)
// Note: keys in locations.json might be lowercase
const wgKey = Object.keys(locationsData).find(k => k.toLowerCase() === 'west godavari');
if (!wgKey) {
    console.error("❌ Could not find 'West Godavari' in locations.json");
    process.exit(1);
}

const wgLocations = locationsData[wgKey];
console.log(`Found ${wgLocations.length} locations in West Godavari.`);

const CATEGORIES = [
    'Electrician', 'AC Mechanic', 'Bike Mechanic', 'Painter', 'Carpenter',
    'Cupboard Worker', 'Cealing Worker', 'Bike Rentals', 'Car Rentals',
    'Bus Rentals', 'Truck Rentals', 'Embroidery Worker', 'Stickering Worker',
    'Automobiles', 'Wedding Planners'
];

// Base descriptions to make it look realistic
const BASE_DATA = {
    'Electrician': { price: 300, desc: 'Complete electrical solutions', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop' },
    'AC Mechanic': { price: 499, desc: 'AC Service & repair all brands', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=600&fit=crop' },
    'Bike Mechanic': { price: 250, desc: 'Two-wheeler repair at doorstep', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
    'Painter': { price: 15, desc: 'Interior & exterior painting', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop' },
    'Carpenter': { price: 500, desc: 'Custom furniture & woodwork', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop' },
    'Cupboard Worker': { price: 800, desc: 'Modular wardrobe installation', img: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=600&fit=crop' },
    'Cealing Worker': { price: 60, desc: 'False ceiling & POP work', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop' },
    'Bike Rentals': { price: 200, desc: 'Hourly & daily bike rentals', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop' },
    'Car Rentals': { price: 1200, desc: 'Car rentals with/out driver', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop' },
    'Bus Rentals': { price: 5000, desc: 'Bus hire for group travel', img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop' },
    'Truck Rentals': { price: 3000, desc: 'Truck rentals for transport', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop' },
    'Embroidery Worker': { price: 500, desc: 'Hand & machine embroidery', img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop' },
    'Stickering Worker': { price: 1500, desc: 'Vehicle stickering & wraps', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop' },
    'Automobiles': { price: 800, desc: 'Multi-brand car service', img: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800&h=600&fit=crop' },
    'Wedding Planners': { price: 50000, desc: 'Complete wedding planning', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop' }
};

const sanitizeStr = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const seed = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not set in .env');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('WestGodavari@123', salt);

    let createdServices = 0;
    let skippedServices = 0;
    let createdUsers = 0;

    console.log('⏳ Seeding data... This may take a few minutes for many locations.');

    // Process locations in batches to avoid overwhelming memory/DB if there are hundreds
    for (let i = 0; i < wgLocations.length; i++) {
        const loc = wgLocations[i];
        const cityName = loc.name;
        const pincode = loc.pincode;
        const safeCity = sanitizeStr(cityName);

        // Skip bhimavaram as it was already seeded specifically in the previous step
        // Though we can just let it run and it will create more or skip if emails exist.
        // Actually, let's keep it robust. If the email exists, it just skips creating user.

        for (const category of CATEGORIES) {
            const safeCat = sanitizeStr(category);
            const email = `${safeCat}.${safeCity}.${pincode}@gmail.com`.toLowerCase();

            // Check if provider exists
            let provider = await User.findOne({ email });

            if (!provider) {
                provider = await User.create({
                    name: `${category} Pro ${cityName}`,
                    email: email,
                    password: hashedPassword,
                    role: 'service_provider',
                    phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`, // Random 10 digit starting with 99
                    experience: Math.floor(Math.random() * 15) + 1,
                    rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1), // 4.0 to 5.0
                    reviewsCount: Math.floor(Math.random() * 50) + 5,
                    problemsSolved: Math.floor(Math.random() * 200) + 10,
                    bio: `Professional ${category} serving ${cityName} and surrounding areas.`,
                    address: `${cityName}, West Godavari, Andhra Pradesh - ${pincode}`
                });
                createdUsers++;
            }

            // Check if service exists for this provider
            const existingService = await Service.findOne({
                provider: provider._id,
                category: category
            });

            if (!existingService) {
                const base = BASE_DATA[category];
                await Service.create({
                    title: `Expert ${category} in ${cityName}`,
                    description: `${base.desc} in ${cityName}. Fast, reliable, and affordable services.`,
                    category: category,
                    provider: provider._id,
                    price: base.price,
                    image: base.img,
                    country: 'India',
                    state: 'Andhra Pradesh',
                    district: 'West Godavari',
                    city: cityName,
                    location: cityName,
                    pincode: pincode,
                    status: 'active'
                });
                createdServices++;
            } else {
                skippedServices++;
            }
        }

        if ((i + 1) % 10 === 0) {
            console.log(`... Processed ${i + 1}/${wgLocations.length} locations`);
        }
    }

    console.log(`\n🎉 Seeding Complete!`);
    console.log(`👤 Users Created: ${createdUsers}`);
    console.log(`🛠️ Services Created: ${createdServices}`);
    console.log(`⏭️ Services Skipped (already existed): ${skippedServices}`);
    console.log(`\n🔑 Login Password for all new accounts is: WestGodavari@123`);
    console.log(`📧 Email format: [category_without_spaces].[city_without_spaces].[pincode]@gmail.com`);
    console.log(`   Example: electrician.eluru.534001@gmail.com`);

    await mongoose.disconnect();
    process.exit(0);
};

seed().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
