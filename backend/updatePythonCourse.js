const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const updatePythonCourse = async () => {
  try {
    await connectDB();

    // Find Python Programming course
    const pythonCourse = await Course.findOne({ title: 'Python Programming' });
    
    if (pythonCourse) {
      console.log('Python Programming course found. Updating pricing...');
      
      // Set simple pricing (no discount)
      pythonCourse.price = 5999;
      pythonCourse.originalPrice = 0;
      pythonCourse.discountPercentage = 0;
      
      await pythonCourse.save();
      console.log('✅ Python Programming course updated successfully!');
      console.log('\n📊 Course Details:');
      console.log('Title:', pythonCourse.title);
      console.log('Price: ₹' + pythonCourse.price);
      console.log('Original Price: ₹' + pythonCourse.originalPrice + ' (No discount)');
    } else {
      console.log('❌ Python Programming course not found. Creating new one...');
      
      const newPythonCourse = new Course({
        title: 'Python Programming',
        description: 'Python is a popular, high-level, general-purpose programming language known for its clear, readable syntax and versatility in web development, data science, automation, and more.',
        category: 'Other',
        duration: '8 weeks',
        level: 'Beginner',
        price: 5999,
        originalPrice: 0,
        discountPercentage: 0,
        maxStudents: 50,
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop',
        prerequisites: [
          'No prior programming experience required',
          'Basic computer skills',
          'Willingness to learn'
        ],
        learningOutcomes: [
          'Master Python fundamentals and syntax',
          'Build real-world applications',
          'Understand object-oriented programming',
          'Work with data structures and algorithms',
          'Prepare for advanced Python topics'
        ],
        instructor: {
          name: 'Python Expert',
          bio: 'Senior Python Developer with 8+ years of experience'
        }
      });

      await newPythonCourse.save();
      console.log('✅ Python Programming course created successfully!');
      console.log('\n📊 Course Details:');
      console.log('Title:', newPythonCourse.title);
      console.log('Price: ₹' + newPythonCourse.price);
      console.log('Original Price: ₹' + newPythonCourse.originalPrice + ' (No discount)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating course:', error);
    process.exit(1);
  }
};

updatePythonCourse();
