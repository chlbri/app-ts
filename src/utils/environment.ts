const env = process.env.NODE_ENV;

/**
 * Checks if we are in a CI environment.
 */
export const isCI = process.env.CI === 'true';

/**
 * Checks if we are in a development environment.
 */
export const IS_TEST = env === 'test';

/**
 * Checks if we are in a production environment.
 */
export const IS_PRODUCTION = env === 'production';
