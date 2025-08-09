'use strict';

var types = require('@bemedev/types');
var deepmergeTs = require('deepmerge-ts');
var equal = require('fast-deep-equal');

const _merge = deepmergeTs.deepmergeCustom({
    mergeArrays: false,
});
/**
 * A custom implement of `deepmerge-ts` ({@linkcode deepmergeCustom}) for better suitability with this library.
 * @param value The value to merge into.
 * @param mergers The values to merge with the original value
 * @returns The merged value, which is a new object containing the properties of the original value and the mergers.
 *
 * @see {@linkcode equal} for deep equality check
 * @see {@linkcode types} for partial type definition
 * @see {@linkcode NoInfer} for type inference utility
 * @see {@linkcode castings} for casting utilities
 */
const merge = (value, ...mergers) => {
    // #region Check performance
    const check1 = mergers.every(merger => equal(merger, value));
    if (check1)
        return value;
    // #endregion
    return types.castings.commons.any(_merge(value, ...mergers));
};

exports.merge = merge;
//# sourceMappingURL=merge.cjs.map
