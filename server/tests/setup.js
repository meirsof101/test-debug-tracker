// Global test setup
const mongoose = require('mongoose');

// Increase timeout for all async operations
jest.setTimeout(120000);

// Global test configuration
beforeAll(() => {
  // Suppress console.log during tests (optional)
  // console.log = jest.fn();
});

afterAll(async () => {
  // Ensure all connections are closed
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});