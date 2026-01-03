require('dotenv').config();
const mongoose = require('mongoose');

async function findData() {
  try {
    // Connect without specifying database
    const baseUri = process.env.MONGODB_URI.split('/').slice(0, -1).join('/');
    await mongoose.connect(baseUri + '/?retryWrites=true&w=majority&appName=Cluster0');
    
    console.log('Connected to MongoDB');
    
    // Get admin database to list all databases
    const adminDb = mongoose.connection.db.admin();
    const { databases } = await adminDb.listDatabases();
    
    console.log('\nAvailable databases:');
    databases.forEach(db => console.log(`- ${db.name}`));
    
    // Check each database for courses and internships collections
    console.log('\nChecking for data...\n');
    
    for (const db of databases) {
      const dbConnection = mongoose.connection.useDb(db.name);
      
      try {
        const coursesCount = await dbConnection.collection('courses').countDocuments();
        const internshipsCount = await dbConnection.collection('internships').countDocuments();
        
        if (coursesCount > 0 || internshipsCount > 0) {
          console.log(`📦 Database: ${db.name}`);
          console.log(`   Courses: ${coursesCount}`);
          console.log(`   Internships: ${internshipsCount}\n`);
        }
      } catch (err) {
        // Collection doesn't exist, skip
      }
    }
    
    await mongoose.connection.close();
    console.log('Search complete!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findData();
