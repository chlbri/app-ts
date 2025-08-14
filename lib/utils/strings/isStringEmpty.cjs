'use strict';

var types_primitives = require('../../types/primitives.cjs');

/**
 * Checks if a given argument is a string and if it is empty (i.e., contains only whitespace).
 * @param arg The value to check.
 * @returns `true` if the argument is a string and is empty, otherwise `false`.
 *
 * @see {@linkcode isString} for checking if the argument is a string
 */
const isStringEmpty = (arg) => {
    return types_primitives.isString(arg) && arg.trim() === '';
};

exports.isStringEmpty = isStringEmpty;
//# sourceMappingURL=isStringEmpty.cjs.map
