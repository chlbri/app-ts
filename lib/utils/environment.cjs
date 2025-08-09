'use strict';

const env = process.env.NODE_ENV;
/**
 * Checks if we are in a CI environment.
 */
const isCI = process.env.CI === 'true';
/**
 * Checks if we are in a development environment.
 */
const IS_TEST = env === 'test';
/**
 * Checks if we are in a production environment.
 */
const IS_PRODUCTION = env === 'production';

exports.IS_PRODUCTION = IS_PRODUCTION;
exports.IS_TEST = IS_TEST;
exports.isCI = isCI;
//# sourceMappingURL=environment.cjs.map
