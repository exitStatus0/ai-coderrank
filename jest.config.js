const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
  // Transform ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(cheerio|htmlparser2|dom-serializer|domhandler|domutils|entities|css-select|css-what|nth-check|boolbase)/)',
  ],
};

module.exports = createJestConfig(customJestConfig);
