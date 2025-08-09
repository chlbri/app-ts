'use strict';

/**
 * Converts a value into a function that returns that value.
 * @param value of type {@linkcode T}, to convert into a function.
 * @returns A function that, when called, returns the original value.
 *
 * @see {@linkcode ToFunction_F} for the type definition
 */
const toFunction = value => () => value;

exports.toFunction = toFunction;
//# sourceMappingURL=toFunction.cjs.map
