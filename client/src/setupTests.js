import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();  // <-- This is critical!
console.log('fetch.resetMocks is', fetch.resetMocks);

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

beforeEach(() => {
  fetch.resetMocks();   // This only works after enableMocks()
});

afterEach(() => {
  jest.restoreAllMocks();
});
