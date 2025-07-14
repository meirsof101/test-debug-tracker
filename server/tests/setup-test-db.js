const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const setupTestDB = async () => {
  try {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Test database setup complete');
    console.log(`📊 Database URI: ${mongoUri}`);
    
    // Create test database collections if needed
    await createTestCollections();
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    process.exit(1);
  }
};

const createTestCollections = async () => {
  // Create any initial collections or indexes here
  console.log('📋 Creating test collections...');
  
  // Example: Create users collection with index
  const db = mongoose.connection.db;
  await db.createCollection('users');
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  
  console.log('✅ Test collections created');
};

const teardownTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ Test database teardown complete');
  } catch (error) {
    console.error('❌ Test database teardown failed:', error);
  }
};

// If this file is run directly, set up the test database
if (require.main === module) {
  setupTestDB()
    .then(() => {
      console.log('🎯 Test database is ready for testing!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to set up test database:', error);
      process.exit(1);
    });
}

module.exports = {
  setupTestDB,
  teardownTestDB,
};