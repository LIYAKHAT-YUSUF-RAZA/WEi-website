const mongoose = require('mongoose');
const Course = require('./models/Course');
const Internship = require('./models/Internship');
const User = require('./models/User');
const CourseEnrollment = require('./models/CourseEnrollment');
const Application = require('./models/Application');

require('dotenv').config();

/**
 * Performance optimization script for database
 * Creates indexes on frequently queried fields
 */
async function optimizeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!\n');

    console.log('Creating indexes for better query performance...\n');

    // Course indexes
    console.log('Optimizing Course collection...');
    await Course.collection.createIndex({ status: 1, createdAt: -1 });
    await Course.collection.createIndex({ category: 1 });
    await Course.collection.createIndex({ title: 'text', description: 'text' });
    console.log('✓ Course indexes created');

    // Internship indexes
    console.log('Optimizing Internship collection...');
    await Internship.collection.createIndex({ status: 1, createdAt: -1 });
    await Internship.collection.createIndex({ department: 1 });
    await Internship.collection.createIndex({ location: 1 });
    await Internship.collection.createIndex({ title: 'text', description: 'text' });
    console.log('✓ Internship indexes created');

    // User indexes
    console.log('Optimizing User collection...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    console.log('✓ User indexes created');

    // CourseEnrollment indexes
    console.log('Optimizing CourseEnrollment collection...');
    try {
      await CourseEnrollment.collection.createIndex({ candidate: 1, course: 1 });
    } catch (e) {
      if (e.code === 86) {
        console.log('  - Index candidate_1_course_1 already exists (skipped)');
      } else {
        throw e;
      }
    }
    await CourseEnrollment.collection.createIndex({ status: 1 });
    await CourseEnrollment.collection.createIndex({ appliedAt: -1 });
    console.log('✓ CourseEnrollment indexes created');

    // Application indexes
    console.log('Optimizing Application collection...');
    await Application.collection.createIndex({ candidateId: 1, type: 1 });
    await Application.collection.createIndex({ status: 1 });
    await Application.collection.createIndex({ appliedAt: -1 });
    console.log('✓ Application indexes created');

    console.log('\n✅ Database optimization complete!');
    console.log('All indexes have been created for faster query performance.\n');

    // Display all indexes
    console.log('Current indexes:');
    const collections = [Course, Internship, User, CourseEnrollment, Application];
    for (const model of collections) {
      const indexes = await model.collection.getIndexes();
      console.log(`\n${model.collection.name}:`);
      Object.keys(indexes).forEach(indexName => {
        console.log(`  - ${indexName}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error optimizing database:', error);
    process.exit(1);
  }
}

optimizeDatabase();
