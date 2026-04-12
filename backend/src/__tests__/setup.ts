// Jest test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

// Mock console methods to reduce noise
global.console.log = jest.fn();
global.console.info = jest.fn();
global.console.debug = jest.fn();
global.console.warn = jest.fn();

// Increase timeout for database operations
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Clean up any resources
  jest.clearAllMocks();
});
