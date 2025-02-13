const env = process.env.NODE_ENV;

export const isCI = process.env.CI === 'true';

export const IS_TEST = env === 'test';

export const IS_PRODUCTION = env === 'production';
