const mongoose = require('mongoose');
const CompanyInfo = require('../models/CompanyInfo');
const Course = require('../models/Course');
const Internship = require('../models/Internship');

const sampleCompany = {
    name: "WEintegrity",
    description: "Empowering the next generation of tech leaders through industry-relevant education and practical experience.",
    mission: "To bridge the gap between academic learning and industry requirements.",
    vision: "To be the leading platform for technical education and career development.",
    foundedYear: 2023,
    address: {
        street: "Tech Park Rd",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        zipCode: "560001"
    },
    contact: {
        email: "contact@weintegrity.com",
        phone: "+91 9876543210",
        website: "https://weintegrity.com"
    },
    socialMedia: {
        linkedin: "https://linkedin.com/company/weintegrity",
        twitter: "https://twitter.com/weintegrity",
        instagram: "https://instagram.com/weintegrity"
    }
};

const sampleCourses = [
    {
        title: "Full Stack Web Development",
        description: "Master the art of building modern web applications using the MERN stack (MongoDB, Express, React, Node.js).",
        category: "Development",
        duration: "6 months",
        level: "Intermediate",
        price: 4999,
        originalPrice: 8000,
        discountPercentage: 37,
        instructorDetails: {
            name: "Rahul Sharma",
            bio: "Senior Full Stack Developer with 8+ years of experience.",
            experience: "8 years",
            rating: 4.8
        },
        thumbnail: "",
        status: "active"
    },
    {
        title: "Data Science Fundamentals",
        description: "Introduction to Data Science, Python programming, and Machine Learning basics.",
        category: "Data Science",
        duration: "4 months",
        level: "Beginner",
        price: 3999,
        originalPrice: 6000,
        discountPercentage: 33,
        instructorDetails: {
            name: "Priya Patel",
            bio: "Data Scientist at a leading tech firm.",
            experience: "5 years",
            rating: 4.7
        },
        thumbnail: "",
        status: "active"
    },
    {
        title: "UI/UX Design Masterclass",
        description: "Learn to create beautiful and user-friendly interfaces using Figma and Adobe XD.",
        category: "Design",
        duration: "3 months",
        level: "Beginner",
        price: 2999,
        originalPrice: 5000,
        discountPercentage: 40,
        instructorDetails: {
            name: "Amit Kumar",
            bio: "Lead Designer with a passion for user-centric design.",
            experience: "6 years",
            rating: 4.9
        },
        thumbnail: "",
        status: "active"
    }
];

const sampleInternships = [
    {
        title: "Frontend Developer Intern",
        description: "Work on real-world React projects. Collaborate with the design team to implement responsive UI.",
        department: "Engineering",
        location: "Remote",
        type: "Remote",
        duration: "3 months",
        stipend: "₹10,000/month",
        requirements: ["HTML", "CSS", "JavaScript", "React Basics"],
        openings: 2,
        status: "open"
    },
    {
        title: "Digital Marketing Intern",
        description: "Assist in managing social media campaigns and content creation.",
        department: "Marketing",
        location: "Bangalore",
        type: "Hybrid",
        duration: "2 months",
        stipend: "₹8,000/month",
        requirements: ["Social Media Management", "Content Writing", "Basic SEO"],
        openings: 1,
        status: "open"
    },
    {
        title: "Backend Developer Intern",
        description: "Build robust APIs and manage database schemas using Node.js and MongoDB.",
        department: "Engineering",
        location: "Hyderabad",
        type: "On-site",
        duration: "6 months",
        stipend: "₹15,000/month",
        requirements: ["Node.js", "Express", "MongoDB", "REST APIs"],
        openings: 3,
        status: "open"
    }
];

const seedDatabase = async () => {
    try {
        // Check if data already exists
        const companyCount = await CompanyInfo.countDocuments();
        const courseCount = await Course.countDocuments();
        const internshipCount = await Internship.countDocuments();

        if (companyCount > 0 && courseCount > 0 && internshipCount > 0) {
            console.log('📦 Database already seeded.');
            return;
        }

        console.log('🌱 Seeding database...');

        // Clear existing data (optional, but good for in-memory)
        await CompanyInfo.deleteMany({});
        await Course.deleteMany({});
        await Internship.deleteMany({});

        // Insert new data
        await CompanyInfo.create(sampleCompany);
        await Course.insertMany(sampleCourses);
        await Internship.insertMany(sampleInternships);

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
    }
};

module.exports = seedDatabase;
