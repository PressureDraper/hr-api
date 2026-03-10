/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
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
    },
    {
      displayName: "e2e",
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/__tests__/e2e/**/*.test.ts'],
      testEnvironment: 'node',
    }
  ]
};

export default config;
