/**
 * Seed script: Creates one service provider account + one service per category
 * for Bhimavaram city (Andhra Pradesh, West Godavari district, pincode 534201).
 *
 * Run with: node utils/seedBhimavaram.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');

const LOCATION = {
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    city: 'Bhimavaram',
    pincode: '534201',
    location: 'Bhimavaram'
};

// 15 categories from the Service model enum
const serviceData = [
    {
        category: 'Electrician',
        providerName: 'Ravi Kumar',
        email: 'ravi.electrician.bhimavaram@gmail.com',
        phone: '9849001001',
        experience: 8,
        rating: 4.7,
        bio: 'Expert electrician with 8 years of experience in residential & commercial wiring.',
        title: 'Professional Electrician Services',
        description: 'Complete electrical solutions including wiring, switchboard repairs, fan installations, inverter setups, and short-circuit fixes. Available 24/7 for urgent calls.',
        price: 300,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop'
    },
    {
        category: 'AC Mechanic',
        providerName: 'Suresh Rao',
        email: 'suresh.ac.bhimavaram@gmail.com',
        phone: '9849001002',
        experience: 6,
        rating: 4.5,
        bio: 'Certified AC technician specialising in all brands. Service, repair, installation.',
        title: 'AC Service & Repair — All Brands',
        description: 'AC servicing, gas refilling, installation, PCB repairs, and annual maintenance contracts. Brands: Daikin, Voltas, LG, Samsung, Hitachi, Blue Star and more.',
        price: 499,
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=600&fit=crop'
    },
    {
        category: 'Bike Mechanic',
        providerName: 'Anil Babu',
        email: 'anil.bikemechanic.bhimavaram@gmail.com',
        phone: '9849001003',
        experience: 10,
        rating: 4.8,
        bio: 'Two-wheeler mechanic with 10 years experience across all brands.',
        title: 'Bike Repair & Servicing at Doorstep',
        description: 'Complete two-wheeler servicing: engine tune-up, oil change, chain adjustment, brake repair, battery replacement, and on-road assistance for all brands.',
        price: 250,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
    },
    {
        category: 'Painter',
        providerName: 'Venkat Reddy',
        email: 'venkat.painter.bhimavaram@gmail.com',
        phone: '9849001004',
        experience: 12,
        rating: 4.6,
        bio: 'Professional painter with expertise in interior and exterior painting.',
        title: 'Interior & Exterior House Painting',
        description: 'Quality painting services for homes and offices — wall putty, primer, texture painting, waterproofing, enamel painting on doors/windows. Free colour consultation.',
        price: 15,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop'
    },
    {
        category: 'Carpenter',
        providerName: 'Murali Krishna',
        email: 'murali.carpenter.bhimavaram@gmail.com',
        phone: '9849001005',
        experience: 9,
        rating: 4.7,
        bio: 'Skilled carpenter for custom furniture and home woodwork.',
        title: 'Custom Carpentry & Furniture Work',
        description: 'Custom furniture making, door/window repairs, wooden flooring, modular kitchen frames, bed frames, and all woodwork. Free home visit for estimates.',
        price: 500,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop'
    },
    {
        category: 'Cupboard Worker',
        providerName: 'Prasad Nair',
        email: 'prasad.cupboard.bhimavaram@gmail.com',
        phone: '9849001006',
        experience: 7,
        rating: 4.4,
        bio: 'Specialist in modular cupboards, wardrobes, and storage units.',
        title: 'Modular Wardrobe & Cupboard Installation',
        description: 'Design and installation of modular wardrobes, sliding doors, wall-mounted shelves, TV units, and storage solutions. All materials sourced with warranty.',
        price: 800,
        image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=600&fit=crop'
    },
    {
        category: 'Cealing Worker',
        providerName: 'Ramesh Varma',
        email: 'ramesh.ceiling.bhimavaram@gmail.com',
        phone: '9849001007',
        experience: 5,
        rating: 4.3,
        bio: 'Expert in false ceilings, POP work, and gypsum boards.',
        title: 'False Ceiling & POP Work',
        description: 'False ceiling installation using gypsum boards, PVC panels, metal grids, and POP designs. Also covers cornice work, cove lighting setups, and ceiling repairs.',
        price: 60,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
    },
    {
        category: 'Bike Rentals',
        providerName: 'Kiran Sai',
        email: 'kiran.bikerentals.bhimavaram@gmail.com',
        phone: '9849001008',
        experience: 4,
        rating: 4.5,
        bio: 'Affordable two-wheeler rentals for locals and travellers in Bhimavaram.',
        title: 'Hourly & Daily Bike Rentals — Bhimavaram',
        description: 'Self-drive bike rentals — scooters, Activa, Splendor, and sports bikes. Hourly, daily, and weekly packages. Valid licence required. Helmet provided free.',
        price: 200,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop'
    },
    {
        category: 'Car Rentals',
        providerName: 'Nagarjuna Rao',
        email: 'nagarjuna.carrentals.bhimavaram@gmail.com',
        phone: '9849001009',
        experience: 6,
        rating: 4.6,
        bio: 'Reliable car rentals with and without driver in Bhimavaram.',
        title: 'Car Rentals with/without Driver',
        description: 'Sedan, SUV, and hatchback rentals. Outstation trips, airport drops, weddings, and local use. 24/7 availability. Clean, well-maintained fleet.',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop'
    },
    {
        category: 'Bus Rentals',
        providerName: 'Srinivas Yadav',
        email: 'srinivas.busrentals.bhimavaram@gmail.com',
        phone: '9849001010',
        experience: 8,
        rating: 4.4,
        bio: 'Bus hire for tours, school trips, and corporate events.',
        title: 'Bus & Minibus Hire — Group Travel',
        description: 'Mini buses (15-seater), standard buses (35-seater) and luxury coaches (45-seater) for wedding processions, school tours, corporate outings, and pilgrimages.',
        price: 5000,
        image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop'
    },
    {
        category: 'Truck Rentals',
        providerName: 'Bhaskar Reddy',
        email: 'bhaskar.truck.bhimavaram@gmail.com',
        phone: '9849001011',
        experience: 10,
        rating: 4.3,
        bio: 'Goods transport and truck rental services in and around Bhimavaram.',
        title: 'Truck Rental for Goods Transport',
        description: 'Mini trucks, Tata Ace, and full-size trucks for household shifting, commercial goods transport, and agriculture produce logistics within Bhimavaram and outstation.',
        price: 3000,
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop'
    },
    {
        category: 'Embroidery Worker',
        providerName: 'Lakshmi Devi',
        email: 'lakshmi.embroidery.bhimavaram@gmail.com',
        phone: '9849001012',
        experience: 15,
        rating: 4.9,
        bio: 'Traditional and modern embroidery on sarees, blouses, and home textiles.',
        title: 'Hand & Machine Embroidery on Clothes',
        description: 'Elegant embroidery work on sarees, blouses, kurtas, and home furnishings. Specialises in Kalamkari, Kashmiri and thread-work designs. Custom orders welcome.',
        price: 500,
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop'
    },
    {
        category: 'Stickering Worker',
        providerName: 'Gopi Krishna',
        email: 'gopi.stickering.bhimavaram@gmail.com',
        phone: '9849001013',
        experience: 5,
        rating: 4.5,
        bio: 'Vehicle stickering and vinyl wrap specialist.',
        title: 'Vehicle Stickering & Vinyl Wraps',
        description: 'Full and partial vehicle wraps, logo stickering, shop branding, office glass frosting, wall murals, and custom vinyl decal printing for cars, bikes, and vans.',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop'
    },
    {
        category: 'Automobiles',
        providerName: 'Chandra Sekhar',
        email: 'chandra.automobiles.bhimavaram@gmail.com',
        phone: '9849001014',
        experience: 11,
        rating: 4.6,
        bio: 'Multi-brand automobile servicing and repairs.',
        title: 'Multi-Brand Car Service Centre',
        description: 'Complete car service: engine oil change, wheel alignment, tyre rotation, denting & painting, AC service, and electrical repairs for all 4-wheeler brands.',
        price: 800,
        image: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800&h=600&fit=crop'
    },
    {
        category: 'Wedding Planners',
        providerName: 'Sri Events & Decor',
        email: 'srievents.bhimavaram@gmail.com',
        phone: '9849001015',
        experience: 7,
        rating: 4.8,
        bio: 'End-to-end wedding planning and decoration in Bhimavaram.',
        title: 'Complete Wedding Planning & Decoration',
        description: 'Full wedding management: venue booking, floral decoration, catering coordination, photography, return gifts, bridal makeup, and invitation design. Trusted by 200+ families.',
        price: 50000,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop'
    }
];

const seed = async () => {
    // Connect to DB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not set in .env');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const data of serviceData) {
        // Check if this provider email already exists
        let provider = await User.findOne({ email: data.email });

        if (!provider) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Bhimavaram@123', salt);

            provider = await User.create({
                name: data.providerName,
                email: data.email,
                password: hashedPassword,
                role: 'service_provider',
                phone: data.phone,
                experience: data.experience,
                rating: data.rating,
                reviewsCount: Math.floor(Math.random() * 40) + 10,
                problemsSolved: Math.floor(Math.random() * 100) + 20,
                bio: data.bio,
                address: `Bhimavaram, West Godavari, Andhra Pradesh - 534201`
            });
            console.log(`👤 Created provider: ${data.providerName} (${data.email})`);
        } else {
            console.log(`⏭️  Provider already exists: ${data.email}`);
        }

        // Check if service for this provider+category already exists
        const existingService = await Service.findOne({
            provider: provider._id,
            category: data.category
        });

        if (!existingService) {
            await Service.create({
                title: data.title,
                description: data.description,
                category: data.category,
                provider: provider._id,
                price: data.price,
                image: data.image,
                ...LOCATION,
                status: 'active'
            });
            console.log(`✅ Created service: [${data.category}] ${data.title}`);
            created++;
        } else {
            console.log(`⏭️  Service already exists for category: ${data.category}`);
            skipped++;
        }
    }

    console.log(`\n🎉 Done! Created: ${created} services, Skipped: ${skipped}`);
    console.log('\n📋 Provider Login Credentials (password: Bhimavaram@123):');
    serviceData.forEach(d => console.log(`   ${d.category.padEnd(20)} → ${d.email}`));

    await mongoose.disconnect();
    process.exit(0);
};

seed().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
