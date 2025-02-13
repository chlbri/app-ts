const env = process.env.NODE_ENV;

export const IS_TEST = env === 'test';
export const IS_PRODUCTION = env === 'production';
