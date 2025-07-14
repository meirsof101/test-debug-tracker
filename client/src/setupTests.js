import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

afterEach(() => {
  jest.restoreAllMocks();
});
