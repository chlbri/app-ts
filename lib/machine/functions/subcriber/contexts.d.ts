import { type Decompose, type Recompose } from '@bemedev/decompose';
import { type types } from '@bemedev/types';
export type AssignByBey_F = <T extends types.Ru, D extends Decompose<T>, K extends Extract<keyof D, string>, R extends D[K]>(obj: T, key: K, value: R) => T;
export interface AssignByKey {
    (obj: any, key: string, value: any): any;
    low: (obj: any, key: string, value: any) => any;
    typed: AssignByBey_F;
}
/**
 * Assigns a value to a path in an object.
 * @param obj The object to assign the value to
 * @param path The key to assign the value to, can be a nested key (e.g. 'a.b.c')
 * @param value The value to assign to the key
 * @returns The modified object with the value assigned to the specified key
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
export declare const assignByKey: AssignByKey;
export type GetByKey_F = <T extends types.Ru, K extends keyof Decompose<T>>(obj: T, key: Extract<K, string>) => Decompose<T>[K];
export interface GetByKey {
    (obj: any, key: string): any;
    low: (obj: any, key: string) => any;
    typed: GetByKey_F;
}
/**
 * Retrieves a value from an object by a specified key.
 * @param obj The object to retrieve the value from
 * @param key The key to retrieve the value for, can be a nested key (e.g. 'a.b.c')
 * @returns The value associated with the specified key in the object
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
export declare const getByKey: GetByKey;
export type MergeByKey_F = (obj: types.Ru) => <D extends Decompose<typeof obj>, K extends keyof D>(key: Extract<K, string>, value: D[K]) => Recompose<Pick<D, K>>;
export interface MergeByKey {
    (obj: any): (key: string, value: any) => any;
    low: (obj: any) => (key: string, value: any) => any;
    typed: MergeByKey_F;
}
/**
 * Creates a function that merges a value into an object at a specified key path.
 * @param obj The object to merge the value into
 * @returns A function that takes a key and a value, and merges the value into the object at the specified key path
 *
 * @see {@linkcode Decompose} for more details on object decomposition.
 */
export declare const mergeByKey: MergeByKey;
//# sourceMappingURL=contexts.d.ts.map