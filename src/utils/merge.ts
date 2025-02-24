import { DeepPartial, t } from '@bemedev/types';
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

export const merge = <T = any>(
  value: T,
  ...mergers: (DeepPartial<NoInfer<T>> | NoInfer<T> | undefined)[]
): T => {
  // #region Check performance
  const check1 = mergers.every(merger => equal(merger, value));
  if (check1) return value;
  // #endregion

  return t.any(_merge(value, ...mergers));
};
