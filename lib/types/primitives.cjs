'use strict';

require('@bemedev/decompose');
require('fast-deep-equal');
require('../utils/environment.cjs');
require('../utils/merge.cjs');
require('../constants/errors.cjs');
var utils_objects_checkKeys = require('../utils/objects/checkKeys.cjs');
require('@bemedev/types');
require('../utils/typings.cjs');

/**
 * Describer keys used to define the name and description of an object.
 */
const DESCRIBER_KEYS = ['name', 'description'];
const isFunction = (value) => {
    return typeof value === 'function';
};
const isString = value => {
    return typeof value === 'string';
};
const isDescriber = (arg) => {
    const out = utils_objects_checkKeys.checkKeys(arg, ...DESCRIBER_KEYS);
    return out;
};

exports.DESCRIBER_KEYS = DESCRIBER_KEYS;
exports.isDescriber = isDescriber;
exports.isFunction = isFunction;
exports.isString = isString;
//# sourceMappingURL=primitives.cjs.map
