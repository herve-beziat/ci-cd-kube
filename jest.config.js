module.exports = {
  testEnvironment: 'node',
  globalSetup: './tests/globalSetup.js',
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
  ],
  collectCoverageFrom: [
    'backend/**/*.js',
    'db/**/*.js',
    'frontend/response.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
