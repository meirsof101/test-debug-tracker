// client/src/tests/setupTests.js
import '@testing-library/jest-dom';

// Mock fetch globally for all tests
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Reset fetch mock before each test
beforeEach(() => {
  fetch.mockClear();
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});