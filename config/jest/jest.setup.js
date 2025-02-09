// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console methods to keep test output clean
global.console = {
  ...console,
  // Uncomment to disable specific console methods during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '3000',
  MONGODB_URI: 'mongodb://localhost:27017/maily-test',
  ACCESS_TOKEN_SECRET: 'test-access-secret',
  REFRESH_TOKEN_SECRET: 'test-refresh-secret',
};
