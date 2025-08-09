import { type types } from '@bemedev/types';
declare module 'deepmerge-ts' {
    interface DeepMergeFunctionURItoKind<Ts extends Readonly<ReadonlyArray<unknown>>, Fs extends DeepMergeFunctionsURIs, M> {
        readonly FilterUndefined: FilterOut<Ts, null | undefined>;
    }
}
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
export declare const merge: <T = any>(value: T, ...mergers: (types.DeepPartial<NoInfer<T>> | NoInfer<T> | undefined)[]) => T;
//# sourceMappingURL=merge.d.ts.map