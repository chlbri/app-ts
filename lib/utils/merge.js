import { castings } from '@bemedev/types';
import { deepmergeCustom } from 'deepmerge-ts';
import equal from 'fast-deep-equal';

const _merge = deepmergeCustom({
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
    return castings.commons.any(_merge(value, ...mergers));
};

export { merge };
//# sourceMappingURL=merge.js.map
