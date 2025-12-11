const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const addAWSCourse = async () => {
  try {
    await connectDB();

    // Check if AWS Cloud course already exists
    const existingCourse = await Course.findOne({ title: 'AWS Cloud' });
    if (existingCourse) {
      console.log('AWS Cloud course already exists. Updating with proper pricing...');
      
      existingCourse.originalPrice = 8500;
      existingCourse.price = 5500;
      existingCourse.discountPercentage = 35;
      
      await existingCourse.save();
      console.log('✅ AWS Cloud course updated successfully with pricing!');
    } else {
      // Create new AWS Cloud course
      const awsCourse = new Course({
        title: 'AWS Cloud',
        description: 'AWS (Amazon Web Services) is the world\'s leading, comprehensive cloud computing platform offering over 200 fully featured services from data centers globally. Master cloud architecture, deployment, and management.',
        category: 'Cloud Computing',
        duration: '8 weeks',
        level: 'Beginner',
        price: 5500,
        originalPrice: 8500,
        discountPercentage: 35,
        maxStudents: 50,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
        prerequisites: [
          'Basic understanding of computers and internet',
          'No prior cloud experience required',
          'Willingness to learn'
        ],
        learningOutcomes: [
          'Understand AWS core services and architecture',
          'Deploy and manage applications on AWS',
          'Implement security and compliance best practices',
          'Design cost-effective cloud solutions',
          'Prepare for AWS certification exams'
        ],
        instructor: {
          name: 'Cloud Expert',
          bio: 'AWS Certified Solutions Architect with 10+ years of experience'
        }
      });

      await awsCourse.save();
      console.log('✅ AWS Cloud course created successfully!');
    }

    console.log('\n📊 Course Details:');
    const course = await Course.findOne({ title: 'AWS Cloud' });
    console.log('Title:', course.title);
    console.log('Original Price: ₹' + course.originalPrice);
    console.log('Special Price: ₹' + course.price);
    console.log('Discount: ' + course.discountPercentage + '%');
    console.log('Savings: ₹' + (course.originalPrice - course.price));

    process.exit(0);
  } catch (error) {
    console.error('Error adding course:', error);
    process.exit(1);
  }
};

addAWSCourse();
