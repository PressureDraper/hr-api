/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",


  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  projects: [
    {
      displayName: "unit",
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/__tests__/unit/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: "integration",
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.ts'],
      testEnvironment: 'node',
      globalSetup: '<rootDir>/src/__tests__/integration/setup.ts',
    }
  ]
};

export default config;
