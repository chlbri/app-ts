'use strict';

require('../../constants/errors.cjs');
var constants_strings = require('../../constants/strings.cjs');
require('@bemedev/decompose');
require('fast-deep-equal');
require('../../utils/environment.cjs');
var utils_merge = require('../../utils/merge.cjs');
require('@bemedev/types');
require('../../utils/typings.cjs');

/**
 * Recompose an object URL based on the provided shape and value.
 *
 * @param shape - The shape of the URL to recompose.
 * @param value - The value to recompose into the URL.
 * @returns A recomposed object URL.
 *
 * @see {@linkcode Url_F} for type details.
 * @see {@linkcode DEFAULT_DELIMITER} for the default delimiter used in the URL.
 */
const recomposeObjectUrl = (shape, value) => {
    const obj = {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { states, ...rest } = value;
    if (shape === constants_strings.DEFAULT_DELIMITER) {
        return rest;
    }
    const keys = shape.split(constants_strings.DEFAULT_DELIMITER).filter(str => str !== '');
    obj.states = {};
    if (keys.length === 1) {
        const key = keys.shift();
        obj.states[key] = value;
    }
    else {
        const key = keys.shift();
        const _value = recomposeObjectUrl(keys.join(constants_strings.DEFAULT_DELIMITER), value);
        obj.states[key] = _value;
    }
    return obj;
};
/**
 * Recompose a configuration object into a nested structure based on the provided shape.
 *
 * @param shape - The shape of the configuration to recompose.
 * @returns A recomposed configuration object.
 *
 * @see {@linkcode RecomposeConfig_F} for type details.
 * @see {@linkcode recomposeObjectUrl} for the implementation of the recomposition logic.
 * @see {@linkcode merge} for merging objects.
 */
const recomposeConfig = shape => {
    const entries = Object.entries(shape);
    const arr = [];
    entries.forEach(([key, value]) => {
        arr.push(recomposeObjectUrl(key, value));
    });
    const output = utils_merge.merge(...arr);
    return output;
};

exports.recomposeConfig = recomposeConfig;
//# sourceMappingURL=recompose.cjs.map
