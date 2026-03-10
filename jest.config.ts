/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
    projects: [
        {
            displayName: "unit",
            testEnvironment: 'node',
            testMatch: ['<rootDir>/src/__tests__/unit/**/*.test.ts'],
            transform: {
                '^.+\\.ts$': ['@swc/jest'],
            },
        },
        {
            displayName: "integration",
            testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.ts'],
            testEnvironment: 'node',
            globalSetup: '<rootDir>/src/__tests__/integration/setup.ts',
            transform: {
                '^.+\\.ts$': ['@swc/jest'],
            },
        },
        {
            displayName: "e2e",
            testMatch: ['<rootDir>/src/__tests__/e2e/**/*.test.ts'],
            testEnvironment: 'node',
            transform: {
                '^.+\\.ts$': ['@swc/jest'],
            },
        }
    ]
};

export default config;
