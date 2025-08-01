import { castings, type types } from '@bemedev/types';
import { deepmergeCustom } from 'deepmerge-ts';
import equal from 'fast-deep-equal';

declare module 'deepmerge-ts' {
  interface DeepMergeFunctionURItoKind<
    Ts extends Readonly<ReadonlyArray<unknown>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Fs extends DeepMergeFunctionsURIs,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    M,
  > {
    readonly FilterUndefined: FilterOut<Ts, null | undefined>;
  }
}

const _merge = deepmergeCustom<
  unknown,
  {
    DeepMergeArraysURI: 'DeepMergeLeafURI';
    DeepMergeFilterValuesURI: 'FilterUndefined';
  }
>({
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
export const merge = <T = any>(
  value: T,
  ...mergers: (types.DeepPartial<NoInfer<T>> | NoInfer<T> | undefined)[]
): T => {
  // #region Check performance
  const check1 = mergers.every(merger => equal(merger, value));
  if (check1) return value;
  // #endregion

  return castings.commons.any(_merge(value, ...mergers));
};
