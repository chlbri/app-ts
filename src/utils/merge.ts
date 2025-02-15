import { deepmergeCustom } from 'deepmerge-ts';

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

export const merge = deepmergeCustom<
  unknown,
  {
    DeepMergeArraysURI: 'DeepMergeLeafURI';
    DeepMergeFilterValuesURI: 'FilterUndefined';
  }
>({
  mergeArrays: false,
});
