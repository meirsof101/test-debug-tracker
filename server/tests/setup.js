// tests/setup.js
const mongoose = require('mongoose');

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  
  // Suppress MongoDB deprecation warnings
  mongoose.set('strictQuery', false);
});

afterAll(async () => {
  // Clean up any remaining connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// tests/globalSetup.js
module.exports = async () => {
  // Global setup that runs once before all tests
  console.log('Setting up test environment...');
  
  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
};

// tests/globalTeardown.js
const mongoose = require('mongoose');

module.exports = async () => {
  // Global teardown that runs once after all tests
  console.log('Tearing down test environment...');
  
  // Close any remaining MongoDB connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Force exit if needed
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};